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
    
    this.refreshElements();
    
    // カメラ表示用のオブジェクト配列
    this.cameraVisualizationObjects = [];
    
    this.isPlayingBack = false;
    this.playbackStartTime = 0;
    this.playbackMixer = null;
    this.originalCameraPosition = new THREE.Vector3();
    this.originalCameraQuaternion = new THREE.Quaternion();
    
    // プレイ時の動的カメラ表示用
    this.currentCameraVisualization = null;
    
    this.setupEventListeners();
  }

  // DOM要素の再取得メソッド
  refreshElements() {
    console.log('refreshElements called');
    this.recordStatus = document.getElementById('recordStatus');
    this.recordTime = document.getElementById('recordTime');
    
    if (!this.recordStatus) {
      console.error('recordStatus element not found during refresh');
    }
    if (!this.recordTime) {
      console.error('recordTime element not found during refresh');
    }
  }

  setupEventListeners() {
    // キーボードショートカット
    document.addEventListener('keydown', (event) => {
      switch (event.code) {
        case 'KeyP': // Play/Stop animation
          // キャプチャ中はアニメーション制御をブロック
          if (!this.isRecording && window.toggleAnimation) {
            window.toggleAnimation();
          }
          event.preventDefault();
          break;
        case 'KeyO': // Capture/Stop recording
          this.toggleRecording();
          event.preventDefault();
          break;
        case 'KeyI': // Camera playback toggle
          this.togglePlayback();
          event.preventDefault();
          break;
        case 'KeyU': // Export glTF
          this.exportCameraMotion();
          event.preventDefault();
          break;
        case 'KeyK': // Toggle coordinate system
          this.toggleCoordinateSystem();
          event.preventDefault();
          break;
        case 'KeyL': // Load FBX
          this.loadFBXFile();
          event.preventDefault();
          break;
      }
    });
  }

  toggleCoordinateSystem() {
    const checkbox = document.getElementById('convertToYUp');
    checkbox.checked = !checkbox.checked;
    
    // 座標系変更イベントを発火
    const event = new Event('change');
    checkbox.dispatchEvent(event);
    
    console.log('座標系切り替え:', checkbox.checked ? 'Y-up' : 'Z-up');
  }

  loadFBXFile() {
    const fileInput = document.getElementById('fbxFileInput');
    fileInput.click();
  }

  toggleRecording() {
    console.log('toggleRecording called, current state:', this.isRecording);
    if (!this.isRecording) {
      console.log('Starting recording...');
      this.startRecording();
    } else {
      console.log('Stopping recording...');
      this.stopRecording();
    }
  }

  togglePlayback() {
    if (!this.isPlayingBack) {
      this.startPlayback();
    } else {
      this.stopPlayback();
    }
  }

  setAnimationData(action, duration) {
    this.currentAction = action;
    this.animationDuration = duration;
  }

  startRecording() {
    console.log('startRecording called');
    console.log('recordStatus element:', this.recordStatus);
    
    // ポインターロックが無効な場合は自動で有効にする
    if (!window.cameraControls || !window.cameraControls.isFPSLocked()) {
      if (window.cameraControls) {
        window.cameraControls.lockPointer();
      }
    }
    
    // アニメーションが停止中の場合は自動で再生開始
    if (this.currentAction && this.currentAction.paused) {
      console.log('アニメーション停止中のため自動再生開始');
      if (window.toggleAnimation) {
        window.toggleAnimation();
      }
    }
    
    this.isRecording = true;
    this.recordStartTime = performance.now();
    this.animationStartTime = this.currentAction ? this.currentAction.time : 0;
    this.cameraMotionData = [];
    
    console.log('Setting recordStatus to record');
    if (this.recordStatus) {
      this.recordStatus.textContent = 'record';
      console.log('recordStatus updated to:', this.recordStatus.textContent);
    } else {
      console.error('recordStatus element not found!');
    }
    
    // 赤枠表示
    const recordingFrame = document.getElementById('recordingFrame');
    console.log('recordingFrame element:', recordingFrame);
    if (recordingFrame) {
      recordingFrame.style.display = 'block';
      console.log('Red frame should be visible');
    } else {
      console.error('recordingFrame element not found!');
    }
    
    console.log('カメラモーション記録開始, アニメーション時間:', this.animationStartTime);
  }

  stopRecording() {
    this.isRecording = false;
    
    // DOM要素参照を更新してから操作
    this.refreshElements();
    
    if (this.recordStatus) {
      this.recordStatus.textContent = 'stop';
    }
    
    // 赤枠非表示
    const recordingFrame = document.getElementById('recordingFrame');
    if (recordingFrame) {
      recordingFrame.style.display = 'none';
    }
    
    // カメラの軌跡を可視化
    this.visualizeCameraPath();
    
    console.log('カメラモーション記録完了:', this.cameraMotionData.length, 'フレーム');
  }

  update(deltaTime) {
    // カメラモーション記録
    if (this.isRecording) {
      const currentTime = (performance.now() - this.recordStartTime) / 1000;
      const currentAnimationTime = this.animationStartTime + currentTime;
      
      this.cameraMotionData.push({
        time: currentTime,
        animationTime: currentAnimationTime,
        position: this.camera.position.clone(),
        quaternion: this.camera.quaternion.clone()
      });
      
      this.recordTime.textContent = `${currentTime.toFixed(1)}s`;
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
        
        // 動的カメラ表示を更新
        this.updateCurrentCameraVisualization(this.camera.position, this.camera.quaternion);
      }
      
      // ループ再生チェック
      const lastFrame = this.cameraMotionData[this.cameraMotionData.length - 1];
      if (playbackTime >= lastFrame.time) {
        this.playbackStartTime = performance.now(); // ループリスタート
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

  // togglePlayback メソッドは削除（個別の start/stop メソッドを使用）

  startPlayback() {
    if (this.cameraMotionData.length === 0) {
      alert('記録されたカメラモーションがありません');
      return;
    }

    // カメラ再生中はポインターロックを維持（ショートカットキーのため）
    
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
    
    // プレイ時の動的カメラ表示を作成
    this.createCurrentCameraVisualization();
    
    console.log('カメラモーション再生開始');
  }

  stopPlayback() {
    this.isPlayingBack = false;
    
    // カメラ位置を復元
    this.camera.position.copy(this.originalCameraPosition);
    this.camera.quaternion.copy(this.originalCameraQuaternion);
    
    // 動的カメラ表示を削除
    this.removeCurrentCameraVisualization();
    
    // ポインターロックを維持（ショートカットキー専用のため）
    if (window.cameraControls && !window.cameraControls.isFPSLocked()) {
      window.cameraControls.lockPointer();
    }
    
    console.log('カメラモーション再生停止');
  }

  // プレイバック状態の取得
  getPlaybackState() {
    return this.isPlayingBack;
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

  // カメラパスの可視化
  visualizeCameraPath() {
    // 既存の可視化オブジェクトを削除
    this.clearCameraVisualization();
    
    if (this.cameraMotionData.length === 0) return;
    
    const scene = window.app.scene;
    
    // カメラ軌跡のライン作成
    const points = this.cameraMotionData.map(frame => frame.position);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ 
      color: 0x00ff00, 
      linewidth: 2,
      transparent: true,
      opacity: 0.8
    });
    const line = new THREE.Line(geometry, material);
    scene.add(line);
    this.cameraVisualizationObjects.push(line);
    
    // カメラ位置にコーンマーカーを配置（間引き表示）
    const step = Math.max(1, Math.floor(this.cameraMotionData.length / 20)); // 最大20個
    for (let i = 0; i < this.cameraMotionData.length; i += step) {
      const frame = this.cameraMotionData[i];
      
      // ワイヤーフレームコーンを作成
      const coneGeometry = new THREE.ConeGeometry(0.3, 1, 6);
      const coneMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff4444, 
        wireframe: true,
        transparent: true,
        opacity: 0.7
      });
      const cone = new THREE.Mesh(coneGeometry, coneMaterial);
      
      // カメラの位置と向きに配置
      cone.position.copy(frame.position);
      cone.quaternion.copy(frame.quaternion);
      
      // X軸で90度回転（コーンが正面を向くように）
      cone.rotateX(Math.PI / 2);
      
      scene.add(cone);
      this.cameraVisualizationObjects.push(cone);
    }
    
    console.log(`カメラパス可視化: ${this.cameraVisualizationObjects.length}オブジェクト`);
  }

  // カメラ可視化オブジェクトの削除
  clearCameraVisualization() {
    const scene = window.app.scene;
    this.cameraVisualizationObjects.forEach(obj => {
      scene.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    });
    this.cameraVisualizationObjects = [];
  }

  // プレイ時の動的カメラ表示を作成
  createCurrentCameraVisualization() {
    const scene = window.app.scene;
    
    // 動的カメラのコーンを作成（青色で区別）
    const coneGeometry = new THREE.ConeGeometry(0.4, 1.2, 6);
    const coneMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x0088ff, 
      wireframe: true,
      transparent: true,
      opacity: 0.9
    });
    this.currentCameraVisualization = new THREE.Mesh(coneGeometry, coneMaterial);
    
    // X軸で90度回転（コーンが正面を向くように）
    this.currentCameraVisualization.rotation.x = Math.PI / 2;
    
    scene.add(this.currentCameraVisualization);
    console.log('動的カメラ表示を作成');
  }

  // 動的カメラ表示を更新
  updateCurrentCameraVisualization(position, quaternion) {
    if (this.currentCameraVisualization) {
      this.currentCameraVisualization.position.copy(position);
      this.currentCameraVisualization.quaternion.copy(quaternion);
      
      // X軸で90度回転を再適用
      this.currentCameraVisualization.rotateX(Math.PI / 2);
    }
  }

  // 動的カメラ表示を削除
  removeCurrentCameraVisualization() {
    if (this.currentCameraVisualization) {
      const scene = window.app.scene;
      scene.remove(this.currentCameraVisualization);
      
      if (this.currentCameraVisualization.geometry) {
        this.currentCameraVisualization.geometry.dispose();
      }
      if (this.currentCameraVisualization.material) {
        this.currentCameraVisualization.material.dispose();
      }
      
      this.currentCameraVisualization = null;
      console.log('動的カメラ表示を削除');
    }
  }
}