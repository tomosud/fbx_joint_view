// カメラモーションキャプチャシステム
import * as THREE from 'three';

export class MotionCapture {
  constructor(camera) {
    this.camera = camera;
    this.isRecording = false;
    this.recordStartTime = 0;
    this.animationStartTime = 0;
    this.cameraMotionData = [];
    this.animationDuration = 0;
    this.currentAction = null;
    
    this.recordBtn = document.getElementById('recordBtn');
    this.stopBtn = document.getElementById('stopBtn');
    this.exportBtn = document.getElementById('exportBtn');
    this.playbackBtn = document.getElementById('playbackBtn');
    this.recordStatus = document.getElementById('recordStatus');
    this.recordTime = document.getElementById('recordTime');
    
    this.isPlayingBack = false;
    this.playbackStartTime = 0;
    this.playbackMixer = null;
    this.originalCameraPosition = new THREE.Vector3();
    this.originalCameraQuaternion = new THREE.Quaternion();
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.recordBtn.addEventListener('click', () => this.startRecording());
    this.stopBtn.addEventListener('click', () => this.stopRecording());
    this.exportBtn.addEventListener('click', () => this.exportCameraMotion());
    this.playbackBtn.addEventListener('click', () => this.togglePlayback());

    // キーボードショートカット
    document.addEventListener('keydown', (event) => {
      if (event.code === 'KeyR') {
        // FPSモード時のみ記録操作
        if (window.cameraControls && window.cameraControls.getCurrentMode() === 'fps') {
          if (!this.isRecording) {
            this.startRecording();
          } else {
            this.stopRecording();
          }
          event.preventDefault();
        }
      }
    });
  }

  setAnimationData(action, duration) {
    this.currentAction = action;
    this.animationDuration = duration;
  }

  startRecording() {
    if (!window.cameraControls || window.cameraControls.getCurrentMode() !== 'fps') return;
    
    // アニメーションを再生開始
    if (this.currentAction && !this.currentAction.isRunning()) {
      this.currentAction.play();
    }
    if (this.currentAction) {
      this.currentAction.paused = false;
    }
    
    this.isRecording = true;
    this.recordStartTime = performance.now();
    this.animationStartTime = this.currentAction ? this.currentAction.time : 0;
    this.cameraMotionData = [];
    
    this.recordBtn.disabled = true;
    this.stopBtn.disabled = false;
    this.recordStatus.textContent = '記録中...';
    this.recordBtn.style.background = '#888';
    this.stopBtn.style.background = '#f44336';
    
    console.log('カメラモーション記録開始, アニメーション時間:', this.animationStartTime);
  }

  stopRecording() {
    this.isRecording = false;
    
    this.recordBtn.disabled = false;
    this.stopBtn.disabled = true;
    this.recordStatus.textContent = `記録完了: ${this.cameraMotionData.length}フレーム`;
    this.recordBtn.style.background = '#f44336';
    this.stopBtn.style.background = '#555';
    
    // 書き出しボタンとプレイバックボタンを有効化
    this.exportBtn.disabled = false;
    this.playbackBtn.disabled = false;
    this.exportBtn.style.background = '#2196F3';
    this.playbackBtn.style.background = '#4CAF50';
    
    console.log('カメラモーション記録完了:', this.cameraMotionData.length, 'フレーム');
  }

  update(deltaTime) {
    // カメラモーション記録
    if (this.isRecording && window.cameraControls && window.cameraControls.getCurrentMode() === 'fps' && window.cameraControls.isFPSLocked()) {
      const currentTime = (performance.now() - this.recordStartTime) / 1000;
      const currentAnimationTime = this.animationStartTime + currentTime;
      
      this.cameraMotionData.push({
        time: currentTime,
        animationTime: currentAnimationTime,
        position: this.camera.position.clone(),
        quaternion: this.camera.quaternion.clone()
      });
      
      const totalTime = this.animationDuration > 0 ? this.animationDuration : currentAnimationTime;
      this.recordTime.textContent = `${currentTime.toFixed(1)}s / ${totalTime.toFixed(1)}s`;
    }

    // カメラモーション再生
    if (this.isPlayingBack && this.cameraMotionData.length > 0) {
      const playbackTime = (performance.now() - this.playbackStartTime) / 1000;
      const targetFrame = this.findFrameAtTime(playbackTime);
      
      if (targetFrame) {
        this.camera.position.copy(targetFrame.position);
        this.camera.quaternion.copy(targetFrame.quaternion);
        
        // アニメーション時間を同期
        if (this.currentAction) {
          this.currentAction.time = targetFrame.animationTime;
        }
      }
      
      // 再生終了チェック
      const lastFrame = this.cameraMotionData[this.cameraMotionData.length - 1];
      if (playbackTime >= lastFrame.time) {
        this.stopPlayback();
      }
    }
  }

  findFrameAtTime(time) {
    if (this.cameraMotionData.length === 0) return null;
    
    // 線形補間で位置を計算
    for (let i = 0; i < this.cameraMotionData.length - 1; i++) {
      const currentFrame = this.cameraMotionData[i];
      const nextFrame = this.cameraMotionData[i + 1];
      
      if (time >= currentFrame.time && time <= nextFrame.time) {
        const t = (time - currentFrame.time) / (nextFrame.time - currentFrame.time);
        
        return {
          position: new THREE.Vector3().lerpVectors(currentFrame.position, nextFrame.position, t),
          quaternion: new THREE.Quaternion().slerpQuaternions(currentFrame.quaternion, nextFrame.quaternion, t),
          animationTime: THREE.MathUtils.lerp(currentFrame.animationTime, nextFrame.animationTime, t)
        };
      }
    }
    
    // 範囲外の場合は最初または最後のフレームを返す
    if (time <= this.cameraMotionData[0].time) {
      return this.cameraMotionData[0];
    } else {
      return this.cameraMotionData[this.cameraMotionData.length - 1];
    }
  }

  togglePlayback() {
    if (this.cameraMotionData.length === 0) {
      alert('記録されたカメラモーションがありません');
      return;
    }

    if (!this.isPlayingBack) {
      this.startPlayback();
    } else {
      this.stopPlayback();
    }
  }

  startPlayback() {
    // カメラを軌道モードに切り替え
    if (window.cameraControls) {
      window.cameraControls.switchToOrbit();
    }
    
    // 現在のカメラ位置を保存
    this.originalCameraPosition.copy(this.camera.position);
    this.originalCameraQuaternion.copy(this.camera.quaternion);
    
    this.isPlayingBack = true;
    this.playbackStartTime = performance.now();
    
    // アニメーションを開始位置に設定して再生
    if (this.currentAction) {
      this.currentAction.time = this.animationStartTime;
      this.currentAction.play();
      this.currentAction.paused = false;
    }
    
    this.playbackBtn.textContent = '⏸ 停止';
    this.playbackBtn.style.background = '#ff9800';
    
    console.log('カメラモーション再生開始');
  }

  stopPlayback() {
    this.isPlayingBack = false;
    
    // カメラ位置を復元
    this.camera.position.copy(this.originalCameraPosition);
    this.camera.quaternion.copy(this.originalCameraQuaternion);
    
    this.playbackBtn.textContent = '▶ 再生';
    this.playbackBtn.style.background = '#4CAF50';
    
    console.log('カメラモーション再生停止');
  }

  async exportCameraMotion() {
    if (this.cameraMotionData.length === 0) {
      alert('記録されたカメラモーションがありません');
      return;
    }

    const { GLTFExporter } = await import('three/addons/exporters/GLTFExporter.js');

    // アニメーション全体の長さを使用
    const totalDuration = this.animationDuration > 0 ? this.animationDuration : this.cameraMotionData[this.cameraMotionData.length - 1].animationTime;
    
    // 位置と回転のトラックを作成
    const positionTimes = [];
    const positionValues = [];
    const quaternionTimes = [];
    const quaternionValues = [];
    
    // 最初のフレーム（0秒時点）
    const firstFrame = this.cameraMotionData[0];
    positionTimes.push(0);
    positionValues.push(firstFrame.position.x, firstFrame.position.y, firstFrame.position.z);
    quaternionTimes.push(0);
    quaternionValues.push(firstFrame.quaternion.x, firstFrame.quaternion.y, firstFrame.quaternion.z, firstFrame.quaternion.w);
    
    // 記録されたフレーム
    this.cameraMotionData.forEach(frame => {
      positionTimes.push(frame.animationTime);
      positionValues.push(frame.position.x, frame.position.y, frame.position.z);
      
      quaternionTimes.push(frame.animationTime);
      quaternionValues.push(frame.quaternion.x, frame.quaternion.y, frame.quaternion.z, frame.quaternion.w);
    });
    
    // 最後のフレーム（全体の終了時点）
    const lastFrame = this.cameraMotionData[this.cameraMotionData.length - 1];
    if (totalDuration > lastFrame.animationTime) {
      positionTimes.push(totalDuration);
      positionValues.push(lastFrame.position.x, lastFrame.position.y, lastFrame.position.z);
      quaternionTimes.push(totalDuration);
      quaternionValues.push(lastFrame.quaternion.x, lastFrame.quaternion.y, lastFrame.quaternion.z, lastFrame.quaternion.w);
    }

    // アニメーショントラックを作成
    const positionTrack = new THREE.VectorKeyframeTrack('.position', positionTimes, positionValues);
    const rotationTrack = new THREE.QuaternionKeyframeTrack('.quaternion', quaternionTimes, quaternionValues);
    
    // アニメーションクリップを作成
    const clip = new THREE.AnimationClip('CameraMotion', totalDuration, [positionTrack, rotationTrack]);
    
    // ダミーオブジェクトを作成してアニメーションを適用
    const dummyCamera = new THREE.Object3D();
    dummyCamera.name = 'CameraMotion';
    
    // GLTFExporterでエクスポート
    const exporter = new GLTFExporter();
    const exportScene = new THREE.Scene();
    exportScene.add(dummyCamera);
    exportScene.animations = [clip];
    
    exporter.parse(
      exportScene,
      (gltf) => {
        // ファイルダウンロード
        const output = JSON.stringify(gltf, null, 2);
        const blob = new Blob([output], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `camera_motion_${Date.now()}.gltf`;
        link.click();
        
        URL.revokeObjectURL(url);
        console.log(`カメラモーション glTF エクスポート完了: ${totalDuration.toFixed(1)}秒, ${this.cameraMotionData.length}フレーム`);
      },
      { animations: [clip] }
    );
  }

  hasRecordedData() {
    return this.cameraMotionData.length > 0;
  }
}