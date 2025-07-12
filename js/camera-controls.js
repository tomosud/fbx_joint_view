// カメラ制御システム
import * as THREE from 'three';

export class CameraControls {
  constructor(camera, renderer, scene) {
    this.camera = camera;
    this.renderer = renderer;
    this.scene = scene;
    this.currentControlMode = 'orbit';
    this.orbitControls = null;
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
    this.init();
  }

  async init() {
    const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');
    const { PointerLockControls } = await import('three/addons/controls/PointerLockControls.js');
    
    // OrbitControls初期化
    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbitControls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.PAN,
      RIGHT: THREE.MOUSE.DOLLY
    };
    this.orbitControls.enableDamping = true;
    this.orbitControls.dampingFactor = 0.05;
    this.orbitControls.screenSpacePanning = false;

    // PointerLockControls初期化
    this.fpsControls = new PointerLockControls(this.camera, document.body);
    
    this.setupEventListeners();
    this.setupUI();
  }

  setupEventListeners() {
    // FPS移動制御
    document.addEventListener('keydown', (event) => {
      if (this.currentControlMode !== 'fps') return;
      
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
      if (this.currentControlMode !== 'fps') return;
      
      switch (event.code) {
        case 'KeyW': this.moveState.forward = false; break;
        case 'KeyS': this.moveState.backward = false; break;
        case 'KeyA': this.moveState.left = false; break;
        case 'KeyD': this.moveState.right = false; break;
        case 'Space': this.moveState.up = false; break;
        case 'ShiftLeft': this.moveState.down = false; break;
      }
    });

    // キーボードショートカット
    document.addEventListener('keydown', (event) => {
      // Escキーでポインターロック解除
      if (event.code === 'Escape' && this.currentControlMode === 'fps') {
        this.switchToOrbit();
        return;
      }
      
      // FPSモード時のWASD移動キーは除外
      if (this.currentControlMode === 'fps' && ['KeyW', 'KeyS', 'KeyA', 'KeyD', 'Space', 'ShiftLeft'].includes(event.code)) {
        return;
      }
      
      switch (event.code) {
        case 'KeyC': // カメラ切り替え
          if (this.currentControlMode === 'orbit') {
            this.switchToFPS();
            this.fpsControls.lock();
          } else {
            this.switchToOrbit();
          }
          event.preventDefault();
          break;
      }
    });
  }

  setupUI() {
    const orbitBtn = document.getElementById('orbitBtn');
    const fpsBtn = document.getElementById('fpsBtn');

    orbitBtn.addEventListener('click', () => this.switchToOrbit());
    fpsBtn.addEventListener('click', () => {
      this.switchToFPS();
      this.fpsControls.lock();
    });
  }

  switchToOrbit() {
    this.currentControlMode = 'orbit';
    if (this.fpsControls) this.fpsControls.unlock();
    if (this.orbitControls) this.orbitControls.enabled = true;
    this.crosshair.style.display = 'none';
    
    document.getElementById('orbitBtn').style.background = '#4CAF50';
    document.getElementById('fpsBtn').style.background = '#555';
    document.getElementById('captureControls').style.display = 'none';
  }

  switchToFPS() {
    this.currentControlMode = 'fps';
    if (this.orbitControls) this.orbitControls.enabled = false;
    this.crosshair.style.display = 'block';
    
    document.getElementById('orbitBtn').style.background = '#555';
    document.getElementById('fpsBtn').style.background = '#4CAF50';
    document.getElementById('captureControls').style.display = 'block';
  }

  update(deltaTime) {
    // FPS移動制御
    if (this.currentControlMode === 'fps' && this.fpsControls && this.fpsControls.isLocked) {
      const moveDistance = this.moveSpeed * deltaTime;
      
      if (this.moveState.forward) this.fpsControls.moveForward(moveDistance);
      if (this.moveState.backward) this.fpsControls.moveForward(-moveDistance);
      if (this.moveState.left) this.fpsControls.moveRight(-moveDistance);
      if (this.moveState.right) this.fpsControls.moveRight(moveDistance);
      if (this.moveState.up) this.camera.position.y += moveDistance;
      if (this.moveState.down) this.camera.position.y -= moveDistance;
    }
    
    if (this.currentControlMode === 'orbit' && this.orbitControls) {
      this.orbitControls.update();
    }
  }

  getCurrentMode() {
    return this.currentControlMode;
  }

  isFPSLocked() {
    return this.fpsControls && this.fpsControls.isLocked;
  }
}