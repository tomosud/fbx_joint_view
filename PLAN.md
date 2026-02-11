# 🎯 プロジェクト概要

**現在のバージョン: v1.3.5** (ルートボーン非表示 + FBXファイル読み込みUI)

Webブラウザ上でFBXのJoint付きアニメーションを表示できる `fbx_joint_fixed.html` を基盤とし、最終的にMeta Quest 2で動作するVR対応のアニメーションビュワーを作成する。

カメラ操作とアニメーションキャプチャ機能を段階的に実装し、Maya対応JSON形式で出力可能とする。

index.htmlを作成し、エントリポイントとすること。
fbx_joint_fixed.htmlは変更せず、今までの通り動くことを確認する。

---

# 🧭 実装ステップと進捗

## ✅ ステップ1：PCブラウザ対応（完了）
- [x] index.htmlエントリポイント作成
- [x] FPSカメラ操作（PointerLockControls）
- [x] カメラモーションキャプチャ・再生・JSON出力
- [x] キャラアニメ同期再生
- [x] JavaScriptコード分割（app.js, camera-controls.js, motion-capture.js, fbx-loader.js）
- [x] キーボードショートカット専用操作（P,O,I,U,K,L）
- [x] ポインターロック継続維持・UI透明度制御
- [x] SkeletonHelper消失問題修正（frustumCulled無効化）
- [x] Maya対応JSON出力システム（glTFから移行）
- [x] カメラスムージングシステム
- [x] ルートボーン第一階層の接続ライン非表示
- [x] FBXファイル読み込みUIの可視化

---

# 🎮 操作仕様

## ⌨️ キーボードショートカット
- **[P]** アニメーション再生/停止
- **[O]** カメラキャプチャ開始/停止
- **[I]** カメラ再生/停止
- **[U]** Maya用JSON出力
- **[K]** 座標系切り替え（Z-up ↔ Y-up）
- **[L]** FBXファイル読み込み
- **[J]** スムージング切替
- **[Esc]** ポインターロック一時解除

## 🖱️ マウス・キー操作
- **WASD** カメラ移動（前後左右）
- **ホイール** カメラ高さ調整（上下）
- **マウス移動** カメラ視点操作（ポインターロック中）
- **Space** 上昇 / **Shift** 下降

## 📱 UI配置
- **左上**: バージョン・カメラ高さ・スムーズ状態・録画ステータス
- **右上**: ショートカットガイド
- **左下**: FBXファイル読み込みUI + 座標系切替チェックボックス
- **下部中央**: アニメーション時間スライダー
- **中央**: 十字マーク（FPSモード表示）

---

# 🛠️ 技術仕様

## 📁 ファイル構成
```
index.html              # メインエントリポイント
fbx_joint_fixed.html    # 再生専用ビュワー（変更不可）
maya-importer.py        # Maya用カメラインポーター
js/
├── app.js             # メインアプリケーション制御
├── camera-controls.js # FPSカメラ制御（PointerLockControls）
├── motion-capture.js  # カメラモーション記録・再生・JSON出力
└── fbx-loader.js      # FBX読み込み・スケルトン表示・アニメーション制御
```

## 🔧 主要技術
- **Three.js 0.163.0** ES6モジュール構成（CDN: unpkg）
- **FBXLoader** / **SkeletonHelper** / **AnimationMixer**
- **PointerLockControls** FPSカメラ操作
- **Maya互換JSON出力** 60fps固定フレーム・ZYX回転順序

## ⚙️ 設定値
- ファークリップ: 30000単位（300m範囲）
- 座標系: Z-up（デフォルト） ↔ Y-up変換対応
- ポインターロック時UI透明度: 0.1 / 解除時: 0.7

## 🔑 実装ポイント
- **SkeletonHelper消失防止**: `helper.frustumCulled = false`（バウンディングボックス異常対策）
- **ルートボーン非表示**: `hideRootBoneConnections()` で `updateMatrixWorld` をオーバーライド、第一階層ラインをゼロ長化
- **DOM安定化**: `updateCameraHeightDisplay()` でrecordStatus/recordTime要素の存在チェック後に更新

---

# ⏳ 将来の実装予定

## ステップ2：VR対応（Meta Quest 2）
- [ ] WebXRベースのVR空間対応
- [ ] VR内でのカメラ操作UI
- [ ] カメラトラック記録・保存（JSON形式対応）

## ステップ3：FBX差し替え対応
- [ ] ユーザーによるFBX差し替えUI（Quest対応方法は要検討）

## ステップ4：DCCツール拡張対応
- [ ] Blender用Pythonアドオン（JSON読み込み）
- [ ] 3ds Max用MaxScript（JSON読み込み）
- [ ] Cinema 4D用スクリプト（JSON読み込み）
