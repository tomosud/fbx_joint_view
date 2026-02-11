// FBX読み込みシステム
import * as THREE from 'three';

export class FBXLoaderSystem {
  constructor(scene, camera, motionCapture) {
    this.scene = scene;
    this.camera = camera;
    this.motionCapture = motionCapture;
    this.loader = null;
    this.mixer = null;
    this.currentFBXObject = null;
    this.currentAction = null;
    this.currentFileName = null;
    
    this.infoDiv = document.getElementById('info');
    this.loadingDiv = document.getElementById('loading');
  }

  // 現在のFBXファイル名を取得
  getCurrentFileName() {
    return this.currentFileName;
  }

  async init() {
    try {
      const { FBXLoader } = await import('three/addons/loaders/FBXLoader.js');
      this.loader = new FBXLoader();
      this.setupUI();
      console.log('FBXLoader初期化完了');
    } catch (error) {
      console.error('FBXLoader初期化エラー:', error);
      throw error;
    }
  }

  setupUI() {
    // ファイル選択機能の設定
    const fbxFileInput = document.getElementById('fbxFileInput');

    // ファイル選択時に自動で読み込み
    fbxFileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file && file.name.toLowerCase().endsWith('.fbx')) {
        const fileUrl = URL.createObjectURL(file);
        this.loadFBXFile(fileUrl, file.name);
      } else if (file) {
        alert('有効なFBXファイルを選択してください。');
      }
    });

    // 座標系変換チェックボックスのイベントリスナー
    const convertToYUpCheckbox = document.getElementById('convertToYUp');
    convertToYUpCheckbox.addEventListener('change', () => {
      if (this.currentFBXObject) {
        const convertToYUp = convertToYUpCheckbox.checked;
        if (convertToYUp) {
          this.currentFBXObject.rotation.x = -Math.PI / 2;
          console.log("座標系をY-upに変更");
          this.updateInfo(`座標系: Y-up (変換適用)<br>ボーン表示中<br>アニメーション: ${this.currentFBXObject.animations ? this.currentFBXObject.animations.length : 0}個`);
        } else {
          this.currentFBXObject.rotation.x = 0;
          console.log("座標系をZ-upに変更");
          this.updateInfo(`座標系: Z-up (元の座標系)<br>ボーン表示中<br>アニメーション: ${this.currentFBXObject.animations ? this.currentFBXObject.animations.length : 0}個`);
        }
      }
    });
  }

  updateInfo(message) {
    console.log(message);
    this.infoDiv.innerHTML = message;
  }

  hideLoading() {
    this.loadingDiv.style.display = 'none';
  }

  showError(message) {
    this.hideLoading();
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

  loadFBXFile(fileUrl, fileName = null) {
    if (!this.loader) {
      console.error('FBXLoader が初期化されていません');
      this.showError('FBXLoader が初期化されていません。しばらく待ってから再試行してください。');
      return;
    }

    // 既存のオブジェクトとアニメーションをクリア
    if (this.currentFBXObject) {
      this.scene.remove(this.currentFBXObject);
      this.currentFBXObject = null;
    }
    
    // 既存のスケルトンヘルパーとAxesHelperを削除
    const objectsToRemove = [];
    this.scene.traverse((obj) => {
      if (obj.type === 'SkeletonHelper' || obj.type === 'AxesHelper') {
        objectsToRemove.push(obj);
      }
    });
    objectsToRemove.forEach(obj => this.scene.remove(obj));
    
    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer = null;
    }
    if (this.currentAction) {
      this.currentAction = null;
    }

    // UI制御は不要（ボタンが存在しないため）
    
    this.updateInfo(`FBX読み込み中... ${fileName || fileUrl}`);
    console.log("FBXファイルの読み込みを開始:", fileName || fileUrl);

    this.loader.load(
      fileUrl,
      (root) => this.onLoadComplete(root, fileName),
      (progress) => this.onLoadProgress(progress),
      (error) => this.onLoadError(error, fileName, fileUrl)
    );
  }

  onLoadComplete(root, fileName) {
    this.hideLoading();
    this.currentFileName = fileName;
    console.log("FBXファイルの読み込み完了:", root);
    console.log("アニメーション数:", root.animations ? root.animations.length : 0);
    
    this.updateInfo(`FBX読み込み完了<br>アニメーション: ${root.animations ? root.animations.length : 0}個`);

    // 座標系変換
    const convertToYUp = document.getElementById('convertToYUp').checked;
    const coordinateSystem = convertToYUp ? 'Y-up (変換適用)' : 'Z-up (元の座標系)';
    
    if (convertToYUp) {
      root.rotation.x = -Math.PI / 2;
      console.log("Z-up → Y-up変換を適用");
    } else {
      root.rotation.x = 0;
      console.log("元の座標系（Z-up）を維持");
    }
    
    // シーンへ追加
    this.scene.add(root);
    this.currentFBXObject = root;

    // テストキューブを削除
    const testCube = this.scene.getObjectByName('testCube');
    if (testCube) {
      this.scene.remove(testCube);
    }

    // スケルトンヘルパー処理
    this.setupSkeleton(root, coordinateSystem);

    // アニメーション再生
    this.setupAnimation(root);

    // カメラ位置の調整
    this.adjustCameraPosition(root);
  }

  setupSkeleton(root, coordinateSystem) {
    let skeletonFound = false;
    let boneCount = 0;

    root.traverse((obj) => {
      console.log("オブジェクト:", obj.name, "タイプ:", obj.type, "isBone:", obj.isBone);

      if (obj.isBone) {
        boneCount++;
      }

      if (obj.isSkinnedMesh && obj.skeleton) {
        console.log("SkinnedMeshのスケルトンを発見:", obj.name);

        const helper = new THREE.SkeletonHelper(obj);
        helper.material.linewidth = 2;
        helper.frustumCulled = false;

        // ルートボーンの第一階層接続を非表示
        this.hideRootBoneConnections(helper);

        this.scene.add(helper);
        skeletonFound = true;
      }
      else if (obj.isBone && (!obj.parent || !obj.parent.isBone)) {
        console.log("ルートボーンを発見:", obj.name);
        const helper = new THREE.SkeletonHelper(obj);
        helper.material.linewidth = 2;
        helper.frustumCulled = false;

        // ルートボーンの第一階層接続を非表示
        this.hideRootBoneConnections(helper);

        this.scene.add(helper);
        skeletonFound = true;
      }
    });

    if (!skeletonFound && boneCount > 0) {
      console.warn("スケルトンヘルパーが作成できませんでした。AxesHelperを代替使用します。");
      root.traverse((obj) => {
        if (obj.isBone) {
          const axesHelper = new THREE.AxesHelper(0.5);
          obj.add(axesHelper);
          console.log("ボーンにAxesHelperを追加:", obj.name);
        }
      });
      this.updateInfo(`FBX読み込み完了<br>座標系: ${coordinateSystem}<br>ボーン: ${boneCount}個（AxesHelper表示）<br>アニメーション: ${root.animations ? root.animations.length : 0}個`);
    } else if (skeletonFound) {
      this.updateInfo(`FBX読み込み完了<br>座標系: ${coordinateSystem}<br>スケルトン表示中<br>ボーン: ${boneCount}個<br>アニメーション: ${root.animations ? root.animations.length : 0}個`);
    } else {
      this.updateInfo(`FBX読み込み完了<br>座標系: ${coordinateSystem}<br>ボーンが見つかりません<br>オブジェクト構造をコンソールで確認してください`);
    }
  }

  // ルートボーンから第一階層への接続ラインを非表示にする
  hideRootBoneConnections(helper) {
    // SkeletonHelperのbonesを走査し、ルートボーン直下の子ボーンを特定
    // ルートボーン = isBoneだが親がBoneでないノード
    const hidePositionIndices = [];
    let j = 0;

    for (let i = 0; i < helper.bones.length; i++) {
      const bone = helper.bones[i];
      if (bone.parent && bone.parent.isBone) {
        // この骨の親がルートボーン（親の親がBoneでない）かチェック
        if (!bone.parent.parent || !bone.parent.parent.isBone) {
          hidePositionIndices.push(j);
          console.log("非表示ボーン接続:", bone.name, "→", bone.parent.name);
        }
        j += 2;
      }
    }

    if (hidePositionIndices.length > 0) {
      const originalUpdate = helper.updateMatrixWorld.bind(helper);
      helper.updateMatrixWorld = function(force) {
        originalUpdate(force);
        // 非表示対象のラインを両端同一座標にしてゼロ長にする
        const position = this.geometry.getAttribute('position');
        for (const idx of hidePositionIndices) {
          const x = position.getX(idx);
          const y = position.getY(idx);
          const z = position.getZ(idx);
          position.setXYZ(idx + 1, x, y, z);
        }
        position.needsUpdate = true;
      };
    }
  }

  setupAnimation(root) {
    if (root.animations && root.animations.length > 0) {
      console.log("アニメーションを開始:", root.animations[0].name);
      this.mixer = new THREE.AnimationMixer(root);
      this.currentAction = this.mixer.clipAction(root.animations[0]);
      const animationDuration = root.animations[0].duration;
      this.currentAction.play();
      
      // モーションキャプチャにアニメーション情報を設定
      this.motionCapture.setAnimationData(this.currentAction, animationDuration);
      
      // UI制御は不要（キーボードショートカットのため）
      
      // アニメーション制御の設定
      this.setupAnimationControls(this.currentAction, animationDuration);
    } else {
      console.warn("アニメーションが見つかりませんでした。");
    }
  }

  setupAnimationControls(action, duration) {
    let isPlaying = false;
    
    // ループ設定
    action.setLoop(THREE.LoopRepeat);
    action.clampWhenFinished = false;
    
    // 再生/停止関数（統合）
    const togglePlayback = () => {
      if (!isPlaying) {
        // 再生開始
        action.paused = false;
        if (!action.isRunning()) {
          action.play();
        }
        isPlaying = true;
        console.log('アニメーション再生開始');
      } else {
        // 停止
        action.paused = true;
        isPlaying = false;
        console.log('アニメーション停止');
      }
    };
    
    // Pキーショートカット対応
    window.toggleAnimation = togglePlayback;
    
    // タイムスライダーの設定
    this.setupTimeSlider(action, duration);
    
    // 初期状態
    action.paused = true;
  }

  setupTimeSlider(action, duration) {
    const timeSliderContainer = document.getElementById('timeSliderContainer');
    const timeSlider = document.getElementById('timeSlider');
    const timeDisplay = document.getElementById('timeDisplay');
    
    timeSliderContainer.style.display = 'block';
    timeSlider.max = duration;
    
    // スライダー操作時
    timeSlider.addEventListener('input', () => {
      const time = parseFloat(timeSlider.value);
      action.time = time;
      if (action.paused) {
        this.mixer.update(0); // 一時停止中でも位置を更新
      }
    });
    
    // 時間表示の更新関数
    window.updateTimeDisplay = () => {
      if (action) {
        const currentTime = action.time;
        timeSlider.value = currentTime;
        timeDisplay.textContent = `${currentTime.toFixed(1)} / ${duration.toFixed(1)}s`;
      }
    };
  }

  adjustCameraPosition(root) {
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      this.camera.position.set(maxDim * 1.5, maxDim * 1.5, maxDim * 1.5);
      this.camera.lookAt(box.getCenter(new THREE.Vector3()));
      if (window.cameraControls && window.cameraControls.orbitControls) {
        window.cameraControls.orbitControls.reset();
      }
    }
    
    console.log("オブジェクトサイズ:", size);
    console.log("カメラ位置を調整:", this.camera.position);
  }

  onLoadProgress(progress) {
    if (progress.total > 0) {
      const percent = Math.round((progress.loaded / progress.total) * 100);
      this.updateInfo(`FBX読み込み中... ${percent}%`);
      console.log("読み込み進行:", percent + '%');
    }
  }

  onLoadError(error, fileName, fileUrl) {
    console.error("FBXファイルの読み込みエラー:", error);
    this.showError(`FBXファイルが読み込めません<br>ファイル: ${fileName || fileUrl}<br>詳細: ${error.message || error}`);
  }

  update(deltaTime) {
    if (this.mixer) {
      this.mixer.update(deltaTime);
      if (window.updateTimeDisplay) {
        window.updateTimeDisplay();
      }
      
      // デバッグ: アニメーション中のボーン位置変化を監視（修正完了により無効化）
      // this.debugAnimationEffect();
    }
  }

  debugAnimationEffect() {
    // 900フレームに1回だけ（軽量化）
    if (!this.animDebugCounter) this.animDebugCounter = 0;
    this.animDebugCounter++;
    
    if (this.animDebugCounter % 900 === 0 && this.currentFBXObject) {
      console.log("=== アニメーション中のSkeletonHelper解析 ===");
      
      // SkeletonHelperの現在のバウンディングボックスを確認
      this.scene.traverse((obj) => {
        if (obj.type === 'SkeletonHelper') {
          const helperBox = new THREE.Box3().setFromObject(obj);
          console.log("アニメーション中SkeletonHelperバウンディング:", helperBox.min, "to", helperBox.max);
          console.log("サイズ:", helperBox.getSize(new THREE.Vector3()));
          
          // SkeletonHelperの各ボーンの現在位置をチェック
          if (obj.skeleton && obj.skeleton.bones) {
            console.log("ボーン数:", obj.skeleton.bones.length);
            obj.skeleton.bones.forEach((bone, index) => {
              if (index < 5) { // 最初の5つのボーンのみ表示
                const worldPos = bone.getWorldPosition(new THREE.Vector3());
                console.log(`ボーン${index} (${bone.name || 'unnamed'}) ワールド位置:`, worldPos);
              }
            });
          }
        }
      });
      
      // 現在のFBXオブジェクト全体のバウンディングボックス
      const fbxBox = new THREE.Box3().setFromObject(this.currentFBXObject);
      console.log("FBXオブジェクト全体バウンディング:", fbxBox.min, "to", fbxBox.max);
    }
  }

  getCurrentAction() {
    return this.currentAction;
  }
}