export const gamePortfolioSections = [
  { id: 'cover', label: '项目封面' },
  { id: 'overview', label: '概述与目标' },
  { id: 'world', label: '视觉方向' },
  { id: 'production', label: '美术设计' },
  { id: 'interface', label: '游戏 UI' },
  { id: 'demo', label: '交互 Demo' },
] as const

const titles = [
  '浮生若梦 · 龙跃山河主视觉', '浮生若梦 · 背景剧情', '浮生若梦 · 山河卷主视觉', '浮生绘境 · 角色群像', '浮生雅物 · 器物设计',
  '墨婉 · 人物设定与三视图', '墨修 · 人物设定与三视图', '石峻 · 人物设定与三视图', '薛若华 · 人物设定与三视图', '苏晚晴 · 人物设定与三视图', '陆寒舟 · 人物设定与三视图', '浮生绘境 · Q 版角色群像', '浮生兵器 · 专属法器设计',
  '双龙主场景 · 线稿、成稿与细节', '山河主场景 · 线稿、成稿与细节',
  '游戏 UI · 界面设计总览', '登录界面', '主城界面', '修复图鉴界面', '墨痕残卷 · 修复地图', '七日签到界面', '角色卡牌界面', '石峻 · 角色详情界面', '薛若华 · 角色详情界面',
]

export const gamePortfolioPages = titles.map((title, index) => ({ number: index + 1, title }))
export function portfolioImage(number: number, width: 960 | 1920 = 1920) {
  return `/assets/game-portfolio/${String(number).padStart(2, '0')}-${width}.webp`
}
