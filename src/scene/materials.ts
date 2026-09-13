/* ============================================================================
 * 场景材质
 *
 * 统一 Metallic-Roughness：柜体是烤漆金属，低 metalness、中等 roughness，
 * 高光靠主光和半球光形成，不在贴图里画高光。
 * 颜色取自 参考画面 的采样，再按 ACES 色调映射
 * 与曝光 1.06 反推回 albedo。
 * ========================================================================== */

export const PALETTE = {
  /** 门面：最浅的一层蓝白（采样 #d3dde7） */
  door: '#dbe6f1',
  /** 门内侧：比外侧再亮一点（采样 #d5e9f0） */
  doorInner: '#e3eef7',
  /** 柜壳与立柱（采样 #aec6de） */
  frame: '#a8c4de',
  /** 顶盖：受光最足（采样 #cfdce4） */
  cap: '#c6d9e7',
  /** 底座 */
  plinth: '#b2c8dc',
  /** 柜腔内壁：饱和的中蓝，深处靠 AO 压暗（采样 #3b628d ~ #638eae） */
  cavity: '#4d7cab',
  /** 柜腔后壁比侧壁亮一点，避免整腔糊成一块 */
  cavityBack: '#6094c0',
  /** 隔板（采样 #95b5ca） */
  shelf: '#a6c1d8',
  /** 把手底板（采样 #7398b5 在阴影里） */
  handlePlate: '#93a9b8',
  /** 把手蓝色嵌条 */
  handleGrip: '#6fa3c8',
  /** 通风槽底衬：槽与槽之间那条暗色 */
  ventBack: '#7690a8',
} as const

/** 柜体烤漆的通用参数 */
export const PAINT = { roughness: 0.52, metalness: 0.08 } as const
/** 柜腔内壁：更哑，避免内部出现不该有的反光 */
export const MATTE = { roughness: 0.82, metalness: 0.02 } as const
/** 把手：金属感稍强 */
export const METAL = { roughness: 0.36, metalness: 0.42 } as const
