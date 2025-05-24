# 骨アニメーション FBX ビューワ実装計画・仕様まとめ

## 目的
- **メッシュを含まない FBX（ジョイント／ボーン階層 + アニメーション）の再生と可視化** をブラウザだけで行う。  
- 依存ライブラリは Three.js のみとし、**単一 HTML ファイルで完結**させる。  
- 軽量でスマホでも動作し、ドラッグ操作で視点を確認できることを目標とする。

---

## 採用技術
| 項目                 | 採用ライブラリ / API | 理由 |
|----------------------|----------------------|------|
| 3D レンダリング      | `three.js`           | WebGL 抽象化の事実上標準。ドキュメント・サンプルが豊富。 |
| FBX ローダ           | `FBXLoader`          | Three.js 公式例。Blender 由来のアニメーション付き FBX も読める。 |
| 骨可視化             | `SkeletonHelper`     | SkinnedMesh が無くても Bone 階層を線分で描画できる。 |
| カメラ操作           | `OrbitControls`      | マウス／タッチで回転・パン・ズームを実装。 |
| アニメーション再生   | `AnimationMixer`     | FBX 内の `AnimationClip` をそのまま再生可能。 |


使い方

fbx_joint.html

上記 HTML を任意のフォルダに保存し、同じ場所に your_skeleton.fbx を配置

ブラウザで開いて確認（ローカルファイル読み込み制限がある場合は簡易 HTTP サーバを起動する）

実装手順チェックリスト
ファイル準備

骨付き FBX を用意（必要なら Blender で「Bake Animation」ON で再書き出し）

HTML テンプレート作成

上記サンプルをコピペ。CDN URL は Three.js の最新版に合わせて更新可。

ビルド／テスト

ローカルサーバ（例: npx serve .）で起動し、表示確認。

問題発生時のデバッグ

DevTools Console にエラーがないか確認

root.animations.length が 0 → FBX 内にアニメーションクリップが無い可能性

SkeletonHelper が表示されない → obj.isBone が false なら Bone が Group になっている

発展

複数クリップ切替 UI：AnimationClip.findByName + <select>

骨軸の可視化：各 Bone に AxesHelper を配置

glTF 形式への移行：FBXLoader → GLTFLoader に差し替え

主要クラス／メソッド
クラス / 関数	用途	重要プロパティ
THREE.FBXLoader	FBX 読み込み	.load(url, onLoad)
THREE.SkeletonHelper	Bone 可視化	コンストラクタにルート Bone を渡す
THREE.AnimationMixer	クリップ再生制御	.clipAction(clip).play()
THREE.OrbitControls	カメラ操作	マウス/タッチ入力を自動処理

トラブルシューティング早見表
症状	主な原因 & 対策
骨が表示されない	Bone が Object3D のまま。isBone 判定や SkeletonHelper の引数を確認
アニメーションが動かない	root.animations が空。FBX 再書き出し時に「アニメーションをベイク」する
モデルが寝ている／上下反転	FBX の Z-up → Y-up 変換不足。root.rotation.set(-Math.PI/2,0,0) などで補正
ブラウザがローカル読み込み拒否	CORS 制限。python -m http.server などで簡易 HTTP サーバを立てる

代替ワークフロー
ワークフロー	概要	利点
FBX → glTF 変換	fbx2gltf CLI または Blender Export	Three.js 推奨形式、ファイルサイズ削減
FBX → BVH 変換	モーションだけ必要な場合	Three.js BVHLoader の公式サンプルを流用可
外部ビューワ埋め込み	Don McCurdy 氏の glTF Viewer などを <iframe> で埋め込む	実装コスト最小、ただし変換が前提

今後の拡張アイデア
GUI：dat.GUI / lil-gui でアニメーション速度・停止などを調整

Web Components 化：Viewer をカスタム要素 <skeleton-viewer> として切り出し、再利用性向上

ドラッグ＆ドロップ読込：<input type="file"> で任意の FBX をそのまま表示

モバイル最適化：デバイスピクセル比に応じて renderer.setPixelRatio を調整