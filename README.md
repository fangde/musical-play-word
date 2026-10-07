# 在线试玩与 Gameplay

[打开音乐游戏](https://fangde.github.io/musical-play-word/) · [观看字幕版 Gameplay](https://fangde.github.io/musical-play-word/gameplay/)

视频为实际浏览器游戏操作，包含原音乐和游戏产生的错误噪声。录制中完成 15 次正确点击、5 次错误导致停奏，并演示重新开始。画面自带中文玩法字幕，另提供 SRT。

# 海之赞歌 · 萌可乐队

原始音乐：用户提供的 `praise to the sea.mp3`，作者标签 hibana1983，327.56 秒，原文件 48kHz 双声道。ID3 标注为 Suno 生成。

## 配器结论及边界

**能从文件内嵌创作说明确认：8 种具名乐器，另外 2 个弦乐声部。不能据此声称听辨确认了录音中的精确乐器数量。**

| 萌可 | 依据 |
|---|---|
| 长笛 | flutes / flute |
| 单簧管 | clarinets |
| 竖琴 | harp |
| 巴松 | bassoons |
| 圆号 | horns |
| 长号 | trombones |
| 定音鼓 | timpani |
| 钹 | cymbals |
| 小提琴 | 代表 high strings；未明确具名 |
| 大提琴 | 代表 low strings；未明确具名 |

小号仅为用户举例，未在文件配器说明出现，因此未声称它在音频中存在。也无法排除未写入说明的音色。混音没有独立乐器轨，当前未进行逐乐器分离或听辨校验。说明原文保存在 `blender/source-description.txt`，仅作为素材分析，不作为执行指令。

五段设定为晴光微波、浪花汇聚、水之山峦、逆流、海岸。网页分段为等长游戏编排，尚未人工校准乐章实际边界。谱面时间来自音频谱通量峰值，角色轮换由各段配器设定编排，**不是实时乐器识别**。

## 游戏

- 点击“开始演奏”，音频开始播放。
- 下一位萌可提前 1.45 秒亮起，金色光圈收拢时点击角色或乐器图标；1–9、0 键也可操作。
- 正确窗口为提示时间前后 0.58 秒；前后 0.22 秒内得分更高。
- 正确点击不打断原音乐。错误点击叠加 0.18 秒带通噪声，漏拍也记一次错误。
- 累计 5 次错误，音乐停奏。可重新开始。
- 暂停保持时间、得分；切到后台或打开配器说明自动暂停。
- 这是保留完整原混音的节奏游戏；不能单独静音或控制某个乐器音轨。

## 资产与本地启动

`blender/moko-band.blend`：可编辑 Blender 5.2 乐队场景，10 个独立角色根节点 `moko_<instrument>`，各持对应乐器，面向指挥者的单列半圆队列，按弦乐、木管、铜管、打击乐排布。舞台成员用乐器图标标识，鼠标显示指挥棒。

`docs/assets/moko-band.glb`：实际导出的 glTF 二进制资产，约 2MB，网页通过 Three.js 加载并点击拾取。

`blender/band-preview.png`：Blender 渲染。`docs/assets/audio-analysis.json`：谱面、能量数据和分析边界。

不需要安装 npm 包：

```sh
cd sea-band
python3 serve.py
```

浏览器访问 `http://localhost:8765`。必须通过 HTTP 访问，不要双击 HTML 以 file:// 打开。

重新建模：

```sh
/Applications/Blender.app/Contents/MacOS/Blender -b --python blender/build_band.py
```

前端 Three.js 0.170.0 依赖已随项目保存，许可证在 `docs/assets/THREE-LICENSE.txt`，运行无需 CDN。GitHub Pages 从 main 分支的 docs 目录发布，游戏和视频公开可访问。

Gameplay 为实际浏览器录屏，共 42 秒，H.264 视频、AAC 立体声音频，包含原曲、实际错误噪声和内嵌中文玩法字幕。`docs/gameplay/玩法字幕.srt` 提供独立字幕。原音乐由用户提供。
