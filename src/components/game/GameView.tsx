import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useStore } from '../../store'
import { holdSceneMusicForProject } from '../../scene/sceneAudio'
import { FUSHENG_MUSIC } from '../../scene/backgroundMusic'
import ProjectBackButton from '../work/ProjectBackButton'
import SceneSoundControls from '../SceneSoundControls'
import { ART, characters, steps, items, chibiCollection } from './gameData'
import RepairPainting from './RepairPainting'
import GameStart, { IntroClouds } from './GameStart'
import GameHome from './GameHome'
import GameCheckin from './GameCheckin'
import GameAtlas from './GameAtlas'
import GameMap from './GameMap'
import GameCards from './GameCards'
import LuhanzhouDetail from './LuhanzhouDetail'
import ShijunDetail from './ShijunDetail'
import XueruohuaDetail from './XueruohuaDetail'
import SuwanqingDetail from './SuwanqingDetail'
import PainterDetail from './PainterDetail'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { playUISound } from './audio/uiSoundManager'
import { playUIClose, useGameUISounds } from './audio/useGameUISounds'
import UISoundSettings from './audio/UISoundSettings'
import { gameAssets, scheduleGameAssets } from './gameAssetWarmup'
import './game.css'
import './repairPainting.css'
import './gameIntro.css'

type Screen = 'entry' | 'choose' | 'home' | 'atlas' | 'map' | 'cards' | 'detail' | 'checkin' | 'items' | 'activity' | 'benefits'
type Save = { hero: 'moxiu' | 'mowan'; started: boolean; stage: number; marks: number[]; checkin: string }
const KEY = 'fusheng-save-v1'
function readSave(): Save {
  const initial: Save = { hero: 'mowan', started: false, stage: 0, marks: [], checkin: '' }
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (s && ['moxiu', 'mowan'].includes(s.hero) && typeof s.started === 'boolean' && Number.isInteger(s.stage) && s.stage >= 0 && s.stage <= 4 && Array.isArray(s.marks) && s.marks.every((n: unknown) => Number.isInteger(n) && Number(n) >= 0 && Number(n) < 3)) return { ...initial, ...s, marks: [...new Set<number>(s.marks)], checkin: typeof s.checkin === 'string' ? s.checkin : '' }
  } catch { /* A private browser may disable storage. */ }
  return initial
}
const box = (x: number, y: number, w: number, h: number): CSSProperties => ({ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` })
function Hit({ label, x, y, w, h, onClick, children, disabled = false, className = '' }: { label: string; x: number; y: number; w: number; h: number; onClick?: () => void; children?: ReactNode; disabled?: boolean; className?: string }) {
  return <button className={`fg-hit ${className}`} style={box(x,y,w,h)} aria-label={label} title={label} disabled={disabled} onClick={onClick}>{children}</button>
}
const homeTabs = [
  { id:'user', label:'用户档案', panel:'个人中心', art:'04', left:116, top:-25, width:161, height:417, patch:[125, 275, 335, 256, 30] },
  { id:'jade', label:'灵玉余额', panel:'背包', art:'05', left:269, top:-17, width:184, height:326, patch:[282, 394, 280, 395, 24] },
  { id:'profile', label:'个人中心', panel:'个人中心', art:'01', left:1503, top:-29, width:155, height:551, patch:[1536, 1642, 470, 1644, 24] },
  { id:'notice', label:'公告', panel:'公告', art:'02', left:1628, top:-20, width:175, height:303, patch:[1668, 1777, 265, 1780, 25] },
  { id:'settings', label:'设置', panel:'设置', art:'03', left:1779, top:-14, width:170, height:326, patch:[1804, 1913, 292, 1778, 26] },
]
const detailTabs = [
  { name: '身份背景', art: 'shengfenbeijing' },
  { name: '技能属性', art: 'jinengshuxing' },
  { name: '战斗定位', art: 'zhandoudingwei' },
  { name: '法器属性', art: 'faqishuxing' },
]
export default function GameView({ embedded = false, onExit }: { embedded?: boolean; onExit?: () => void } = {}) {
  // Own the same opening cue as the project page, including embedded/fullscreen
  // entry. The shared player pauses BGM for the cue and resumes it when it ends.
  useEffect(() => holdSceneMusicForProject(FUSHENG_MUSIC, { cloudScrollOpening: true }), [])
  const [save, setSave] = useState(readSave)
  const [screen, setScreen] = useState<Screen>('entry')
  const [homeIntro, setHomeIntro] = useState(false)
  const [selected, setSelected] = useState(2)
  const [tab, setTab] = useState(1)
  const [notice, setNotice] = useState('')
  const [fullscreen, setFullscreen] = useState(false)
  const [panel, setPanel] = useState<string | null>(null)
  const [homeMenu, setHomeMenu] = useState<string | null>(null)
  const [repair, setRepair] = useState(false)
  const [tool, setTool] = useState('画魂笔')
  const [guide, setGuide] = useState(false)
  const [storageOk, setStorageOk] = useState(true)
  const [agreed, setAgreed] = useState(true)
  const [introOutgoing, setIntroOutgoing] = useState<'entry' | 'choose' | null>(null)
  const introTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const introLocked = useRef(false)
  const detailExit = useRef<Animation | null>(null)
  const mapExit = useRef<Animation[]>([])
  const reducedMotion = useReducedMotion()
  const root = useRef<HTMLDivElement>(null)
  useGameUISounds(root)
  useEffect(() => {
    const next = screen === 'entry' ? gameAssets.choose
      : screen === 'choose' ? gameAssets.home
      : screen === 'home' ? [...gameAssets.atlas, ...gameAssets.cards, ...gameAssets.checkin, ...gameAssets.items]
      : screen === 'atlas' ? gameAssets.map
      : screen === 'map' ? gameAssets.repair : []
    return scheduleGameAssets(next, screen === 'atlas' || screen === 'map' ? 100 : 1100)
  }, [screen])
  useEffect(() => {
    const update = () => { if (root.current) root.current.dataset.paused = String(document.hidden) }
    update()
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])
  useEffect(() => {
    const update = () => setFullscreen(!!document.fullscreenElement && !!root.current && document.fullscreenElement.contains(root.current))
    update()
    document.addEventListener('fullscreenchange', update)
    return () => document.removeEventListener('fullscreenchange', update)
  }, [])
  const repairDialog = useRef<HTMLElement>(null)
  const homeDialog = useRef<HTMLElement>(null)
  const hero = characters.find(c => c.id === save.hero)!
  const character = characters[selected]
  const item = items.find(value => value.name === panel)
  const step = steps[Math.min(save.stage,3)]
  const complete = save.stage === 4
  const progress = Math.round((save.stage * 3 + (complete ? 0 : save.marks.length)) / 12 * 100)
  const today = new Date().toLocaleDateString('sv-SE')
  const claimed = save.checkin === today
  const originalPage = screen === 'cards' ? 22 : screen === 'items' ? 5 : screen === 'activity' ? 1 : screen === 'benefits' ? 12 : null
  const pageName = screen === 'items' ? '浮生雅物' : screen === 'activity' ? '每日活动提示' : screen === 'benefits' ? '福利 · Q 版收藏' : null
  const pages: Record<Screen, number> = { entry:17, choose:22, home:18, atlas:19, map:20, cards:22, detail:23, checkin:21, items:5, activity:1, benefits:12 }
  useEffect(() => () => { if (introTimer.current) clearTimeout(introTimer.current) }, [])
  useEffect(() => () => { detailExit.current?.cancel() }, [])
  useEffect(() => () => { mapExit.current.forEach(animation => animation.cancel()) }, [])
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(save)) } catch { queueMicrotask(() => setStorageOk(false)) } }, [save])
  useEffect(() => { if (!notice) return; const t = setTimeout(() => setNotice(''), 4200); return () => clearTimeout(t) }, [notice])
  useEffect(() => {
    if (repair) repairDialog.current?.querySelector<HTMLButtonElement>('.fg-repair-close')?.focus({ preventScroll: true })
    else if (screen === 'atlas') root.current?.querySelector<HTMLButtonElement>('.fa-close')?.focus({ preventScroll: true })
    else if (screen === 'map') root.current?.querySelector<HTMLButtonElement>('.fm-close')?.focus({ preventScroll: true })
    else if (screen === 'cards') root.current?.querySelector<HTMLButtonElement>('.gc-close')?.focus({ preventScroll: true })
    else if (screen === 'detail' && ['luhanzhou','shijun','xueruohua','suwanqing','moxiu','mowan'].includes(character.id)) root.current?.querySelector<HTMLButtonElement>('.lh-back')?.focus({ preventScroll: true })
    else if (screen === 'home' && homeIntro) root.current?.querySelector<HTMLButtonElement>('.fh-guide-dismiss')?.focus({ preventScroll: true })
    else if (screen === 'home' && panel === '签到') root.current?.querySelector<HTMLButtonElement>('.fc-close')?.focus({ preventScroll: true })
    else if (screen === 'home' && panel) homeDialog.current?.querySelector<HTMLButtonElement>('.fg-close')?.focus({ preventScroll: true })
    else root.current?.focus({ preventScroll: true })
  }, [screen, panel, repair, character.id, homeIntro])
  useEffect(() => {
    if (!homeMenu || screen !== 'home') return
    const entry = homeTabs.find(value => value.id === homeMenu)!
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 500
    const timer = setTimeout(() => { setPanel(entry.panel); setNotice('') }, delay)
    return () => clearTimeout(timer)
  }, [homeMenu, screen])
  function leaveDetail(complete: () => void) {
    if (detailExit.current) return
    const detail = screen === 'detail' ? root.current?.querySelector<HTMLElement>('.lh-detail') : null
    if (!detail || reducedMotion) { complete(); return }
    const animation = detail.animate([
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: 'translateY(15px)' },
    ], { duration: 210, easing: 'ease-out', fill: 'forwards' })
    detailExit.current = animation
    void animation.finished.then(() => {
      detailExit.current = null
      complete()
    }, () => { /* Unmounting cancels the visual transition and its pending navigation. */ })
  }
  function leavePage(complete: () => void) {
    if (screen !== 'map') { leaveDetail(complete); return }
    if (mapExit.current.length) return
    const map = root.current?.querySelector<HTMLElement>('.fm-map')
    const scroll = map?.querySelector<SVGElement>('.fm-scroll')
    if (!map || !scroll || reducedMotion) { complete(); return }
    map.inert = true
    playUISound('ui.map', { animation: true })
    const fold = scroll.animate([
      { clipPath: getComputedStyle(scroll).clipPath },
      { clipPath: 'inset(0 100% 0 0)' },
    ], { duration: 420, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' })
    const fades = [...map.querySelectorAll('.fm-title,.fm-marker,.fm-cloud,.fm-progress')].map(element => element.animate([
      { opacity: getComputedStyle(element).opacity }, { opacity: 0 },
    ], { duration: 220, easing: 'ease-out', fill: 'forwards' }))
    mapExit.current = [fold, ...fades]
    void fold.finished.then(() => {
      mapExit.current = []
      complete()
    }, () => { /* Unmounting cancels pending map navigation. */ })
  }
  function go(next: Screen) {
    if (introLocked.current) return
    if (!reducedMotion && ((screen === 'entry' && next === 'choose') || (screen === 'choose' && next === 'entry'))) {
      introLocked.current = true
      setIntroOutgoing(screen)
      introTimer.current = setTimeout(() => { setIntroOutgoing(null); introLocked.current = false; introTimer.current = null }, 900)
    }
    const navigate = () => {
      if (['items', 'activity', 'benefits'].includes(next) || (reducedMotion && ['atlas', 'cards', 'map', 'choose'].includes(next))) playUISound(next === 'map' ? 'ui.map' : next === 'choose' ? 'ui.scrollOpen' : 'ui.paperOpen', { animation: true })
      setHomeMenu(null); setScreen(next); setPanel(null); setRepair(false); setNotice('')
    }
    if ((screen === 'detail' || screen === 'map') && next !== screen) leavePage(navigate)
    else navigate()
  }
  function back() {
    playUIClose(!!panel || repair || screen === 'atlas', !panel && !repair)
    if (panel) { setPanel(null); setHomeMenu(null); return }
    if (repair) { setRepair(false); return }
    if (screen === 'detail') { go('cards'); return }
    if (['atlas','cards','checkin','items','activity','benefits'].includes(screen)) { go('home'); return }
    if (screen === 'map') { go('atlas'); return }
    if (screen === 'choose') { go('entry'); return }
    exit()
  }
  function exit() {
    if (introTimer.current) clearTimeout(introTimer.current)
    introLocked.current = false
    if (onExit) {
      leavePage(onExit)
      return
    }
    if (document.fullscreenElement && root.current && document.fullscreenElement.contains(root.current)) void document.exitFullscreen().catch(() => {})
    leavePage(() => {
      useStore.getState().setWorkView(null)
      if (new URLSearchParams(location.search).has('game')) { const u = new URL(location.href); u.searchParams.delete('game'); history.replaceState(null, '', u) }
    })
  }
  function mark(i: number) {
    if (tool !== step.tool) { playUISound('ui.brush', { strength: .5 }); setNotice(`请先选用${step.tool}，再处理画面标记。`); return }
    playUISound('ui.ink')
    setSave(s => ({ ...s, marks: [...new Set([...s.marks,i])] }))
    setNotice(`${step.name}：第${i+1}处已完成`)
  }
  const showPanel = (title: string) => {
    if (screen !== 'home' || reducedMotion) playUISound('ui.paperOpen')
    setPanel(title); setNotice('')
  }
  function claimCheckin() {
    if (claimed) { setNotice('今日已签到，请明日再来。'); return }
    // The current artwork updates instantly, without a reward/stamp animation.
    playUISound('ui.rewardClaim')
    setSave(s => ({ ...s, checkin:today }))
    setNotice('签到成功，获得灵玉 × 20，已收进背包。')
  }
  return <div ref={root} tabIndex={-1} className={`fg-shell${embedded ? ' fg-shell--embedded' : ''}`} onKeyDown={e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); if (screen === 'home' && homeIntro) setHomeIntro(false); else back() } }}>
    <div className="fg-toolbar"><ProjectBackButton placement="inline" label={embedded ? '结束体验' : '返回作品集'} onClick={exit}/><span>{pageName ? <button onClick={() => go('home')}>← 返回画境 · {pageName}</button> : '浮生若梦 · 交互体验'}</span><div><button aria-pressed={guide} onClick={() => setGuide(v => !v)}>操作提示</button><button onClick={() => {
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => setNotice('请使用浏览器退出全屏'))
      else {
        const target = root.current?.closest<HTMLElement>('.gp-laptop-screen') ?? root.current
        if (target?.requestFullscreen) void target.requestFullscreen().catch(() => setNotice('当前浏览器暂不支持全屏'))
        else setNotice('当前浏览器暂不支持全屏')
      }
    }}>{fullscreen ? '退出全屏' : '全屏'}</button></div></div>
    {fullscreen && <div className="fg-fullscreen-sound"><SceneSoundControls inOverlay /></div>}
    <div className="fg-fit"><div className={`fg-stage ${guide ? 'fg-guide' : ''} ${screen === 'home' ? 'fg-stage--home' : ''} ${screen === 'entry' || screen === 'choose' ? 'fg-stage--intro' : ''} ${introOutgoing ? 'fg-intro-transition' : ''}`} aria-busy={!!introOutgoing}>
{screen !== 'entry' && screen !== 'choose' && screen !== 'home' && screen !== 'map' && screen !== 'cards' && screen !== 'atlas' && !(screen === 'detail' && ['luhanzhou','shijun','xueruohua','suwanqing','moxiu','mowan'].includes(character.id)) && <img className="fg-background" src={screen === 'detail' ? `${ART}details/${character.id}.jpg` : originalPage ? `${ART}ui-${originalPage}.jpg` : `${ART}ui-${pages[screen]}.webp`} alt={{ entry:'浮生若梦双龙古纸登录界面', choose:'卷轴角色选择', home:'青绿山水游戏主界面', atlas:'修复图鉴', map:'墨痕残卷修复地图', cards:'六位角色卡牌', detail:`${character.name}角色详情原稿：等级、技能属性与人物立绘`, checkin:'七日签到奖励卷轴', items:'浮生雅物：笔筒、宫灯、红珊瑚、琵琶、瑞芝、玉算盘、太湖石、围棋', activity:'每日活动提示：浮生若梦·龙跃山河', benefits:'福利：六位角色的Q版收藏' }[screen]} draggable={false}/>}
      {(screen === 'entry' || introOutgoing === 'entry') && <div key="start" className={`fg-intro-layer ${introOutgoing === 'entry' ? 'fg-intro-outgoing' : ''}`} inert={!!introOutgoing} aria-hidden={introOutgoing === 'entry' ? true : undefined}>
        <GameStart agreed={agreed} onAgreement={() => setAgreed(v => !v)} onEnter={() => agreed ? go('choose') : setNotice('请先确认下方体验说明。')} onInfo={() => showPanel('体验说明')} onClose={exit} busy={!!introOutgoing}/>
      </div>}
      {(screen === 'choose' || introOutgoing === 'choose') && <div key="choose" className={`fg-intro-layer fg-character-screen ${introOutgoing === 'choose' ? 'fg-intro-outgoing' : ''}`} inert={!!introOutgoing} aria-hidden={introOutgoing === 'choose' ? true : undefined}>
        <img className="fg-character-atmosphere" src={ART+'landscape.webp'} alt="" aria-hidden="true" draggable={false}/>
        <div className="fg-selection fg-character-panel">
          <button type="button" className="fg-intro-close" aria-label="关闭角色选择，返回进入页" title="返回（Esc）" onClick={() => go('entry')}>×</button>
          <header><h1>择一身份，执笔入画</h1><p>以画境师之名，开启修复之旅</p></header>
          <div className="fg-choose-cards">{characters.slice(0,2).map((c,i) => <div className="fg-character-reveal" key={c.id} style={{ '--character-delay': `${300 + i * 100}ms` } as CSSProperties}><button aria-pressed={save.hero === c.id} onClick={() => setSave(s => ({ ...s, hero:c.id as Save['hero'] }))}><img src={ART+'selection/'+c.id+'.jpg'} alt={c.id === 'moxiu' ? '男画境师 · 墨修' : '女画境师 · 墨婉'}/><span>{c.name}<small>{c.id === 'moxiu' ? '男 · 设色唤醒' : '女 · 勘察修复'}{save.hero === c.id ? ' · 已选' : ''}</small></span></button></div>)}</div>
          <footer><button className="fg-red-button" onClick={() => { setSave(s => ({ ...s, started:true })); setHomeIntro(true); go('home') }}>继续修复之旅</button><button className="fg-cancel" onClick={() => go('entry')}>返回</button></footer>
        </div>
      </div>}
      {introOutgoing && <div className="fg-intro-veil" aria-hidden="true"><IntroClouds sweep/></div>}
      {screen === 'home' && <GameHome hero={hero.name} progress={progress} claimed={claimed} blocked={!!panel} guiding={homeIntro} onDismissGuide={() => setHomeIntro(false)}
        onPanel={name => showPanel(name === '签到' ? name : '区域未开放')}
        onNavigate={page => page === 'activity' || page === 'benefits' ? showPanel('区域未开放') : go(page)}/>}
      {screen === 'atlas' && <GameAtlas progress={progress} onClose={() => go('home')} onEnter={() => go('map')} onNotice={setNotice}/>}
      {screen === 'map' && <GameMap stage={save.stage} progress={progress} blocked={repair} onClose={() => go('atlas')} onStep={i => {
        if (i > save.stage) setNotice('请先完成上一处修复，循序续接山河。')
        else if (i < save.stage) setNotice(`${steps[i].name}已完成。${complete ? '山河已经归卷，可在成就中查看。' : '请前往下一处修复。'}`)
        else { setRepair(true); setTool('画魂笔') }
      }}/>}
      {(screen === 'activity' || screen === 'benefits' || screen === 'items') && <button
        className="fg-page-close"
        aria-label={screen === 'activity' ? '关闭每日活动提醒' : screen === 'items' ? '关闭道具页面' : '关闭福利页面'}
        title="关闭并返回主界面"
        onClick={() => go('home')}
      ><img src={ART+'ui/close.png'} alt="" draggable={false}/></button>}
      {screen === 'activity' && <button className="fg-activity-action fg-red-button" onClick={() => go('map')}>前往墨痕残卷修复 →</button>}
      {screen === 'benefits' && <>
        <span className="fg-benefits-heading">Q 版收藏 · 已拥有 1 / 6</span>
        {chibiCollection.map(c => <img
          key={c.id}
          className={`fg-chibi-art ${c.owned ? 'is-owned' : 'is-locked'}`}
          src={`${ART}chibi/${c.id}.png`}
          alt=""
          aria-hidden="true"
          draggable={false}
          style={box(c.art.left / 19.2, c.art.top / 10.8, c.art.width / 19.2, c.art.height / 10.8)}
        />)}
        {chibiCollection.map(c => <Hit key={c.id} label={`${c.name} Q版 · ${c.owned ? '已拥有' : '未拥有，待解锁'}`} x={c.x} y={41} w={c.width} h={46} disabled={!c.owned} className={c.owned ? 'fg-chibi-owned' : 'fg-chibi-locked'} onClick={() => setNotice('已拥有墨婉 Q 版形象。其余角色待拥有后解锁。')}><span>{c.owned ? '✓ 已拥有' : '未拥有 · 待解锁'}</span></Hit>)}
      </>}
      {screen === 'items' && <>
        {items.map((value,i) => <Hit key={value.id} label={`查看${value.name}：${value.description}`} x={[12.8,34.1,55.5,76.8][i%4]} y={i<4?8.6:52.7} w={16.3} h={39.2} onClick={() => showPanel(value.name)}/>)}
      </>}
      {screen === 'cards' && <GameCards onClose={() => go('home')} onSelect={index => { setSelected(index); setTab(1); go('detail') }}/>}
      {screen === 'detail' && character.id === 'luhanzhou' && <LuhanzhouDetail tab={tab} onTab={setTab} onBack={() => go('cards')} onHome={() => go('home')}/>}
      {screen === 'detail' && character.id === 'shijun' && <ShijunDetail tab={tab} onTab={setTab} onBack={() => go('cards')} onHome={() => go('home')}/>}
      {screen === 'detail' && character.id === 'xueruohua' && <XueruohuaDetail tab={tab} onTab={setTab} onBack={() => go('cards')} onHome={() => go('home')}/>}
      {screen === 'detail' && character.id === 'suwanqing' && <SuwanqingDetail tab={tab} onTab={setTab} onBack={() => go('cards')} onHome={() => go('home')}/>}
      {screen === 'detail' && (character.id === 'moxiu' || character.id === 'mowan') && <PainterDetail hero={character.id} tab={tab} onTab={setTab} onBack={() => go('cards')} onHome={() => go('home')}/>}
      {screen === 'detail' && !['luhanzhou','shijun','xueruohua','suwanqing','moxiu','mowan'].includes(character.id) && <>
        <Hit label="返回角色卡牌" x={2.3} y={9} w={11} h={6.5} onClick={() => go('cards')}/>
        <Hit label="返回主界面" x={14.4} y={9.2} w={3.1} h={6} onClick={() => go('home')}/>
        <div className="fg-detail-nav" role="group" aria-label="人物介绍选择栏">
          <div className="fg-detail-nav-backdrop" aria-hidden="true"/>
          {detailTabs.map(({ name, art }, i) => <button
            key={art}
            className={`fg-hanging-tab ${tab === i ? 'is-selected' : ''}`}
            style={{ left: `${i * 25 + 12.5}%` }}
            aria-label={name}
            aria-pressed={tab === i}
            title={name}
            onClick={() => setTab(i)}
            onKeyDown={event => {
              const next = event.key === 'ArrowRight' ? (i + 1) % 4 : event.key === 'ArrowLeft' ? (i + 3) % 4 : event.key === 'Home' ? 0 : event.key === 'End' ? 3 : null
              if (next === null) return
              event.preventDefault()
              setTab(next)
              event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus()
            }}
          ><img src={`${ART}detail-tabs/${art}.png`} alt="" draggable={false}/></button>)}
        </div>
        {tab !== 1 && <div className="fg-detail-content"><h2 role="status">区域未开放</h2></div>}
      </>}
      {screen === 'checkin' && <>
        <Hit label="关闭签到" x={2.9} y={14} w={3} h={6} onClick={() => go('home')}/>
        <Hit label={claimed?'今日已签到':'领取今日签到奖励'} x={65.5} y={32} w={7.5} h={38} onClick={() => { if (claimed) { setNotice('今日已签到，请明日再来。'); return } setSave(s => ({ ...s, checkin:today })); setNotice('签到成功，获得灵玉 × 20，已收进背包。') }} className="fg-checkin-today"><span>{claimed ? '今日已领取' : '领取今日奖励'}</span></Hit>
        <span className="fg-checkin-note">七日奖励展示 · {claimed ? '今日已签到' : '今日可领取灵玉 × 20'}</span>
      </>}
      {repair && <div className="fg-modal-shade fg-repair-shade"><section ref={repairDialog} className="fg-repair fg-paper" role="dialog" aria-modal="true" aria-labelledby="repair-heading" onKeyDown={event => {
        if (event.key !== 'Tab') return
        const targets = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), [tabindex="0"]'))
        const first = targets[0], last = targets[targets.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }}>
        <button type="button" className="fg-repair-close" aria-label="关闭修复，返回残卷地图" title="关闭修复（Esc）" onClick={() => setRepair(false)}><span aria-hidden="true">×</span> 关闭</button>
        <h2 id="repair-heading">墨痕残卷 · {step.name}</h2>
        <div className="fg-repair-layout">
          <RepairPainting progress={progress}>{step.spots.map(([x,y],i) => <button key={i} data-ui-sound="none" aria-label={`${step.name}位置 ${i+1}`} className="fg-repair-spot" style={{left:`${x}%`,top:`${y}%`}} disabled={save.marks.includes(i)} onClick={() => mark(i)}>{save.marks.includes(i)?'✓':i+1}</button>)}</RepairPainting>
          <aside><h3>{step.member==='主角'?hero.name:step.member} · 协作</h3><p id="repair-reveal-hint" className="fg-reveal-hint">移笔显色 · 原色随鼠标浮现<br/>移开归墨，探索后点击修复标记。触屏可按住滑动。</p><p>{step.hint}</p><div className="fg-tools">{['画魂笔','灵莲','灵剪'].map(t=><button key={t} aria-pressed={tool===t} onClick={() => setTool(t)}>{t}</button>)}</div><p>已完成 {save.marks.length} / 3 处</p><button data-ui-sound="none" className="fg-red-button" disabled={save.marks.length!==3} onClick={() => { if(save.marks.length!==3)return;playUISound('ui.repairComplete');setSave(s=>({...s,stage:s.stage+1,marks:[]}));setRepair(false);setNotice(step.done) }}>完成此处修复</button></aside>
        </div>
      </section></div>}
      {screen === 'home' && panel === '签到' && <GameCheckin claimed={claimed} onClaim={claimCheckin} onClose={() => { setPanel(null); setHomeMenu(null) }}/>}
      {panel && !(screen === 'home' && panel === '签到') && <div className="fg-modal-shade"><section ref={screen === 'home' ? homeDialog : undefined} className={`fg-paper fg-info ${item ? 'fg-item-info' : ''}`} role="dialog" aria-modal="true" aria-label={panel} onKeyDown={event => {
        if (screen !== 'home' || event.key !== 'Tab') return
        const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled)'))
        const first = buttons[0], last = buttons[buttons.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }}><button className={item ? 'fg-page-close fg-item-close' : 'fg-close'} aria-label={item ? '关闭道具详情' : '关闭面板'} title={item ? '关闭并返回道具图鉴' : '关闭面板'} onClick={() => { setPanel(null); setHomeMenu(null) }}>{item ? <img src={ART+'ui/close.png'} alt="" draggable={false}/> : '×'}</button><h2>{panel}</h2>
        {panel==='区域未开放' && <button className="fg-cancel" onClick={() => { setPanel(null); setHomeMenu(null) }}>返回大厅</button>}
        {item && <div className="fg-item-detail"><img src={`${ART}items/${item.id}.webp`} alt={item.name+'原稿道具卡'}/><div><p>{item.description}</p><p>承古人风雅，助画境修复。</p><button className="fg-red-button" onClick={() => setPanel(null)}>返回道具图鉴</button></div></div>}
        {panel==='个人中心' && <><h3>{hero.name} · 画境师</h3><p>{hero.quote}</p><p>墨痕残卷修复进度：{progress}%</p><button className="fg-red-button" onClick={() => go('choose')}>切换主角</button></>}
        {panel==='任务' && <><h3>主线 · 墨痕残卷</h3>{steps.map((s,i)=><p key={s.name}>{i<save.stage?'✓':'◇'} {s.name} · {i<save.stage?'已完成':i===save.stage?'进行中':'待开启'}</p>)}<button className="fg-red-button" onClick={() => go('map')}>前往修复</button></>}
        {panel==='背包' && <><p>灵玉 · {200+(save.checkin?20:0)}</p>{characters.filter(c=>['mowan','shijun','xueruohua','suwanqing','luhanzhou'].includes(c.id)).map(c=><p key={c.id}><b>{c.weapon}</b> · {c.specialty}</p>)}</>}
        {panel==='成就' && <><h3>{complete?'山河如初 · 已达成':'山河如初 · 尚未达成'}</h3><p>完成墨痕残卷的四处修复，让青绿山水重现。</p><p>当前进度 · {progress}%</p>{complete&&<button className="fg-red-button" onClick={()=>{setSave(s=>({...s,stage:0,marks:[]}));go('map')}}>重温修复之旅</button>}</>}
        {panel==='同行队伍' && <>{characters.slice(2).map(c=><p key={c.id}><b>{c.name}</b> · {c.specialty}</p>)}<button className="fg-red-button" onClick={()=>go('cards')}>查看角色卡牌</button></>}
        {panel==='商城' && <><h3>坊市筹备中</h3><p>本次开放墨痕残卷修复体验，所需法器已放入道具栏。</p><button className="fg-red-button" onClick={()=>go('items')}>查看已有道具</button></>}
        {panel==='公告' && <><h3>墨痕残卷 · 画境初启</h3><p>修复图鉴现已开放墨痕残卷，其余篇章暂未开放。选择墨修或墨婉，与四位队员同行，完成勘察、净化、补缀与补色。</p></>}
        {panel==='设置' && <><p>{storageOk?'游戏进度自动保存在当前浏览器。':'当前浏览器无法存档，本次仍可体验。'}</p><UISoundSettings/><button className="fg-red-button" onClick={()=>setGuide(v=>!v)}>{guide?'关闭':'开启'}操作提示</button><button className="fg-red-button" onClick={()=>go('choose')}>切换主角</button><button className="fg-cancel" onClick={exit}>返回作品集</button></>}
        {panel==='体验说明' && <p>这是《浮生若梦》的网页游戏交互原型。选择主角、角色档案、修复流程与签到可在本地体验，进度仅保存在当前浏览器。画面及人物设定来自原创设计稿。</p>}
      </section></div>}
      {notice && <div className="fg-toast" role="status">{notice}</div>}
    </div></div>
    <div className="fg-bottom">{pageName && <button onClick={() => go('home')}>← 返回画境</button>}<span>原作界面 · 横屏体验</span><span>{guide?'金色轮廓标出可操作区域 · Esc 逐级返回':`${hero.name} · 墨痕残卷 ${progress}%`}</span><span>{storageOk?'进度自动保存':'临时体验'}</span></div>
  </div>
}
