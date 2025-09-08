# FBXアニメーション カメラキャプチャシステム

**メッシュを含まないFBX（ジョイント/ボーン階層 + アニメーション）の再生とカメラモーションキャプチャ**を行うWebアプリケーション。

https://tomosud.github.io/fbx_joint_view/

再生のみ
https://tomosud.github.io/fbx_joint_view/fbx_joint_fixed.html
<img width="1261" height="496" alt="image" src="https://github.com/user-attachments/assets/51c4c4f3-4ece-4e01-9d46-52e1b3c1ad57" />


## 🎯 主な機能

- **FBXアニメーション再生**: ジョイント階層の可視化とアニメーション制御
- **FPSカメラ操作**: ポインターロック対応の1人称視点カメラ
- **カメラモーションキャプチャ**: リアルタイムでカメラパスを記録
- **Maya互換JSON出力**: キャプチャしたカメラアニメーションをMaya用JSON形式で出力
- **カメラパス可視化**: 記録したカメラ軌跡の3D表示

## 🎮 操作方法

### キーボードショートカット
- **[P]** アニメーション再生/停止
- **[O]** カメラキャプチャ開始/停止
- **[I]** カメラ再生/停止
- **[U]** カメラJSON出力
- **[K]** 座標系切り替え（Z-up ↔ Y-up）
- **[L]** FBXファイル読み込み
- **[Esc]** ポインターロック解除

### マウス・キー操作
- **WASD** カメラ移動（前後左右）
- **ホイール** カメラ高さ調整
- **マウス移動** カメラ視点操作（ポインターロック中）
- **Space** 上昇
- **Shift** 下降

## 📁 ファイル構成

```
index.html              # メインエントリポイント
js/
├── app.js             # メインアプリケーション制御
├── camera-controls.js # FPSカメラ制御
├── motion-capture.js  # カメラモーション記録・再生・出力
└── fbx-loader.js      # FBX読み込み・アニメーション制御
```

## 🚀 使用方法

1. `index.html`をWebサーバーで開く
2. [L]キーでFBXファイルを読み込み
3. WASDキーでカメラを操作
4. [O]キーでカメラモーションキャプチャを開始
5. [U]キーでMaya用JSONファイルを出力

## 📤 出力ファイル

カメラモーションは `cam_[FBX名]([開始フレーム]-[終了フレーム]).json` 形式で出力されます。

## 🔧 技術仕様

| 項目                 | 採用技術 | 説明 |
|----------------------|----------|------|
| 3Dレンダリング       | Three.js | WebGL抽象化ライブラリ |
| FBX読み込み          | FBXLoader | Three.js公式FBXローダー |
| ジョイント可視化     | SkeletonHelper | ボーン階層の線分表示 |
| カメラ制御           | PointerLockControls | FPS形式のカメラ操作 |
| アニメーション制御   | AnimationMixer | FBXアニメーション再生 |
| 座標系               | Y-up/Z-up対応 | Maya互換座標系 |
