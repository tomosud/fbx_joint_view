// メインアプリケーション
import * as THREE from 'three';
import { CameraControls } from './camera-controls.js';
import { MotionCapture } from './motion-capture.js';
import { FBXLoaderSystem } from './fbx-loader.js';

// グローバルTHREEが未定義の場合に設定
if (typeof window.THREE === 'undefined') {
  window.THREE = THREE;
}

export class App {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = null;
    
    this.cameraControls = null;
    this.motionCapture = null;
    this.fbxLoader = null;
    
    this.init();
  }

  async init() {
    try {
      this.updateInfo("Three.js初期化中...");

      // シーン、カメラ、レンダラーの初期化
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x202020);
      
      // カメラのファークリップを300mに設定
      this.camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 30000);
      this.camera.position.set(300, 200, 500);

      this.renderer = new THREE.WebGLRenderer({antialias:true});
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(this.renderer.domElement);

      this.updateInfo("レンダラー初期化完了");

      // 時計の初期化
      this.clock = new THREE.Clock();

      // システムの初期化
      this.cameraControls = new CameraControls(this.camera, this.renderer, this.scene);
      this.motionCapture = new MotionCapture(this.camera);
      this.fbxLoader = new FBXLoaderSystem(this.scene, this.camera, this.motionCapture);

      // 非同期初期化の完了を待つ
      await this.cameraControls.init();
      await this.fbxLoader.init();

      // グローバルアクセス用
      window.app = this;
      window.cameraControls = this.cameraControls;
      window.motionCapture = this.motionCapture;
      window.fbxLoader = this.fbxLoader;

      // ライティング
      this.scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.2));

      // 地面のグリッドを追加
      const gridHelper = new THREE.GridHelper(1000, 100, 0x888888, 0x444444);
      this.scene.add(gridHelper);

      // テスト用キューブを追加
      const testGeometry = new THREE.BoxGeometry(1, 1, 1);
      const testMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
      const testCube = new THREE.Mesh(testGeometry, testMaterial);
      testCube.name = 'testCube';
      this.scene.add(testCube);

      this.updateInfo("基本シーン設定完了、FBXファイル読み込み開始...");

      // リサイズイベント
      window.addEventListener("resize", () => {
        this.camera.aspect = window.innerWidth/window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
      });

      // アニメーションループ開始
      this.animate();

      // デフォルトファイルを読み込み
      this.fbxLoader.loadFBXFile("./your_skeleton.fbx");

    } catch (error) {
      console.error("初期化エラー:", error);
      this.showError(`初期化に失敗しました: ${error.message}`);
    }
  }

  updateInfo(message) {
    console.log(message);
    const infoDiv = document.getElementById('info');
    if (infoDiv) {
      infoDiv.innerHTML = message;
    }
  }

  showError(message) {
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) {
      loadingDiv.style.display = 'none';
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'absolute';
    errorDiv.style.top = '50%';
    errorDiv.style.left = '50%';
    errorDiv.style.transform = 'translate(-50%, -50%)';
    errorDiv.style.color = 'red';
    errorDiv.style.backgroundColor = 'rgba(0,0,0,0.9)';
    errorDiv.style.padding = '20px';
    errorDiv.style.fontFamily = 'monospace';
    errorDiv.style.borderRadius = '10px';
    errorDiv.style.maxWidth = '80%';
    errorDiv.innerHTML = `<strong>エラー:</strong> ${message}`;
    document.body.appendChild(errorDiv);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    
    const deltaTime = this.clock.getDelta();
    
    // 各システムの更新
    if (this.fbxLoader) {
      this.fbxLoader.update(deltaTime);
    }
    
    if (this.cameraControls) {
      this.cameraControls.update(deltaTime);
    }
    
    if (this.motionCapture) {
      this.motionCapture.update(deltaTime);
    }
    
    // カメラ高さ表示の更新
    this.updateCameraHeightDisplay();
    
    // レンダリング
    this.renderer.render(this.scene, this.camera);
  }

  updateCameraHeightDisplay() {
    const infoDiv = document.getElementById('info');
    if (infoDiv && this.camera) {
      const height = this.camera.position.y.toFixed(2);
      
      // デバッグ: オブジェクトの可視性チェック（修正完了により無効化）
      // this.debugVisibility();
      
      // 既存の要素があるかチェック
      let recordStatus = document.getElementById('recordStatus');
      let recordTime = document.getElementById('recordTime');
      
      if (!recordStatus || !recordTime) {
        // 要素が存在しない場合のみ再作成
        const statusText = recordStatus ? recordStatus.textContent : '待機中';
        const timeText = recordTime ? recordTime.textContent : '0.0s';
        
        const smoothStatus = this.cameraControls?.smoothingEnabled ? 'ON' : 'OFF';
        infoDiv.innerHTML = `v1.3.4 - カメラ高さ: ${height}m | スムーズ: ${smoothStatus}<div id="recordStatus" style="margin-top: 5px;">${statusText}</div><div id="recordTime" style="margin-top: 2px;">${timeText}</div>`;
        
        // motionCaptureに要素の再取得を通知
        if (window.motionCapture) {
          window.motionCapture.refreshElements();
        }
      } else {
        // 要素が存在する場合は高さ情報のみ更新
        const smoothStatus = this.cameraControls?.smoothingEnabled ? 'ON' : 'OFF';
        const heightText = infoDiv.firstChild;
        if (heightText && heightText.nodeType === Node.TEXT_NODE) {
          heightText.textContent = `v1.3.4 - カメラ高さ: ${height}m | スムーズ: ${smoothStatus}`;
        }
      }
    }
  }

  debugVisibility() {
    // フレーム毎の表示は重いので、300フレームに1回だけ
    if (!this.visibilityFrameCounter) this.visibilityFrameCounter = 0;
    this.visibilityFrameCounter++;
    
    if (this.visibilityFrameCounter % 300 === 0 && this.fbxLoader && this.fbxLoader.currentFBXObject) {
      const fbxObject = this.fbxLoader.currentFBXObject;
      const camera = this.camera;
      
      // カメラの Frustum を作成
      const frustum = new THREE.Frustum();
      const cameraMatrix = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      frustum.setFromProjectionMatrix(cameraMatrix);
      
      // FBXオブジェクトのバウンディングボックス
      const boundingBox = new THREE.Box3().setFromObject(fbxObject);
      
      // フラスタムカリングのテスト
      const isVisible = frustum.intersectsBox(boundingBox);
      
      console.log("=== フラスタムカリング解析 ===");
      console.log("カメラ位置:", camera.position);
      console.log("FBXオブジェクト位置:", fbxObject.position);
      console.log("バウンディングボックス:", boundingBox.min, "to", boundingBox.max);
      console.log("バウンディングボックスサイズ:", boundingBox.getSize(new THREE.Vector3()));
      console.log("フラスタム内に存在:", isVisible);
      console.log("オブジェクト可視状態:", fbxObject.visible);
      
      // SkeletonHelperの確認
      this.scene.traverse((obj) => {
        if (obj.type === 'SkeletonHelper') {
          const helperBox = new THREE.Box3().setFromObject(obj);
          const helperVisible = frustum.intersectsBox(helperBox);
          console.log("SkeletonHelper可視状態:", obj.visible, "フラスタム内:", helperVisible);
          console.log("SkeletonHelperバウンディング:", helperBox.min, "to", helperBox.max);
        }
      });
    }
  }
}

// アプリケーション開始
new App();