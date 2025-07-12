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
    this.heightAdjustSpeed = 50;
  }

  async init() {
    const { PointerLockControls } = await import('three/addons/controls/PointerLockControls.js');

    // PointerLockControls初期化
    this.fpsControls = new PointerLockControls(this.camera, document.body);
    
    this.setupEventListeners();
    this.setupUI();
    
    // 自動的にFPSモードを開始
    this.startFPS();
  }

  setupEventListeners() {
    // FPS移動制御
    document.addEventListener('keydown', (event) => {
      switch (event.code) {
        case 'KeyW': this.moveState.forward = true; break;
        case 'KeyS': this.moveState.backward = true; break;
        case 'KeyA': this.moveState.left = true; break;
        case 'KeyD': this.moveState.right = true; break;
        case 'Space': this.moveState.up = true; break;
        case 'ShiftLeft': this.moveState.down = true; break;
      }
    });
    
    document.addEventListener('keyup', (event) => {
      switch (event.code) {
        case 'KeyW': this.moveState.forward = false; break;
        case 'KeyS': this.moveState.backward = false; break;
        case 'KeyA': this.moveState.left = false; break;
        case 'KeyD': this.moveState.right = false; break;
        case 'Space': this.moveState.up = false; break;
        case 'ShiftLeft': this.moveState.down = false; break;
      }
    });

    // Escキーでポインターロック解除（一時的）
    document.addEventListener('keydown', (event) => {
      if (event.code === 'Escape') {
        this.unlockPointer();
        // 3秒後に自動で再ロック（カメラ再生中でなければ）
        setTimeout(() => {
          this.maintainPointerLock();
        }, 3000);
        event.preventDefault();
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
    // UIセットアップは不要（自動でFPSモード開始）
  }

  startFPS() {
    this.crosshair.style.display = 'block';
    
    // ポインターロックのイベントリスナー
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement === document.body) {
        console.log('ポインターロック開始');
      } else {
        console.log('ポインターロック解除');
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
      const moveDistance = this.moveSpeed * deltaTime;
      
      if (this.moveState.forward) this.fpsControls.moveForward(moveDistance);
      if (this.moveState.backward) this.fpsControls.moveForward(-moveDistance);
      if (this.moveState.left) this.fpsControls.moveRight(-moveDistance);
      if (this.moveState.right) this.fpsControls.moveRight(moveDistance);
      if (this.moveState.up) this.camera.position.y += moveDistance;
      if (this.moveState.down) this.camera.position.y -= moveDistance;
    }
  }

  getCurrentMode() {
    return 'fps'; // 常にFPSモード
  }

  isFPSLocked() {
    return this.fpsControls && this.fpsControls.isLocked;
  }
}