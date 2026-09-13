export const ART = '/assets/fusheng/'
export const characters = [
  { id: 'moxiu', name: '墨修', title: '画境师', specialty: '设色 · 唤醒', weapon: '画魂笔', quote: '以笔墨为舟，渡画中人归来。', bio: '盛元王朝画境师，自幼聪慧灵动，擅长以色彩点染画卷。与墨婉同门，能以画笔唤醒画中人的记忆与温情，在修复山河时调和人心。', role: '修复核心 / 画境唤醒', task: '负责辨识原色、补全画意，以画魂笔为褪色山河重新设色。', stats: [72, 96, 68, 82, 76], skills: [['丹青复苏', '点染残卷，恢复山河原有的色彩与生息。'], ['浮生显影', '唤醒画中记忆，使隐藏线索浮现。'], ['墨守山河', '封缄裂痕，为同伴维持稳定画境。']] },
  { id: 'mowan', name: '墨婉', title: '画境师', specialty: '勘察 · 修复', weapon: '画魂笔', quote: '一笔拾旧梦，一卷续山河。', bio: '盛元王朝画境师，少时随名家习画，因天赋异禀被宫廷召入，专司古卷与宫中壁画修复。意外觉醒入画之能后，肩负起修复《浮生绘卷》的重任。', role: '修复核心 / 画境勘察', task: '负责勘察画损、辨认裂隙，以理性与精细技艺复原山河。', stats: [74, 94, 64, 88, 78], skills: [['残卷寻踪', '辨认纸纹与墨迹，让画卷的损伤显影。'], ['山河复原', '沿原有笔意补绘残缺，重建画境。'], ['封缄定境', '锁住破损边缘，阻止裂隙继续扩散。']] },
  { id: 'shijun', name: '石峻', title: '山灵守嶂', specialty: '固护 · 稳定', weapon: '山魂杖', quote: '以山为骨，以石为心。', bio: '石峻原是太湖奇石所孕化的灵体，历经千年风雨方得人形。他以山为骨、以石为心，生来便与山川草木相通。因画境破损、邪影横生，自深山而出，誓要护山河安宁。', role: '守护 / 团队续航', task: '稳固画境结构，守护修复区域，为易碎的残卷提供支撑。', stats: [100, 32, 38, 14, 26], skills: [['灵息回涌', '群体治疗并回复灵力，为持续修复提供续航。'], ['山川不动', '凝聚地脉之力，稳定画境裂痕。'], ['磐石守护', '展开厚重护盾，提升团队防御，守住关键回合。']] },
  { id: 'xueruohua', name: '薛若华', title: '花神侍女', specialty: '净化 · 养护', weapon: '灵莲', quote: '以花为媒，安抚画中旧魂。', bio: '出身盛元王朝簪花贵族世家，自幼习礼乐、通诗书，兼修祭祀与占卜。因精通花卉草木之灵性，被誉为花神侍女，随画境师穿梭古画，安抚画中精怪与游魂。', role: '治疗 / 净化辅助', task: '辨识附着于画面的杂质，以莲光净化画境，恢复平衡。', stats: [70, 98, 30, 48, 65], skills: [['净化莲光', '驱散邪秽，使被遮蔽的画意重新清明。'], ['花灵祈愿', '安抚游魂，疗愈同伴并回复灵力。'], ['护佑结界', '展开莲光护盾，庇护修复中的同伴。']] },
  { id: 'suwanqing', name: '苏晚晴', title: '江南织女', specialty: '补绢 · 装裱', weapon: '灵剪', quote: '丝线相连处，山河亦如初。', bio: '江南水乡的织锦名手，自幼师承民间织坊，擅长云锦与细丝织造。家园因水患而残破后，她留守织坊，以双巧手守护昔日技艺与乡情，能将织物与画境相连。', role: '织补 / 结构修复', task: '匹配绢丝纹理，衔接画面断口，完成残卷补缀与装裱。', stats: [76, 84, 40, 80, 72], skills: [['经纬续梦', '以丝线缀补缺损，重新连接画境。'], ['灵剪裁影', '裁开缠绕画卷的虚影，清理断口。'], ['锦缎护卷', '以符纸与织物稳固卷面，保护修复成果。']] },
  { id: 'luhanzhou', name: '陆寒舟', title: '云岭游侠', specialty: '探路 · 护卫', weapon: '凌风刀 · 游影刃', quote: '行过万重山，守得一卷安。', bio: '出身云岭边地，自幼习武、以刀为伴。年少时家乡遭战火侵扰，族人散落，自此浪迹江湖。因剑胆琴心、仗义疏财而被称作云岭游侠，始终守护弱者。', role: '破阵 / 敏捷护卫', task: '探查危险的画境裂隙、清除障碍，守护队伍的修复之旅。', stats: [82, 56, 96, 90, 98], skills: [['凌风破阵', '斩开画境障碍，为同伴打开通路。'], ['游影突袭', '迅速捕捉邪影破绽，消除画境威胁。'], ['疾风守护', '以刀风震退浊气，贴身守护队友。']] },
] as const
export const chapters = [
  { name: '云起初篇', kind: '序章 · 初识画境', symbol: '卷', open: false },
  { name: '墨痕残卷', kind: '古画 · 青绿山水', symbol: '山', open: true },
  { name: '古简残章', kind: '古籍 · 旧字寻踪', symbol: '册', open: false },
  { name: '朱篆遗印', kind: '文物 · 金石留痕', symbol: '印', open: false },
]
export const steps = [
  { name: '勘察画损', tool: '画魂笔', member: '主角', hint: '用画魂笔显影，逐一勘察三个标记位置。', done: '损伤档案已记录，石峻已稳固画境。', spots: [[28, 62], [54, 40], [78, 64]] },
  { name: '净化浮尘', tool: '灵莲', member: '薛若华', hint: '选择灵莲，净化三处被浮尘遮蔽的画面。', done: '浮尘散去，画中的青绿轮廓再次显现。', spots: [[22, 40], [49, 66], [76, 34]] },
  { name: '补缀残卷', tool: '灵剪', member: '苏晚晴', hint: '选择灵剪，点击断口接续画卷的经纬。', done: '断口已接续，残卷重新成为一幅完整山河。', spots: [[35, 48], [61, 60], [84, 42]] },
  { name: '补色归卷', tool: '画魂笔', member: '主角', hint: '再次执起画魂笔，为三处褪色的山河补色。', done: '青绿重现，山河归卷。墨痕残卷修复完成。', spots: [[28, 56], [57, 36], [79, 66]] },
] as const

/** 道具名称与说明逐项沿用用户 5.jpg 原稿。 */
export const items = [
  { id: 'brush-pot', name: '笔筒', description: '修复残卷，点染山河。' },
  { id: 'palace-lamp', name: '宫灯', description: '照亮画境，驱散迷雾。' },
  { id: 'red-coral', name: '红珊瑚', description: '祥瑞之物，镇邪护佑。' },
  { id: 'pipa', name: '琵琶', description: '音律安魂，抚慰心绪。' },
  { id: 'ruizhi', name: '瑞芝', description: '仙草灵植，象征生机。' },
  { id: 'jade-abacus', name: '玉算盘', description: '筹算谋略，掌控因果。' },
  { id: 'taihu-stone', name: '太湖石', description: '奇石聚气，稳固画境。' },
  { id: 'go-board', name: '围棋', description: '博弈之道，蕴含智慧。' },
] as const

/** 13.jpg 原稿法器介绍；男女主角共享画魂笔，陆寒舟持双刃。 */
export const weapons = {
  'soul-brush': { name: '画魂笔', attributes: '点化万物 · 绘制符阵', description: '承载古人笔墨灵力，可勾画山河、点化万物。在战斗中既能绘制符阵，又能化作锋锐兵刃。' },
  'mountain-staff': { name: '山魂杖', attributes: '岩石屏障 · 守护同伴', description: '以山岳灵骨为杖，缠绕红绦与灵饰。敲击大地可唤起岩石屏障，守护同伴。' },
  'spirit-scissors': { name: '灵剪', attributes: '裁断丝线 · 斩破邪影', description: '江南织女所持之器，精巧而灵动。既能裁断丝线，也能斩破邪影之缚。' },
  'spirit-lotus': { name: '灵莲', attributes: '驱散阴翳 · 清明疗愈', description: '莲花化灵而成，洁净如玉，通灵入心。能驱散阴翳，并赐予伙伴清明与疗愈。' },
  'wind-blade': { name: '凌风刀', attributes: '破敌防御 · 开辟战机', description: '刀锋如风，势若雷霆。可于顷刻间破敌防御，开辟战机。' },
  'shadow-blade': { name: '游影刃', attributes: '轻巧迅捷 · 连携突袭', description: '短刃轻巧，快若游影。常用于连携突袭，令敌人防不胜防。' },
} as const
export const characterWeapons: Record<(typeof characters)[number]['id'], readonly (keyof typeof weapons)[]> = {
  moxiu: ['soul-brush'], mowan: ['soul-brush'], shijun: ['mountain-staff'],
  xueruohua: ['spirit-lotus'], suwanqing: ['spirit-scissors'], luhanzhou: ['wind-blade', 'shadow-blade'],
}
/** Q 版收藏独立于主角性别和队伍角色，当前仅开放墨婉。 */
export const chibiCollection = [
  { id:'mowan', art: { left: 84, top: 466, width: 300.0, height: 452.0 }, name:'墨婉', owned:true, x:4.5, width:15 },
  { id:'shijun', art: { left: 340, top: 450, width: 389.0, height: 406.0 }, name:'石峻', owned:false, x:19.8, width:15 },
  { id:'luhanzhou', art: { left: 639, top: 474, width: 292.0, height: 462.0 }, name:'陆寒舟', owned:false, x:35.2, width:12.5 },
  { id:'xueruohua', art: { left: 855, top: 448, width: 320.0, height: 470.0 }, name:'薛若华', owned:false, x:48, width:15.6 },
  { id:'suwanqing', art: { left: 1176, top: 507, width: 321.0, height: 404.0 }, name:'苏晚晴', owned:false, x:64, width:16 },
  { id:'moxiu', art: { left: 1445, top: 481, width: 344.0, height: 462.0 }, name:'墨修', owned:false, x:80.5, width:16 },
] as const
