# 骨アニメーション FBX ビューワ

## 目的
- **メッシュを含まない FBX（ジョイント／ボーン階層 + アニメーション）の再生** をブラウザだけで行う。  
- ドラッグ操作で視点操作

---

![image](https://github.com/user-attachments/assets/be5e97a1-d3cf-4ac8-8155-11f7e7476a2f)


## 使い方

1. run.batを実行
※python環境でwebサーバーが立ち上がる。


※既存のwebサーバーがあればhtmlファイルとデフォルトfbxファイルの配置だけで良い


## 採用技術
| 項目                 | 採用ライブラリ / API | 理由 |
|----------------------|----------------------|------|
| 3D レンダリング      | `three.js`           | WebGL 抽象化の事実上標準。ドキュメント・サンプルが豊富。 |
| FBX ローダ           | `FBXLoader`          | Three.js 公式例。Blender 由来のアニメーション付き FBX も読める。 |
| 骨可視化             | `SkeletonHelper`     | SkinnedMesh が無くても Bone 階層を線分で描画できる。 |
| カメラ操作           | `OrbitControls`      | マウス／タッチで回転・パン・ズームを実装。 |
| アニメーション再生   | `AnimationMixer`     | FBX 内の `AnimationClip` をそのまま再生可能。 |
