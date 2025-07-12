#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Maya Camera Animation Importer
FBX Joint Viewerで出力されたJSON形式のカメラアニメーションをMayaにインポートするスクリプト

使用方法:
1. Maya Script Editorでこのスクリプトを実行
2. ファイルダイアログでcamera_animation.jsonを選択
3. カメラとキーフレームが自動作成される

JSON形式要件:
- 60fps固定、60フレーム（1秒）
- Maya座標系（Y-up右手）対応
- 位置・回転データは度単位
"""

import json
import os
try:
    import maya.cmds as cmds
    import maya.mel as mel
except ImportError:
    print("Maya環境で実行してください")
    exit(1)

def import_camera_animation():
    """JSONファイルからカメラアニメーションをインポート"""
    
    # ファイル選択ダイアログ
    file_filter = "JSON Files (*.json);;All Files (*.*)"
    json_files = cmds.fileDialog2(
        fileFilter=file_filter,
        dialogStyle=2,
        fileMode=1,
        caption="Camera Animation JSONファイルを選択"
    )
    
    if not json_files:
        print("ファイルが選択されませんでした")
        return False
    
    json_file = json_files[0]
    
    try:
        # JSONファイル読み込み
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print(f"JSONファイル読み込み完了: {json_file}")
        
        # メタデータ検証
        metadata = data.get('metadata', {})
        frame_rate = metadata.get('frameRate', 60)
        total_frames = metadata.get('totalFrames', 60)
        
        print(f"フレームレート: {frame_rate}fps")
        print(f"総フレーム数: {total_frames}")
        
        # カメラデータ取得
        camera_data = data.get('camera', {})
        animation_frames = camera_data.get('animation', [])
        
        if not animation_frames:
            cmds.error("アニメーションデータが見つかりません")
            return False
        
        # Mayaのフレームレートを設定
        set_maya_frame_rate(frame_rate)
        
        # カメラ作成
        camera_name = create_camera(camera_data)
        
        # キーフレーム設定
        set_keyframes(camera_name, animation_frames, metadata)
        
        # タイムレンジ設定（実際のアニメーション範囲を使用）
        start_frame = metadata.get('startFrame', 0)
        end_frame = metadata.get('endFrame', total_frames - 1)
        
        cmds.playbackOptions(min=start_frame, max=end_frame)
        
        # 現在時刻を開始フレームに設定
        cmds.currentTime(start_frame)
        
        print(f"タイムレンジ設定: {start_frame}-{end_frame}フレーム")
        
        # カメラを選択してフレーム
        cmds.select(camera_name)
        cmds.viewFit(allObjects=False)
        
        print(f"カメラインポート完了: {camera_name}")
        print(f"総キーフレーム数: {len(animation_frames)}")
        
        return True
        
    except Exception as e:
        cmds.error(f"インポートエラー: {str(e)}")
        return False

def set_maya_frame_rate(fps):
    """Mayaのフレームレートを設定"""
    
    fps_mapping = {
        24: "film",
        25: "pal",
        30: "ntsc",
        60: "ntscf"  # 60fps
    }
    
    maya_fps = fps_mapping.get(fps, "ntscf")
    
    try:
        cmds.currentUnit(time=maya_fps)
        print(f"フレームレートを{fps}fpsに設定")
    except:
        print(f"警告: フレームレート{fps}fpsの設定に失敗、デフォルトを使用")

def create_camera(camera_data):
    """カメラオブジェクトを作成"""
    
    # 既存の"ImportedCamera"を削除
    if cmds.objExists("ImportedCamera"):
        cmds.delete("ImportedCamera")
    
    # カメラ作成
    camera_transform, camera_shape = cmds.camera(name="ImportedCamera")
    
    # カメラ属性設定
    aspect_ratio = camera_data.get('aspectRatio', 1.778)
    yfov = camera_data.get('yfov', 50.0)
    
    # FOVと縦横比設定
    cmds.setAttr(f"{camera_shape}.focalLength", 35)  # デフォルト35mm
    cmds.setAttr(f"{camera_shape}.horizontalFilmAperture", 36)
    cmds.setAttr(f"{camera_shape}.verticalFilmAperture", 36 / aspect_ratio)
    
    # 垂直FOVから焦点距離を計算（概算）
    # focal_length = (36 / aspect_ratio) / (2 * tan(yfov_rad / 2)) * 25.4
    import math
    yfov_rad = math.radians(yfov)
    focal_length = (36 / aspect_ratio) / (2 * math.tan(yfov_rad / 2)) * 25.4
    cmds.setAttr(f"{camera_shape}.focalLength", focal_length)
    
    print(f"カメラ作成: {camera_transform}")
    print(f"縦横比: {aspect_ratio:.3f}, 垂直FOV: {yfov:.1f}度")
    
    return camera_transform

def set_keyframes(camera_name, animation_frames, metadata):
    """キーフレームを設定"""
    
    frame_rate = metadata.get('frameRate', 60)
    
    # キーフレーム設定前の準備
    attributes = [
        f"{camera_name}.translateX",
        f"{camera_name}.translateY", 
        f"{camera_name}.translateZ",
        f"{camera_name}.rotateX",
        f"{camera_name}.rotateY",
        f"{camera_name}.rotateZ"
    ]
    
    # 既存のキーフレームを削除
    for attr in attributes:
        cmds.cutKey(attr, clear=True)
    
    # アニメーションカーブを線形補間に設定
    cmds.keyTangent(inTangentType='linear', outTangentType='linear')
    
    # キーフレーム設定（JSONに記録されているフレーム番号をそのまま使用）
    for frame_data in animation_frames:
        frame_number = frame_data['frame']  # JSONのフレーム番号をそのまま使用
        position = frame_data['position']
        rotation = frame_data['rotation']
        
        # 位置キーフレーム
        cmds.setKeyframe(f"{camera_name}.translateX", time=frame_number, value=position[0])
        cmds.setKeyframe(f"{camera_name}.translateY", time=frame_number, value=position[1])
        cmds.setKeyframe(f"{camera_name}.translateZ", time=frame_number, value=position[2])
        
        # 回転キーフレーム（度単位）
        cmds.setKeyframe(f"{camera_name}.rotateX", time=frame_number, value=rotation[0])
        cmds.setKeyframe(f"{camera_name}.rotateY", time=frame_number, value=rotation[1])
        cmds.setKeyframe(f"{camera_name}.rotateZ", time=frame_number, value=rotation[2])
    
    # 全てのキーフレームを線形補間に設定
    for attr in attributes:
        cmds.keyTangent(attr, inTangentType='linear', outTangentType='linear')
    
    print(f"キーフレーム設定完了: {len(animation_frames)}フレーム")

def main():
    """メイン関数"""
    print("=" * 50)
    print("Maya Camera Animation Importer v1.0")
    print("FBX Joint Viewer用カメラインポーター")
    print("=" * 50)
    
    success = import_camera_animation()
    
    if success:
        print("インポート処理が正常に完了しました")
    else:
        print("インポート処理でエラーが発生しました")

# スクリプト実行
if __name__ == "__main__":
    main()