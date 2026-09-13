/* ============================================================================
 * 复古桌面场景热点
 *
 * ── 点击与拖拽共用真实物件 ──────────────────────────────────
 * 可移动实体自己处理 5px 阈值后的拖拽与阈值内点击，避免额外透明 hit mesh
 * 在 pointerdown 阶段盖住邻近物件。这里的 `size` 只控制 hover / focus 圆环，
 * 不再参与射线命中；键盘入口仍由每个热点的真实 HTML button 提供。
 *
 * ── 44×44 是怎么保证的 ──────────────────────────────────────
 * 触控目标不能小于 44×44px。热点在 3D 里，屏幕尺寸随镜头变，
 * 所以按**稳定态的机位**（自动推近终点 ABOUT_POSE）反算了一遍：
 *
 * | 热点 | 命中框投影 | 屏幕中心 |
 * |---|---|---|
 * | SKILLS 唱片机 | 227 × 282 px | (494, 244) |
 * | SELECTED WORK 文件盒 | 245 × 223 px | (544, 468) |
 * | CONTACT 打字机 | 307 × 232 px | (738, 794) |
 * | ABOUT 工牌 | 见下 | (736, 156) |
 *
 * 全部远超 44×44。打字机的中心落在画幅下方之外（稳定态镜头已经推到 About 近景，
 * 参考里打字机也只露出下半截），但命中框顶部仍在画内约 46px，
 * 键盘与顶部导航都能进同一个入口，不依赖它露出多少。
 *
 * 命中框刻意比工牌轮廓大一圈：贴着轮廓做命中区的话，ABOUT 只有 23×63。
 * ========================================================================== */

import type { Overlay } from '../store'

export type HotspotId = Exclude<Overlay, null>

export type HotspotSpec = {
  id: HotspotId
  /** 无障碍名。与顶部导航一致，读屏念出来是同一个入口 */
  label: string
  /** 首页就绪后常显的中文说明 */
  caption: string
  /**
   * 命中框中心。
   * `frame: 'world'` 用世界坐标；`'door2inner'` 用第 2 扇门内侧内容组的局部坐标，
   * 这样门转到哪它跟到哪，不需要每帧同步 —— 热点是绑在模型节点上的。
   */
  at: readonly [number, number, number]
  frame: 'world' | 'door2inner'
  /** 反馈圆环的世界尺寸；指针命中使用对应真实物件 */
  size: readonly [number, number]
  /** 局部镜头聚焦时希望在画面里占到的世界高度，用来反算机位距离 */
  focusHeight: number
  /**
   * 聚焦取景方向。缺省沿「当前机位 → 锚点」直推；
   * `'surface'` 改成沿承载面法线**正对**过去 —— 门斜着的时候直推会得到一个
   * 斜面，参考点开工牌是正面近景。
   */
  focusFacing?: 'surface'
  /** 文字标签相对命中框中心的偏移，避免标签落到画幅外 */
  labelOffset?: readonly [number, number, number]
}

export const HOTSPOTS: readonly HotspotSpec[] = [
  {
    id: 'skills',
    label: '电脑：个人能力介绍',
    caption: '个人能力介绍',
    at: [1.15, 1.32, -0.03],
    frame: 'world',
    size: [2.2, 2.08],
    focusHeight: 2.35,
  },
  {
    id: 'work',
    label: '第二格抽屉：影视海报作品',
    caption: '影视海报作品',
    at: [-0.94, 1.245, 0.77],
    frame: 'world',
    size: [0.78, 0.5],
    focusHeight: 0.68,
  },
  {
    id: 'projects',
    label: '第三格抽屉：游戏作品',
    caption: '游戏作品',
    at: [-1.54, 0.69, 0.77],
    frame: 'world',
    size: [0.92, 0.82],
    focusHeight: 0.96,
  },
  {
    id: 'contact',
    label: '桌子左下方红色收纳盒：给我留言',
    caption: '给我留言',
    at: [-3.12, -1.22, 2.46],
    frame: 'world',
    size: [0.82, 1.72],
    focusHeight: 1.82,
  },
  {
    id: 'about',
    label: '工牌：个人简介',
    caption: '基本信息',
    at: [2.36, 1.42, 0.2],
    frame: 'world',
    size: [0.8, 0.88],
    focusHeight: 1.05,
    labelOffset: [.4, .32, .1],
  },
]
