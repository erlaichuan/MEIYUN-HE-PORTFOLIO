/* 站点全部文案与作品数据 —— 与参考逐帧核对整理 */

export const SITE = {
  owner: 'AVA LI',
  tagline: "AVA LI — PORTFOLIO '26",
  year: '2026',
}

/* ── 出处与源码 ───────────────────────────────────────
 * 本站是对小红书博主 momo 的 Locker 个人网站的复刻练习：视觉创意归原作者，
 * 这条出处要一直挂在页面上（左下角 Credit 组件），不是只写在 README 里。
 * repoUrl 是开源仓库地址，换仓库时只改这一处。 */
export const CREDIT = {
  author: 'momo',
  platform: '小红书',
  originUrl:
    'https://www.xiaohongshu.com/discovery/item/6a852ae7000000002500b24e?xsec_token=ABxWdb99F51QhPGOvNNuLGxYSbTeGIKFnMDujjIeP1Kr8=',
  repoUrl: 'https://github.com/qzz0518/locker-folio',
}

/* ── 顶部导航 ─────────────────────────────────────────── */
export const NAV = [
  { id: 'about', label: '个人简介' },
  { id: 'skills', label: '能力展示' },
  { id: 'work', label: '影视海报作品' },
  { id: 'projects', label: '游戏作品' },
  { id: 'contact', label: '联系我' },
] as const

/* ── ABOUT：工牌 ─────────────────────────────────────── */
export const ABOUT = {
  cardNo: 'PERSONAL DESIGN PORTFOLIO · 2026',
  title: ['ABOUT ME'],
  titleCn: '个人简介',
  sub: 'PERSONAL PORTFOLIO ID CARD',
  fields: [
    { k: 'NAME / 姓名', v: '贺渼云' },
    { k: 'POSITION / 职业', v: '视觉设计师 / 平面设计师' },
    { k: 'EXPERIENCE / 方向', v: '影视海报 · 游戏视觉 · AIGC' },
    { k: 'LANGUAGE / 语言能力', v: '意大利语｜CELI B2\n英语｜IELTS 5.5' },
    {
      k: 'EDUCATION / 教育背景',
      v: '意大利博洛尼亚美术学院｜硕士\n视觉艺术绘画\n郑州轻工业大学｜本科\n环境艺术设计',
    },
    {
      k: 'SOFTWARE / 软件技能',
      v: 'DESIGN\nPhotoshop / Illustrator / Procreate\nVIDEO & 3D\nPremiere Pro / Final Cut Pro / TouchDesigner / SketchUp\nAIGC\nChatGPT / 即梦 / Midjourney / Stable Diffusion',
    },
  ],
  email: '953462207@qq.com / mrsmeimei02@gmail.com',
  phone: '18872863246',
  specializedTitle: 'SPECIALIZED IN',
  specializedBody: 'FILM POSTER / GAME VISUAL / AIGC',
  stampTop: 'CERTIFIED',
  stampMid: '2026',
  stampRing: 'PERSONAL PORTFOLIO · HE MEIYUN ·',
  footL: 'IN MY CREATIVE ERA',
  footR: 'PERSONAL DESIGN PORTFOLIO · 2026',
}

/* ── SKILLS：三张卡片 ─────────────────────────────────── */
export type SkillCard = {
  no: string
  kicker: string
  title: string
  desc: string
  rows: { k: string; v: string }[]
  bg: string
  fg: string
}

export const SKILLS: SkillCard[] = [
  {
    no: '02',
    kicker: '02 / GAME VISUAL',
    title: '游戏视觉',
    desc: '具备游戏美术设定、界面及推广素材的多场景视觉设计能力。',
    rows: [
      { k: 'ART', v: '角色 / 场景 / 道具' },
      { k: 'UI', v: '游戏界面 / 页面设计' },
      { k: 'APPLICATION', v: '视觉应用 / 延展设计' },
    ],
    bg: '#ffbb29',
    fg: '#543812',
  },
  {
    no: '01',
    kicker: '01 / FILM & TV POSTER DESIGN',
    title: '影视海报设计',
    desc: '围绕剧情、人物关系与情绪氛围，完成主视觉及系列宣发海报设计。',
    rows: [
      { k: 'KV', v: '主视觉 / 角色海报' },
      { k: 'IMAGE', v: '人物精修 / 场景合成' },
      { k: 'LAYOUT', v: '字体设计 / 版式设计' },
    ],
    bg: '#e17a19',
    fg: '#ffe9d6',
  },
  {
    no: '03',
    kicker: '03 / AIGC WORKFLOW',
    title: 'AIGC创作',
    desc: '将生成式 AI 融入创意探索、素材生成与视觉落地流程。',
    rows: [
      { k: 'IMAGE', v: '即梦 AI / Nano Banana / Stable Diffusion / Midjourney' },
      { k: 'GENERATE', v: '人物 / 场景 / IP' },
      { k: 'WORKFLOW', v: '生成 / 重绘 / PS精修' },
    ],
    bg: '#fff9f0',
    fg: '#c16b1a',
  },
]

/* ── SELECTED WORK：四个文件夹 ───────────────────────── */
export const SELECTED_WORK_FOLDERS = [
  { id: 'longdrama', en: ['DRAMA SERIES'], cn: '长剧海报', bg: '#d9a18b', fg: '#5b201b', cnFg: '#5b201b', z: 4 },
  {
    id: 'design',
    en: ['LIVE ACTION'],
    cn: '短剧真人剧海报',
    bg: '#c8f322',
    fg: '#1b28d8',
    cnFg: '#1b28d8',
    x: 0,
    y: 0,
    rot: -7,
    z: 6,
  },
  {
    id: 'photograph',
    en: ['AI DRAMA'],
    cn: 'AI剧海报设计',
    bg: '#1b28d8',
    fg: '#c8f322',
    cnFg: '#ffffff',
    x: 30,
    y: -18,
    rot: 3,
    z: 2,
  },
] as const

/* 场景抽屉的内容概览：独立于顶部导航栏目配置。 */
export const POSTER_DRAWER_FOLDERS = [
  { id: 'longdrama', en: ['DRAMA SERIES'], cn: '长剧海报', bg: '#d9a18b', fg: '#5b201b', cnFg: '#5b201b', z: 4 },
  { id: 'design', en: ['LIVE ACTION'], cn: '短剧真人剧海报', bg: '#c8f322', fg: '#1b28d8', cnFg: '#1b28d8', z: 6 },
  { id: 'photograph', en: ['AI DRAMA'], cn: 'AI剧海报设计', bg: '#1b28d8', fg: '#c8f322', cnFg: '#ffffff', z: 2 },
] as const

export const GAME_DRAWER_FOLDERS = [
  { id: 'game', en: ['GAME ART'], cn: '浮生若梦 · 游戏视觉', bg: '#e9d7ac', fg: '#81402b', cnFg: '#81402b', z: 3 },
] as const

/* Game Project 导航与游戏抽屉进入同一个游戏作品集合。 */
export const PROJECT_FOLDERS = GAME_DRAWER_FOLDERS

/* ── DESIGN › 01 POSTERS ─────────────────────────────── */
export const POSTERS = [
  { src: 'selected-001', title: 'SELECTED POSTER 001', aspect: 2 / 3 },
  { src: 'selected-002', title: 'SELECTED POSTER 002', aspect: 2 / 3 },
  { src: 'selected-003', title: 'SELECTED POSTER 003', aspect: 2 / 3 },
  { src: 'selected-004', title: 'SELECTED POSTER 004', aspect: 2 / 3 },
  { src: 'selected-005', title: 'SELECTED POSTER 005', aspect: 3 / 4 },
  { src: 'selected-006', title: 'SELECTED POSTER 006', aspect: 3 / 4 },
  { src: 'selected-007', title: 'SELECTED POSTER 007', aspect: 2 / 3 },
  { src: 'selected-008', title: 'SELECTED POSTER 008', aspect: 2 / 3 },
  { src: 'selected-009', title: 'SELECTED POSTER 009', aspect: 2 / 3 },
  { src: 'selected-010', title: 'SELECTED POSTER 010', aspect: 2 / 3 },
  { src: 'selected-011', title: 'SELECTED POSTER 011', aspect: 2 / 3 },
  { src: 'selected-012', title: 'SELECTED POSTER 012', aspect: 2 / 3 },
  { src: 'selected-013', title: 'SELECTED POSTER 013', aspect: 3 / 4 },
  { src: 'selected-014', title: 'SELECTED POSTER 014', aspect: 3 / 4 },
  { src: 'selected-015', title: 'SELECTED POSTER 015', aspect: 2 / 3 },
  { src: 'selected-016', title: 'SELECTED POSTER 016', aspect: 2 / 3 },
  { src: 'selected-017', title: 'SELECTED POSTER 017', aspect: 3 / 4 },
  { src: 'selected-018', title: 'SELECTED POSTER 018', aspect: 2 / 3 },
  { src: 'selected-019', title: 'SELECTED POSTER 019', aspect: 2 / 3 },
  { src: 'selected-020', title: 'SELECTED POSTER 020', aspect: 3 / 4 },
  { src: 'selected-021', title: 'SELECTED POSTER 021', aspect: 3 / 4 },
  { src: 'selected-022', title: 'SELECTED POSTER 022', aspect: 2 / 3 },
  { src: 'selected-023', title: 'SELECTED POSTER 023', aspect: 2 / 3 },
  { src: 'selected-024', title: 'SELECTED POSTER 024', aspect: 3 / 4 },
  { src: 'selected-025', title: 'SELECTED POSTER 025', aspect: 3 / 4 },
  { src: 'selected-026', title: 'SELECTED POSTER 026', aspect: 2 / 3 },
  { src: 'selected-027', title: 'SELECTED POSTER 027', aspect: 2 / 3 },
]

/* ── DESIGN › 03 IP DESIGN ───────────────────────────── */
export const IP_DESIGN = {
  kicker: '03 / IP DESIGN',
  title: 'IP DESIGN',
  cn: 'IP 形象设计',
  desc: '围绕一个圆润的原创角色展开：从基础形体、材质到延展物料，建立一套可复用的形象语言。',
  swatches: [
    { name: 'CLAY', hex: '#e3d3bb' },
    { name: 'SAND', hex: '#d6c3a5' },
    { name: 'CREAM', hex: '#f2eadd' },
    { name: 'INK', hex: '#2c2925' },
  ],
  specs: [
    { k: 'FORM', v: '球体 / 圆角几何体' },
    { k: 'MATERIAL', v: '哑光陶土 · 微磨砂' },
    { k: 'OUTPUT', v: '3D 模型 / 表情包 / 周边' },
  ],
}

/* ── PHOTOGRAPH ──────────────────────────────────────── */
export const PHOTOS = [
  'p1', 'p4', 'p2', 'p6',
  'p5', 'p3', 'p6', 'p1',
  'p2', 'p5', 'p4', 'p3',
  'p6', 'p1', 'p3', 'p5',
]

/* ── VIDEO ───────────────────────────────────────────── */
export const VIDEOS = [
  {
    no: '01',
    en: 'CHARACTER PV',
    cn: '动漫单人角色 PV',
    desc: 'Minimax 辅助生成制作二次元风格单人角色宣传短片',
    cover: 'pv1',
    href: 'https://www.feicut.com/fv/FVf0hc366wam?cm=1&fc=2&p=0',
  },
  {
    no: '02',
    en: 'ACTION CUT',
    cn: '动作向动漫 PV',
    desc: '多角色动作分镜与节奏剪辑试验',
    cover: 'pv2',
    href: 'https://www.feicut.com/fv/FVbhfppjrege?cm=1&fc=1&p=0',
  },
]

/* ── WEBSITE & WRITING ───────────────────────────────── */
/* href 是占位：三个站点还没有可公开的正式地址，一律先指向 '#'，
   面板上的 OPEN PROJECT 同时带 aria-disabled。拿到真实链接后只改这三处。
   glow 是每张封面的主色，用来喂 .wsc__glow 的背景光晕 —— 原来那三个值
   （#f6e9c8 / #f7dcd8 / #dceccd）是掺了大量白的浅色，铺在 --paper #f8f7fa 上
   几乎没有色差，看不出光晕；这里往各自封面的主色方向加饱和度。 */
export const WEBSITES = [
  {
    no: '01',
    slug: 'COFFEE / IN CHINA',
    title: ['Coffee / In', 'China'],
    kicker: 'DATA JOURNALISM · WEB',
    desc: '中国咖啡市场在消费降级、价格竞争与情绪经济之间的增长逻辑。',
    cover: 'coffee',
    glow: '#f2d49a', // 咖啡封面的焦糖黄
    href: '#',
  },
  {
    no: '02',
    slug: 'SHORT DRAMA / OVERSEAS',
    title: ['Short Drama /', 'Overseas'],
    kicker: 'FEATURE · WEB',
    desc: '短剧出海：内容工业化生产与海外分发链路的一次拆解。',
    cover: 'drama',
    glow: '#f0bfa4', // 短剧封面的暖橘
    href: '#',
  },
  {
    no: '03',
    slug: 'WECHAT / ARTICLE',
    title: ['WeChat /', 'Article'],
    kicker: 'EDITORIAL · 图文',
    desc: '公众号长图文写作与版式：把调研转成可读、可传播的叙事。',
    cover: 'wechat',
    glow: '#d7e3a4', // 图文封面的草绿
    href: '#',
  },
]

/* ── CONTACT：软木板便签 ─────────────────────────────── */
export const NOTE_COLORS = ['#cfe0c3', '#f0e6a8', '#e8b7b7', '#a9c9dd', '#e5cfe0', '#d8cdb8']

export const SEED_NOTES = [
  { id: 's1', text: '', color: '#cfe0c3', x: 14, y: 42, rot: -2 },
  { id: 's2', text: '', color: '#f0e6a8', x: 70, y: 12, rot: 3 },
  { id: 's3', text: '', color: '#e8b7b7', x: 80, y: 33, rot: -3 },
]
