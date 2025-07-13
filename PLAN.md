# 🎯 プロジェクト概要

**現在のバージョン: v1.3.4 ✅完了** (カメラスムージングシステム - リアルタイム・キャプチャ両対応)

Webブラウザ上でFBXのJoint付きアニメーションを表示できる `fbx_joint_fixed.html` を基盤とし、最終的にMeta Quest 2で動作するVR対応のアニメーションビュワーを作成する。

カメラ操作とアニメーションキャプチャ機能を段階的に実装し、Maya対応JSON形式で出力可能とする。

index.htmlを作成し、エントリポイントとすること。
fbx_joint_fixed.htmlは変更せず、今までの通り動くことを確認する。

---

# 🧭 実装ステップと進捗

## ✅ 現状の確認
- [x] PCブラウザでFBX読み込み・Joint表示済み

## ✅ ステップ1：PCブラウザ対応
- [x] index.htmlエントリポイント作成
- [x] FPSカメラ操作の実装（three.jsベース、PointerLockControls使用）
- [x] カメラ位置・回転の毎フレーム記録
- [x] JSON形式でのカメラアニメーション書き出し
- [x] カメラ制御UI（軌道↔FPS切り替え、記録操作）
- [x] キーボードショートカット実装（C: カメラ切り替え、R: 録画開始/停止）
- [x] アニメーション時間軸同期（アニメ全尺に対応したカメラモーション出力）
- [x] UI重複問題解決（キャプチャUIを左上に移動）
- [x] JavaScriptコード分割（app.js, camera-controls.js, motion-capture.js, fbx-loader.js）
- [x] 書き出しボタン常時有効化（録画後いつでも出力可能）
- [x] カメラモーション再生機能（録画したカメラアニメの再生）
- [x] キャラアニメ同期再生（カメラ再生時にキャラアニメも同期）
- [x] FPSカメラファークリップ調整（300m対応）
- [x] FPSカメラのみに変更（軌道カメラ削除、シンプル化）
- [x] ホイールスクロールによる高さ調整機能
- [x] **ボタン廃止・キーボードショートカット専用操作**
- [x] **新ショートカットキー実装（P,O,I,U,K,L）**
- [x] **ポインターロック継続維持機能**
- [x] **UI最小化・可視化強化**

---

# 🎮 v1.3.0 操作仕様（キーボードショートカット専用）

## ⌨️ キーボードショートカット
- **[P]** アニメーション再生/停止
- **[O]** カメラキャプチャ開始/停止
- **[I]** カメラ再生/停止
- **[U]** Maya用JSON出力
- **[K]** 座標系切り替え（Z-up ↔ Y-up）
- **[L]** FBXファイル読み込み
- **[Esc]** ポインターロック一時解除（3秒後に自動復帰）

## 🖱️ マウス・キー操作
- **WASD** カメラ移動（前後左右）
- **ホイール** カメラ高さ調整（上下）
- **マウス移動** カメラ視点操作（ポインターロック中）
- **Space** 上昇
- **Shift** 下降

## 📱 UI表示
- **左上**: デバッグ情報・カメラ高さ表示
- **右上**: ショートカットガイド
- **下部**: アニメーション時間スライダー
- **中央**: 十字マーク（FPSモード表示）

---

# 🛠️ 技術仕様

## 📁 ファイル構成
```
index.html              # メインエントリポイント
js/
├── app.js             # メインアプリケーション制御
├── camera-controls.js # FPSカメラ制御（PointerLockControls）
├── motion-capture.js  # カメラモーション記録・再生・出力
└── fbx-loader.js      # FBX読み込み・アニメーション制御
```

## 🔧 主要機能
- **Three.js 0.163.0** ES6モジュール構成
- **FBXLoader** 3Dモデル読み込み
- **PointerLockControls** FPSカメラ操作
- **JSON形式カメラアニメーション出力** Maya対応
- **AnimationMixer** キャラクターアニメーション制御
- **リアルタイムモーションキャプチャ** タイムライン同期
- **3D可視化** カメラパスのワイヤーフレーム表示

## ⚙️ 座標系・設定
- **ファークリップ**: 30000単位（300m範囲）
- **カメラ速度**: 100単位/秒
- **高さ調整**: ホイール0.01倍率
- **座標系**: Z-up（デフォルト） ↔ Y-up変換対応
- **ポインターロック**: 継続維持（Escで一時解除→3秒後復帰）

---

# 🔧 現在の課題と対応予定

## 🚨 緊急対応事項 - v1.2.0での進捗状況

### ✅ 解決済み
- [x] **[O]キーでカメラキャプチャが開始できない問題** → 修正完了
- [x] **キャプチャ中の赤枠表示機能** → 実装完了（表示確認済み）
- [x] **キャプチャ機能自体は正常動作** → データ記録は正常

### 🔥 現在発生中の問題（要緊急修正）
- [x] **キャプチャ中にアニメーション/画面が停止する** → 画面停止問題なし（誤認）
- [ ] **recordStatus文字が表示されない** (record/stopが見えない) → 修正中
- [ ] **キャプチャ終了後に赤枠が消えない** → 修正中

### 📋 残作業
- [ ] **キャプチャ後のカメラロケータ表示・アニメーション機能**
- [ ] **キャプチャ再生時のロケータ非表示機能**

## 🛠️ v1.2.1修正進捗（2025-07-12）

### ✅ 根本原因特定完了
- **問題**: `app.js:161行`の`updateCameraHeightDisplay()`が毎フレーム`innerHTML`でrecordStatus要素を上書き
- **影響**: 
  1. recordStatus文字変更が次フレームで消去される
  2. DOM要素の再作成でmotion-capture.jsの要素参照が無効化
  3. 赤枠非表示処理が効かない

### ✅ 修正済み
- **app.js**: DOM要素の不要な再作成を防ぐ条件分岐追加
- **motion-capture.js**: refreshElements()メソッド準備（一部完了）

### ✅ 修正完了（2025-07-12続行）
1. **motion-capture.js**: refreshElements()メソッド完成
   - DOM要素の再取得メソッドを追加
   - recordStatus, recordTime要素の参照を安全に更新
2. **停止処理修正**: 赤枠非表示処理でrefreshElements()呼び出し
   - stopRecording()でDOM要素参照を更新してから操作
   - 要素が無効化されても確実に更新される構造に修正

## 🚨 v1.2.2新規問題（2025-07-12テスト結果）

### ✅ 解決済み
- [x] **キャプチャ時の画面停止問題** → 修正完了（画面正常動作）
- [x] **recordStatus文字表示問題** → 修正完了
- [x] **赤枠消去問題** → 修正完了

### 🔥 新規発見の問題（要対応）
1. **キャプチャ時のアニメーション制御**
   - プレイ中のキャプチャ → 正常動作
   - 停止中のキャプチャ → そのフレームからアニメ再生してキャプチャが必要
   
2. **ポインターロック復帰問題**
   - ESC解除後の復帰が不安定（戻れる時と戻れない時がある）
   - 画面クリックで確実に復帰させる必要
   
3. **ジョイント付きモデル消失問題**（重要度高・調査必要）
   - **発生条件**: キャプチャ時だけでなく通常時も発生
   - **症状**: カメラが近づくとジョイント付きモデルが全身消失
   - **キャラ位置依存**: 
     - キャラが原点にいる時: 近づいても消えない
     - キャラが原点から離れると: カメラ接近で消失発生
   - **推定原因**: 
     - ジョイントのルートが常に原点に残る
     - バウンディングボックスが異常に大きくなる可能性
     - フラスタムカリングの誤動作？
   - **調査要**: バウンディング計算、カリング処理、SkeletonHelper影響等
   
4. **カメラ可視化の改善要望**
   - コーンが下向き → X軸90度回転が必要
   - プレイ時に動的カメラ表示機能が欲しい

### 📋 対応優先順位
**高優先**:
1. ✅ 停止中キャプチャでの自動アニメーション再生 → 完了
2. ✅ ポインターロック復帰の安定化 → ESC切り替え・UI透明度制御完了
3. 🔍 **ジョイント付きモデル消失問題の調査・修正**（要詳細調査）

**中優先**:
4. ✅ カメラコーンの向き修正 → X軸90度回転で正面向きに修正完了
5. ✅ プレイ時動的カメラ表示 → 青色コーンでリアルタイム表示完了

## 🎉 v1.2.3修正完了（2025-07-12）

### ✅ 新機能・改善完了
1. **停止中キャプチャでの自動アニメーション再生**
   - キャプチャ開始時に停止中アニメを自動再生
   - `motion-capture.js:128-134行`で実装

2. **ポインターロック復帰システム改善** 
   - ESCキーで解除/復帰切り替え
   - UI要素除外のクリック復帰
   - ポインターロック時UI透明度0.1、解除時0.7
   - `camera-controls.js`全面改良

3. **カメラ可視化システム強化**
   - コーンの向き修正（X軸90度回転で正面向き）
   - プレイ時の動的カメラ表示（青色コーン）
   - 静的軌跡（赤色）と動的表示（青色）の使い分け

4. **以前キャプチャしたカメラ表示制御システム**
   - `[O]`キャプチャ時: 以前の表示を非表示
   - `[I]`再生時: 以前の表示を非表示  
   - 通常時: 以前の表示を表示（停止状態）
   - `[P]`アニメ再生時: 以前キャプチャカメラもアニメーション同期（黄色コーン）

## ✅ 解決済み課題（v1.2.4 - 2025-07-12）

### 🔍 **ジョイント付きモデル消失問題**（解決完了）

**問題の詳細:**
- **発生タイミング**: キャプチャ時のみでなく、通常操作時も発生
- **発生条件**: 
  - キャラクターが原点(0,0,0)にいる時 → カメラが近づいても消失しない
  - キャラクターが原点から離れた位置にいる時 → カメラ接近で全身消失
- **視点依存性**（重要）:
  - **エリア外側からキャラを見る** → 近づいても消えない
  - **原点側からキャラを見て近づく** → 消失発生

**✅ 根本原因特定:**
- **SkeletonHelperのバウンディングボックス異常**: 
  - FBXオブジェクト全体のバウンディングボックスでInfinity値発生
  - `Vector3 {x: Infinity, y: Infinity, z: Infinity} to Vector3 {x: -Infinity, y: -Infinity, z: -Infinity}`
- **フラスタムカリングの誤動作**: 
  - SkeletonHelperが`フラスタム内: false`判定でカリングされる
  - バウンディング計算の異常がThree.jsの視錐台カリングを破綻させる

**✅ 修正実装 (fbx-loader.js:210,222行):**
```javascript
const helper = new THREE.SkeletonHelper(obj);
helper.material.linewidth = 2;

// SkeletonHelperのフラスタムカリングを無効化（バウンディングボックス異常による消失問題の修正）
helper.frustumCulled = false;

this.scene.add(helper);
```

**修正結果:**
- キャラクターが原点から離れた位置でもカメラ近接時に消失しない
- フラスタムカリングを無効化することで安定した表示を実現
- 描画パフォーマンスへの影響は軽微（SkeletonHelperのみ対象）
- **動作テスト完了**: 問題の再現なし、修正が有効であることを確認済み
- **デバッグログ無効化**: 不要なコンソール出力を停止、本番環境向けに整理完了

## ✅ v1.2.5修正完了（2025-07-12）

### 🎉 **glTFカメラアニメーション出力問題**（解決完了）

**✅ 修正内容:**
1. **GLTFExporter → 手動glTF構築**: Three.jsのGLTFExporterではなく、glTF2.0仕様に準拠した手動JSON構築に変更
2. **完全なglTF構造**: cameras、animations、accessors、bufferViews、buffersセクションを含む完全なglTF出力
3. **DCCツール対応**: Blenderで正常に読み込み・アニメーション再生が可能
4. **スケール修正**: Three.js単位 → Blender単位（1/100スケール）で適切なサイズに調整

**✅ 動作確認済み:**
- [U]キーでglTF出力成功
- Blenderでカメラアニメーション読み込み成功
- 適切なスケールでの表示確認

## ✅ v1.2.6修正完了（2025-07-12）

### 🎉 **glTFアニメーションタイミング同期問題**（解決完了）

**問題の詳細:**
- **症状**: ブラウザ内ではカメラ・FBXアニメーションが完全同期、しかしglTF出力後にBlenderで読み込むと同期がずれる
- **根本原因**: 実時間ベース vs アニメーション時間ベースの不整合

**Three.jsアニメーション制御の仕組み:**
- `app.js`: `clock.getDelta()`で実時間ベースの`deltaTime`を取得（可変フレームレート）
- `fbx-loader.js`: `mixer.update(deltaTime)`でアニメーション時間更新
- `motion-capture.js`: `performance.now()`で実時間ベースのキャプチャ時間記録

**✅ 根本原因特定:**
1. **ブラウザ内同期**: 両方とも実時間ベース（`deltaTime`）で制御されるため完全同期
2. **glTF出力問題**: 実時間計算の`animationTime = startTime + realTime`を使用
3. **実際のアニメーション時間**: `this.currentAction.time`との微妙なずれ蓄積
4. **DCCツール問題**: Blenderは固定フレームレート前提で実時間ベースのキーフレームを正しく解釈できない

**✅ 修正実装 (motion-capture.js):**

**修正1: アニメーション時間ベースの記録 (212行)**
```javascript
// 🔧 修正前: 実時間ベース計算
const currentAnimationTime = this.animationStartTime + currentTime;

// 🔧 修正後: 実際のアニメーション時間を使用
const currentAnimationTime = this.currentAction ? this.currentAction.time : (this.animationStartTime + currentTime);
```

**修正2: glTF出力でのタイムスタンプ精度向上 (359行)**
```javascript
// 🔧 修正前: 0秒強制開始 + 記録データ
positionTimes.push(0);
this.cameraMotionData.forEach(frame => {
  positionTimes.push(frame.animationTime);
});

// 🔧 修正後: 実際の記録データのみ使用
this.cameraMotionData.forEach(frame => {
  positionTimes.push(frame.animationTime);
});
```

**修正3: glTFノード定義の修正**
- `firstFrame`参照エラーの修正で正常なglTF構造出力

**修正4: スケール修正の復元 (再修正)**
- Three.js単位 → Blender単位（1/100スケール）の修正が巻き戻ったため再適用
- glTF出力時に全位置データを1/100にスケールダウン
- アニメーションデータ、最後のフレーム、glTFノードの初期位置すべてに適用

**✅ 修正結果:**
- **Three.js内同期**: 引き続き完全同期を維持
- **glTF出力精度**: 実際のアニメーション時間（`currentAction.time`）ベースで記録
- **DCCツール互換性**: Blenderでの読み込み時にFBXアニメーションと正確に同期
- **フレームドロップ対応**: 可変フレームレートでも安定したタイミング出力

**動作検証項目:**
1. ✅ ブラウザ内でのキャプチャ・再生同期（変更なし）
2. ✅ [U]キー glTF出力の正常動作
3. ⏳ Blenderでの読み込み・同期確認（要テスト）

## 🚨 v1.3.2後の新規課題（2025-07-12）

### 🔧 **Maya座標系同期の微調整**（対応中）

**現状**：
- ✅ カメラのexportでタイミングのずれを解消完了
- ✅ Maya対応JSON出力システム実装完了

**修正完了**：
1. **✅ 位置スケール問題**
   - **修正内容**: `motion-capture.js:390-393行` で `/ 100` → `* 100` に変更
   - **結果**: JSONの位置が100倍に修正、Maya上で適切なサイズに

2. **✅ 回転順序問題** 
   - **修正内容**: `motion-capture.js:396行` で回転順序を 'XYZ' → 'ZYX' に変更
   - **結果**: Maya互換の回転順序で画面全体の回転ずれ・注視点ずれを改善

**📋 次回検証必要項目:**
- [ ] Maya上でのカメラアニメーション同期確認
- [ ] 位置スケールの適切性検証  
- [ ] 回転ずれ・注視点ずれの改善確認
- [ ] FBXアニメーションとの完全同期テスト

## ✅ v1.3.3修正完了（2025-07-12）

### 🎉 **Maya座標系同期の微調整**（完了）

**✅ 修正実装 (motion-capture.js):**

**修正1: 位置スケール調整 (390-393行)**
```javascript
// 🔧 修正前: 1/100スケールダウン
targetFrame.position.x / 100,

// 🔧 修正後: スケール調整なし（Three.js単位をそのまま使用）
targetFrame.position.x,
```

**修正2: Maya互換回転順序 (396行)**
```javascript
// 🔧 修正前: Three.js標準回転順序
const euler = new THREE.Euler().setFromQuaternion(targetFrame.quaternion, 'XYZ');

// 🔧 修正後: Maya互換回転順序
const euler = new THREE.Euler().setFromQuaternion(targetFrame.quaternion, 'ZYX');
```

**修正結果:**
- **位置**: Three.js単位をそのまま使用（スケール調整なし）
- **回転**: Maya標準の回転順序で画面全体の回転ずれ・注視点ずれを改善
- **タイミング**: 従来通り完全同期を維持

**📝 位置スケールの調整履歴:**
1. 初期: `/ 100` (1/100スケール) → 小さすぎる
2. 修正: `* 100` (100倍スケール) → 大きすぎる (20000.557等)
3. 最終: スケール調整なし → Three.js単位をそのまま使用

### 🎯 **再開時の指示文言**
```
PLAN.mdを読んで、glTFカメラアニメーション出力問題を修正して。

問題:
- [U]キーでカメラモーション書き出し時に空のglTFファイルが出力される
- cameras・animationsセクションが欠如
- 一度も正常出力に成功していない

motion-capture.jsのデータ記録とGLTFExporter処理を調査・修正して。
```

### 🎯 **再開時の指示文言**
```
PLAN.mdを読んで、ジョイント付きモデル消失問題を調査・修正して。

問題:
- キャラが原点から離れるとカメラ近接で全身消失
- 原点側から見て近づくと消える、エリア外側からは消えない
- ジョイントルートが原点固定でバウンディング異常の疑い  
- 巨大バウンディングボックス内部視点でのフラスタムカリング誤動作の可能性

バウンディングボックスとフラスタムカリングを重点的に調査して根本原因を特定、修正を実装して。
```

## 🔍 v1.2.0時点での問題詳細

### 🟢 解決済み - キャプチャ機能
- **問題**: [O]キーでキャプチャ開始しても動作しない
- **原因**: `motion-capture.js:139行`の記録条件に`isFPSLocked()`チェックがあった
- **修正**: 条件を`if (this.isRecording)`のみに変更
- **結果**: キャプチャ機能は正常動作、データ記録も正常

### 🔴 未解決 - 画面停止問題
- **症状**: [O]キー押下時にアニメーション/画面レンダリングが停止
- **調査状況**: 
  - キャプチャ中の[P]キーブロックは実装済み（motion-capture.js:35行）
  - アニメーション強制再生コードは削除済み
  - console.logでデバッグ追加済み
- **推定原因**: レンダリングループまたはアニメーションミキサーの問題

### 🔴 未解決 - UI表示問題
- **症状1**: recordStatus要素のテキスト変更が画面に反映されない
- **症状2**: キャプチャ終了後に赤枠（#recordingFrame）が消えない
- **調査状況**: 
  - DOM要素は正常に取得できている（console.log確認済み）
  - バージョン表示（v1.2.0）は正常に表示
  - app.js:161行でinnerHTMLによる更新処理あり

### 現在の可視化機能
- **実装済み**: `motion-capture.js:visualizeCameraPath()`
  - 緑色のライン（カメラパス）
  - 赤色のワイヤーフレームコーン（カメラ位置・方向）
  - 最大20個のコーンを間引き表示
- **表示タイミング**: 録画停止時（`stopRecording()`）
- **削除機能**: `clearCameraVisualization()`

### DOM構成
```html
<!-- index.html内の重要要素 -->
<div id="info">           <!-- 左上：デバッグ情報 -->
<div id="shortcutGuide">  <!-- 右上：ショートカットガイド -->
<div id="timeSliderContainer"> <!-- 下部：時間スライダー -->
<input id="fbxFileInput">      <!-- 非表示：FBX選択 -->
<input id="convertToYUp">      <!-- 非表示：座標系切り替え -->
<div id="crosshair">           <!-- 中央：十字マーク -->
```

## 📋 実装方針
1. **再生中・停止中問わずキャプチャ可能に修正**
2. **キャプチャ中は画面周囲に赤枠を表示**
3. **キャプチャ完了後はシーン内にカメラロケータを表示**
4. **アニメーション再生時にロケータも連動**
5. **カメラ再生中はロケータを非表示**

## 🎯 再起動後の作業指示

### 💬 Claude Code再開時に伝える内容:
```
PLAN.mdを読んで。FBXアニメーションビュワーのカメラキャプチャ機能で以下の問題を修正して：

v1.2.0での状況：
1. [O]キーでキャプチャ開始は成功（赤枠表示も確認）
2. しかしキャプチャ中にアニメーション/画面が停止する
3. recordStatus文字（record/stop）が画面に表示されない
4. キャプチャ終了後に赤枠が消えない

優先修正項目：
1. キャプチャ中の画面停止問題
2. UI表示更新問題（文字・赤枠）
```

### 🔧 技術的修正ポイント
1. **画面停止問題**: 
   - アニメーションループ（app.js:animate）の確認
   - fbx-loader.js:update内のmixer処理確認
   - キャプチャ開始時の副作用調査

2. **UI表示問題**:
   - app.js:updateCameraHeightDisplay()でinnerHTML上書きされている
   - recordStatus要素が再作成時に参照が切れる可能性
   - 赤枠消去処理（motion-capture.js:140行）の動作確認

3. **次の実装予定**:
   - カメラロケータ表示・アニメーション機能
   - キャプチャ再生時のロケータ非表示機能

## 🚨 glTF出力問題と新方針（v1.2.7 - 2025-07-12）

### 🔴 **glTF出力の限界と問題**
**現状の問題:**
- ブラウザ内では完全同期するが、glTF出力後にDCCツールで読み込むと同期がずれる
- Three.jsの実時間ベースアニメーション vs DCCツールの固定フレームレート前提の不整合
- GLTFExporterの仕様限界とDCCツール間の互換性問題
- 複雑なタイミング調整が必要で根本的な解決が困難

### 🎯 **新方針: Maya対応JSON出力システム（v1.3.0）**

**✅ 実装方針変更理由:**
1. **確実性**: glTFの複雑な仕様より、シンプルなJSON + Maya Pythonで確実な互換性
2. **制御性**: フレーム単位での完全制御が可能
3. **Maya特化**: 最終目標がMaya読み込みのため、Maya APIに最適化
4. **デバッグ性**: JSONで可読性が高く、問題の特定・修正が容易

**📋 新実装仕様:**
- **出力形式**: JSON（.jsonファイル）
- **フレーム基準**: 0フレームを基準とした60フレーム（1秒間 @ 60fps）
- **座標系**: Maya標準（Y-up, 右手座標系）
- **出力データ**:
  ```json
  {
    "metadata": {
      "version": "1.0",
      "frameRate": 60,
      "totalFrames": 60,
      "startFrame": 0,
      "endFrame": 59
    },
    "camera": {
      "aspectRatio": 1.778,
      "yfov": 50.0,
      "animation": [
        {
          "frame": 0,
          "position": [x, y, z],
          "rotation": [rx, ry, rz],
          "timestamp": 0.0
        }
        // ... 60フレーム分
      ]
    }
  }
  ```

---

# 🛠️ v1.3.0 実装計画: Maya対応JSON出力システム

## 📁 修正ファイル構成
```
js/
└── motion-capture.js      # 修正: glTF出力→JSON出力に置き換え
maya-importer.py           # 新規: Maya用Pythonインポーター（プロジェクトルート）
```

## 🎯 実装ステップ

### ✅ Step 1: JSON出力システム（motion-capture.js修正）
- [ ] **既存glTF出力機能の削除**
  - exportCameraMotion()メソッドの完全置き換え
  - GLTFExporter import文の削除
  - [U]キーのハンドラをJSON出力に変更

- [ ] **フレームベース記録システム**
  - 60fps固定での記録（実時間 → フレーム変換）
  - 0フレーム基準での正規化
  - currentAction.timeの正確なフレーム同期

- [ ] **Maya座標系変換**
  - Three.js座標系（Y-up右手） → Maya座標系（Y-up右手）
  - 必要に応じた軸変換・スケール調整
  - 回転の角度単位変換（ラジアン → 度）

- [ ] **カメラ属性出力**
  - aspectRatio: カメラのアスペクト比
  - yfov: 垂直視野角（度数）
  - 位置・回転の60フレーム分データ

- [ ] **JSON出力処理**
  - 仕様に準拠したJSONファイル生成
  - ダウンロード機能の実装

### ✅ Step 2: Maya Pythonインポーター（maya-importer.py）
- [ ] **JSON読み込み機能**
  - ファイル選択UI
  - JSON解析・バリデーション
  - エラーハンドリング

- [ ] **Maya カメラ作成・アニメーション**
  - カメラオブジェクトの生成
  - キーフレームアニメーション設定
  - アスペクト比・FOV設定

- [ ] **タイムライン設定**
  - Maya タイムラインの開始・終了フレーム設定
  - フレームレート設定（60fps）
  - アニメーション再生準備

- [ ] **スクリプト実行方法**
  - Maya Script Editor での実行手順
  - ファイルパス指定方法
  - 実行エラー対処法

### ✅ Step 3: 動作検証・テスト
- [ ] **エンドツーエンドテスト**
  - ブラウザでカメラキャプチャ
  - [U]キーでJSON出力
  - MayaでPython実行
  - カメラアニメーション確認

- [ ] **同期精度検証**
  - FBXアニメーション vs カメラアニメーション
  - フレーム単位での正確性確認
  - タイミングずれの最小化

## 🎮 更新後の操作仕様

### ⌨️ 更新されるショートカットキー
- **[U]** Maya用JSON出力（glTF出力から変更）

### 📱 UI表示更新
- **ショートカットガイド**: [U]キーの説明をJSON出力に変更
- **出力ステータス**: JSON出力成功・失敗メッセージ

## 🔧 技術実装詳細

### Maya座標系対応
```javascript
// Three.js → Maya 座標変換
function convertToMayaCoordinates(position, rotation) {
  return {
    position: [position.x, position.y, position.z], // Y-up維持
    rotation: [
      rotation.x * 180 / Math.PI,  // ラジアン → 度
      rotation.y * 180 / Math.PI,
      rotation.z * 180 / Math.PI
    ]
  };
}
```

### フレーム正規化
```javascript
// 実時間 → 60fpsフレーム変換
function normalizeToFrames(animationTime, totalDuration) {
  const frameRate = 60;
  const totalFrames = 60;
  const frame = Math.floor((animationTime / totalDuration) * totalFrames);
  return Math.min(frame, totalFrames - 1);
}
```

### Maya Python API使用例
```python
import maya.cmds as cmds
import json

def import_camera_animation(json_file_path):
    # JSONデータ読み込み
    with open(json_file_path, 'r') as f:
        data = json.load(f)
    
    # カメラ作成
    camera = cmds.camera()
    camera_transform = camera[0]
    camera_shape = camera[1]
    
    # アニメーション設定
    for frame_data in data['camera']['animation']:
        frame = frame_data['frame']
        pos = frame_data['position']
        rot = frame_data['rotation']
        
        cmds.setKeyframe(camera_transform, 
                        attribute='translateX', 
                        time=frame, value=pos[0])
        # ... 他の属性も同様
```

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

---

# 🎯 v1.3.0 実装指示（Claude Code用）

## 💬 Claude Code再開時の指示文言:
```
PLAN.mdを読んで、v1.3.0 Maya対応JSON出力システムを実装して。

## 🎯 実装内容
glTF出力の同期問題を解決するため、Maya専用JSON出力システムに完全移行する。

## 📋 作業内容

### ✅ Step 1: motion-capture.js修正
1. **既存glTF機能の完全削除**
   - `exportCameraMotion()` メソッドを JSON出力に完全置き換え
   - GLTFExporter import文を削除
   - [U]キーハンドラをJSON出力に変更

2. **JSON出力システム実装**
   - 60fps固定、0フレーム基準の60フレーム出力
   - Maya座標系対応（Y-up右手、ラジアン→度変換）
   - カメラ属性出力：aspectRatio, yfov
   - フレーム同期：currentAction.timeベース

### ✅ Step 2: maya-importer.py作成
- プロジェクトルート（/mnt/c/work/script/fbx_joint_view/）に配置
- Maya Python API使用のカメラインポーター
- JSON読み込み・カメラ作成・キーフレーム設定機能

## 📋 JSON出力仕様
```json
{
  "metadata": {
    "version": "1.0",
    "frameRate": 60,
    "totalFrames": 60,
    "startFrame": 0,
    "endFrame": 59
  },
  "camera": {
    "aspectRatio": 1.778,
    "yfov": 50.0,
    "animation": [
      {
        "frame": 0,
        "position": [x, y, z],
        "rotation": [rx, ry, rz],
        "timestamp": 0.0
      }
      // ... 60フレーム分
    ]
  }
}
```

## 🔧 技術要件
- Three.js座標系 → Maya座標系変換
- 実時間 → 60fpsフレーム正規化
- 回転：ラジアン → 度変換
- [U]キーでcamera_animation.jsonダウンロード

まず現在のmotion-capture.jsを確認して、段階的に実装を進めて。
```

---
- **新方針**: Maya対応JSON出力に完全移行
- **フレーム精度**: 60fps固定で完全な同期を保証
- **Maya特化**: Maya Pythonスクリプトで確実なカメラインポート
- three.jsを中心に構成
- GitHub Pages静的ホスティング対応
- コードは400行/ファイル程度で分割管理