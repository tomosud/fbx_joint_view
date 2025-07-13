// カメラ制御システム
import * as THREE from 'three';

export class CameraControls {
  constructor(camera, renderer, scene) {
    this.camera = camera;
    this.renderer = renderer;
    this.scene = scene;
    this.fpsControls = null;
    this.crosshair = document.getElementById('crosshair');
    
    this.moveState = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      up: false,
      down: false
    };
    
    
    this.moveSpeed = 100;
    this.heightAdjustSpeed = 23.4375; // 上下移動速度を1.5倍に（15.625 * 1.5）
    
    // スムージング設定
    this.smoothingEnabled = true; // デフォルト有効
    this.smoothingFactor = 0.25; // 移動平均を0.25秒に変更
    
    // スムーズ移動用の目標値と現在値
    this.targetVelocity = new THREE.Vector3(0, 0, 0);
    this.currentVelocity = new THREE.Vector3(0, 0, 0);
    
    // カメラ回転スムージング用
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.mouseVelocityX = 0;
    this.mouseVelocityY = 0;
    this.targetMouseVelocityX = 0;
    this.targetMouseVelocityY = 0;
  }

  async init() {
    const { PointerLockControls } = await import('three/addons/controls/PointerLockControls.js');

    // PointerLockControls初期化
    this.fpsControls = new PointerLockControls(this.camera, document.body);
    
    // スムージング用にマウス移動を手動でキャプチャ
    this.setupMouseCapture();
    
    this.setupEventListeners();
    this.setupUI();
    
    // 自動的にFPSモードを開始
    this.startFPS();
  }

  setupMouseCapture() {
    // スムージング用のマウス移動キャプチャ
    document.addEventListener('mousemove', (event) => {
      if (this.fpsControls.isLocked && this.smoothingEnabled) {
        // マウス移動量を計算
        const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
        
        // 目標マウス速度を設定
        this.targetMouseVelocityX = movementX * 0.002;
        this.targetMouseVelocityY = movementY * 0.002;
        
        // PointerLockControlsの通常の動作を無効化
        event.preventDefault();
        event.stopPropagation();
      }
    });
  }

  setupEventListeners() {
    // FPS移動制御
    document.addEventListener('keydown', (event) => {
      switch (event.code) {
        case 'KeyW': this.moveState.forward = true; break;
        case 'KeyS': this.moveState.backward = true; break;
        case 'KeyA': this.moveState.left = true; break;
        case 'KeyD': this.moveState.right = true; break;
        case 'Space': this.moveState.down = true; break;
        case 'ShiftLeft': this.moveState.up = true; break;
      }
    });
    
    document.addEventListener('keyup', (event) => {
      switch (event.code) {
        case 'KeyW': this.moveState.forward = false; break;
        case 'KeyS': this.moveState.backward = false; break;
        case 'KeyA': this.moveState.left = false; break;
        case 'KeyD': this.moveState.right = false; break;
        case 'Space': this.moveState.down = false; break;
        case 'ShiftLeft': this.moveState.up = false; break;
      }
    });

    // Escキーでポインターロック解除・復帰切り替え
    document.addEventListener('keydown', (event) => {
      if (event.code === 'Escape') {
        if (this.fpsControls.isLocked) {
          this.unlockPointer();
          console.log('Escape: ポインターロック解除');
        } else {
          this.lockPointer();
          console.log('Escape: ポインターロック復帰');
        }
        event.preventDefault();
      }
      
      // Jキーでスムージング切り替え
      if (event.code === 'KeyJ') {
        this.smoothingEnabled = !this.smoothingEnabled;
        console.log('カメラスムージング:', this.smoothingEnabled ? '有効' : '無効');
        event.preventDefault();
      }
    });

    // 画面クリックでポインターロック復帰（UI要素を除外）
    document.addEventListener('click', (event) => {
      // UI要素（スライダーなど）を除外
      const isUIElement = event.target.closest('#timeSliderContainer') || 
                         event.target.closest('#info') ||
                         event.target.closest('#shortcutGuide') ||
                         event.target.id === 'timeSlider';
      
      if (!this.fpsControls.isLocked && !isUIElement) {
        this.lockPointer();
      }
    });

    // ホイールスクロール高さ調整
    document.addEventListener('wheel', (event) => {
      if (this.fpsControls && this.fpsControls.isLocked) {
        const deltaY = event.deltaY;
        this.camera.position.y -= deltaY * 0.01; // 高さ調整速度
        event.preventDefault();
      }
    }, { passive: false });
  }

  setupUI() {
    // UI透明度制御用の要素を取得
    this.infoDiv = document.getElementById('info');
    this.shortcutGuide = document.getElementById('shortcutGuide');
    this.timeSliderContainer = document.getElementById('timeSliderContainer');
  }

  startFPS() {
    this.crosshair.style.display = 'block';
    
    // ポインターロックのイベントリスナー
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement === document.body) {
        console.log('ポインターロック開始');
        this.setUIOpacity(0.1); // ポインターロック時は透明度を薄く
      } else {
        console.log('ポインターロック解除');
        this.setUIOpacity(0.7); // 解除時は元の透明度に戻す
      }
    });
    
    // 初期化後に自動でポインターロック開始
    setTimeout(() => {
      this.lockPointer();
    }, 3000);
  }

  // ポインターロック状態を維持するメソッド
  maintainPointerLock() {
    // ショートカットキー専用のため、常にポインターロックを維持
    if (!this.fpsControls.isLocked) {
      setTimeout(() => {
        this.lockPointer();
      }, 100);
    }
  }

  lockPointer() {
    if (this.fpsControls) {
      this.fpsControls.lock();
    }
  }

  unlockPointer() {
    if (this.fpsControls) {
      this.fpsControls.unlock();
    }
  }

  update(deltaTime) {
    // FPS移動制御
    if (this.fpsControls && this.fpsControls.isLocked) {
      if (this.smoothingEnabled) {
        // スムーズ移動（指数関数的減衰を使用）
        this.updateSmoothMovement(deltaTime);
        this.updateSmoothRotation(deltaTime);
      } else {
        // 従来の直接移動
        this.updateDirectMovement(deltaTime);
      }
    }
  }

  updateDirectMovement(deltaTime) {
    const moveDistance = this.moveSpeed * deltaTime;
    const heightDistance = this.heightAdjustSpeed * deltaTime;
    
    if (this.moveState.forward) this.fpsControls.moveForward(moveDistance);
    if (this.moveState.backward) this.fpsControls.moveForward(-moveDistance);
    if (this.moveState.left) this.fpsControls.moveRight(-moveDistance);
    if (this.moveState.right) this.fpsControls.moveRight(moveDistance);
    if (this.moveState.up) this.camera.position.y += heightDistance;
    if (this.moveState.down) this.camera.position.y -= heightDistance;
  }

  updateSmoothMovement(deltaTime) {
    // 目標速度を設定
    this.targetVelocity.set(0, 0, 0);
    
    const moveSpeed = this.moveSpeed;
    const heightSpeed = this.heightAdjustSpeed;
    
    if (this.moveState.forward) this.targetVelocity.z = moveSpeed;
    if (this.moveState.backward) this.targetVelocity.z = -moveSpeed;
    if (this.moveState.left) this.targetVelocity.x = -moveSpeed;
    if (this.moveState.right) this.targetVelocity.x = moveSpeed;
    if (this.moveState.up) this.targetVelocity.y = heightSpeed;
    if (this.moveState.down) this.targetVelocity.y = -heightSpeed;
    
    // 指数関数的減衰で現在速度を目標速度に近づける
    const smoothing = this.smoothingFactor;
    this.currentVelocity.lerp(this.targetVelocity, smoothing);
    
    // カメラを移動
    const scaledVelocity = this.currentVelocity.clone().multiplyScalar(deltaTime);
    
    // 前後左右移動（カメラの向きに相対）
    if (Math.abs(scaledVelocity.z) > 0.001) {
      this.fpsControls.moveForward(scaledVelocity.z);
    }
    if (Math.abs(scaledVelocity.x) > 0.001) {
      this.fpsControls.moveRight(scaledVelocity.x);
    }
    
    // 上下移動（ワールド座標）
    if (Math.abs(scaledVelocity.y) > 0.001) {
      this.camera.position.y += scaledVelocity.y;
    }
  }

  updateSmoothRotation(deltaTime) {
    // マウス速度をスムーズに減衰
    this.mouseVelocityX = THREE.MathUtils.lerp(this.mouseVelocityX, this.targetMouseVelocityX, this.smoothingFactor);
    this.mouseVelocityY = THREE.MathUtils.lerp(this.mouseVelocityY, this.targetMouseVelocityY, this.smoothingFactor);
    
    // 回転を適用
    if (Math.abs(this.mouseVelocityX) > 0.001 || Math.abs(this.mouseVelocityY) > 0.001) {
      // ヨー回転（水平）
      const euler = new THREE.Euler(0, 0, 0, 'YXZ');
      euler.setFromQuaternion(this.camera.quaternion);
      euler.y -= this.mouseVelocityX;
      
      // ピッチ回転（垂直）- 制限付き
      euler.x -= this.mouseVelocityY;
      euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
      
      this.camera.quaternion.setFromEuler(euler);
    }
    
    // 目標速度を減衰
    this.targetMouseVelocityX *= 0.8;
    this.targetMouseVelocityY *= 0.8;
  }


  getCurrentMode() {
    return 'fps'; // 常にFPSモード
  }

  isFPSLocked() {
    return this.fpsControls && this.fpsControls.isLocked;
  }

  // UI透明度制御
  setUIOpacity(opacity) {
    const elements = [this.infoDiv, this.shortcutGuide, this.timeSliderContainer];
    elements.forEach(element => {
      if (element) {
        // 現在の背景色から透明度のみを変更
        const currentStyle = window.getComputedStyle(element);
        const backgroundColor = currentStyle.backgroundColor;
        
        // rgba形式に変換して透明度を設定
        if (backgroundColor.includes('rgba')) {
          element.style.backgroundColor = backgroundColor.replace(/[\d\.]+\)$/g, `${opacity})`);
        } else if (backgroundColor.includes('rgb')) {
          const rgbValues = backgroundColor.match(/\d+/g);
          if (rgbValues && rgbValues.length >= 3) {
            element.style.backgroundColor = `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, ${opacity})`;
          }
        }
      }
    });
  }
}