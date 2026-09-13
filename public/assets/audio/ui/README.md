# 浮生若梦 UI 音效

## 当前生效：用户提供的四段 Mixkit WAV

| 使用位置 | 音频 |
| --- | --- |
| 其余按钮、返回、关闭、卡牌和腰牌 | mixkit-interface-device-click-2577.wav |
| 「进入游戏」按钮 | mixkit-game-user-interface-tone-2570.wav |
| 签到领取奖励成功 | mixkit-page-turn-chime-1106.wav |
| 墨痕残卷入口、地图及修复节点、法器选择、落笔、成功标记、完成修复 | mixkit-page-forward-single-chime-1107.wav |

原始 WAV 不作剪辑，背景音乐不变。开场预取四段文件，首次点击等待解码完成，避免先播放旧合成音。长提示音播放期间不重复叠加后续入场提示，同类连续操作最多保留一个声音。总静音、音效音量及悬停静音继续保留。下方为历史版本说明，优先以本节为准。

## 当前生效：统一按钮点击音

音色已重新制作成单次干净的机械按钮「嗒」声（38 ms）：不再使用旧版 paper 材质，没有沙沙噪声、卷纸音、混响或持续音高。所有 Demo 音效继续使用这一新版点击声。

按最新要求，Demo 的所有交互、展开/关闭、修复、奖励和吊牌音效统一播放 `ui-click-soft`，音色与音量完全一致。原语义事件和触发时机保留，100 ms 内的复合声音合并为一次点击。背景音乐不变，音效开关和音量设置仍有效。

当前只加载 `ui-click-soft` 的正式录音或合成 fallback；其他素材映射仅保留兼容，不播放。要替换统一点击声，只需在 manifest.json 登记 `"ui-click-soft": "ui-click-soft.wav"`。

以下为此前材质版的实现记录，页面分类不再对应不同音色。

当前 20 种声音全部使用 SoundManager 内置的低音量材质合成 fallback，没有独立 Foley 录音。不依赖背景音乐，也不会请求不存在的素材。

当前音色版本为「清爽」：减轻低频木响、缩短纸张和木牌拖尾，轻落笔配合短促的木/玉牌质感。普通点击约 85 ms，木牌约 120–160 ms，展开卷轴约 500 ms。合成素材峰值约 -9.4 dB，再经过各类独立音量、用户音量与限幅器；无电子 beep。

## 文件清单

- 新增 `src/components/game/audio/uiSoundManager.ts`：20 类映射、预加载与 fallback、共享 AudioContext、静音/音量、100 ms 连点保护、150 ms 吊牌保护、印章互斥、最多 4 个并发声音、动画时间同步。
- 新增 `src/components/game/audio/useGameUISounds.ts`：Demo 内统一点击及 CSS 动画事件绑定，不监听 hover 发声。
- 新增 `src/components/game/audio/UISoundSettings.tsx`、`uiSoundSettings.css`：接入现有设置弹窗，保存 soundEnabled / soundVolume。
- 修改 `GameView.tsx`、`GameCheckin.tsx`、`RepairPainting.tsx`、`useDetailMotion.ts`：成功反馈、关闭/折卷、笔触开始和人物面板动画接入。
- 修改 `src/scene/sceneAudio.ts`：仅导出共享 AudioContext 入口，背景音乐逻辑不变。
- 新增本目录 `manifest.json` 和本说明。

## 页面映射与检查

- 开始页：宣纸轻触与极轻墨迹，角色选择画卷在实际展开时响。
- 大厅：左侧纸签、顶部木牌、图鉴轻印章、底部轻点击；各面板按纸/卷轴打开。
- 图鉴与卡牌：纸张打开、纸卡选择、纸张浏览；关闭使用轻关闭与收纸。
- 地图：画卷展开、题签落点、一次节点提示；返回时折卷。
- 修复：开始落笔、画布 pointerdown 一次笔触、成功标记墨迹、完成反馈。pointermove 和 hover 静音。
- 签到：纸张展开、领取成功轻弦反馈；静态奖励展示不新增可点击业务。
- 人物详情：第一组属性信息入场响一次，腰牌在实际下落结束时响。
- 设置：独立音效开关和音量，且始终服从网站总静音。

验证：完整可用游戏流程、连续 50 次点击保护、印章互斥、最多 4 声道、总静音与独立静音、音量重载保留、80 次 pointermove 不重复发声；测试浏览器无控制台错误。正式构建和修改文件 lint 通过。测试使用隔离浏览器存档，不改用户现有存档。

替换方式：把正式录音放在本目录，在 manifest.json 中登记，例如：

```json
{
  "paper-touch": "paper-touch.wav",
  "seal-stamp": "seal-stamp.wav"
}
```

支持 wav/mp3/ogg，未登记或加载失败的项继续使用 fallback。建议素材首尾无空白、峰值不超过 -6 dB、单声道、44.1/48 kHz。不要用现代电子提示音。完整资源键：

ui-click-soft, paper-touch, paper-open, paper-close, scroll-open, scroll-close,
wood-tap, hanging-tag, card-select, seal-stamp, brush-touch, ink-soft,
reward-light, reward-claim, back-soft, close-soft, tab-switch,
repair-node, repair-start, repair-complete。

同步原则：CSS 动画使用 animationstart / transitionend，WAAPI 使用实际 currentTime。地图题签在下落动画 75% 的落点响一次；首个修复节点响一次。人物信息面板只响一次；人物右侧原画目前没有卷轴入场动画，不凭空添加动画或假定落点。当前签到是直接更新“已领取”，修复完成是直接回地图：没有奖励弹起或盖章动画，故只在成功提交时播放对应完成反馈，不伪造盖章时间。将来有这些动画时，用 soundAtAnimation(animation, 'ui.seal', contactFraction) 接入实际接触帧。
