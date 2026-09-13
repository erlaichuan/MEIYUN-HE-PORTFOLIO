import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import { ART } from './gameData'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import './gameHome.css'

type Destination = 'atlas' | 'cards' | 'items' | 'activity' | 'benefits'
type Props = {
  hero: string
  progress: number
  claimed: boolean
  blocked: boolean
  guiding: boolean
  onDismissGuide: () => void
  onPanel: (name: string) => void
  onNavigate: (page: Destination) => void
}
const delay = (ms: number): CSSProperties => ({ '--home-delay': `${ms}ms` } as CSSProperties)
// Positions and canvas sizes measured against the supplied 1920 × 1080 HOME.
// Percentages keep artwork and hit targets registered at every viewport size.
const homeLayout: Record<string, [number, number, number, number]> = {
  '04':[116,-25,161,417], '05':[269,-17,184,326],
  '01':[1503,-29,155,551], '02':[1628,-20,175,303], '03':[1779,-14,170,326],
  rengwu:[123,324,184,112], shangcheng:[125,436,178,91],
  beibao:[125,521,183,122], chengjiu:[125,632,184,109],
  tujian:[168,731,177,281], juese:[338,893,174,123], daoju:[507,876,156,133],
  meirihuodongtishi:[798,918,493,96], shejiao:[1356,903,164,96],
  fuli:[1515,884,166,125], qiandao:[1673,888,146,123],
}
function placement(art: string, ms = 0): CSSProperties {
  const [x,y,w,h] = homeLayout[art]
  return { left:`${x/19.2}%`, top:`${y/10.8}%`, width:`${w/19.2}%`, height:`${h/10.8}%`, ...delay(ms) }
}
const controlArt = (name: string) => `${ART}home-controls/${name}.png`
function ControlArt({ name }: { name: string }) {
  // These two source canvases contain large transparent margins. A viewport trims
  // only those margins while retaining every painted pixel and the original file.
  if (name === 'juese' || name === 'tujian') return <svg className="fh-control-art" viewBox={name === 'juese' ? '0 149 191 135' : '7 76 177 281'} aria-hidden="true"><image href={controlArt(name)} width="191" height="435"/></svg>
  return <img className="fh-control-art" src={controlArt(name)} alt="" draggable={false}/>
}

/** Presentation only: the parent still owns navigation, rewards and saved progress. */
export default function GameHome({ hero, progress, claimed, blocked, guiding, onDismissGuide, onPanel, onNavigate }: Props) {
  const [unrolling, setUnrolling] = useState(false)
  const guideTitle = useId()
  const guideDescription = useId()
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reduceMotion = useReducedMotion()
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  function openAtlas() {
    if (unrolling) return
    if (reduceMotion) { onNavigate('atlas'); return }
    setUnrolling(true)
    timer.current = setTimeout(() => onNavigate('atlas'), 720)
  }
  return <div className={`fg-home${unrolling ? ' is-unrolling' : ''}`} inert={blocked || unrolling} aria-hidden={blocked || undefined}>
    <div className="fh-scene" inert={guiding} aria-hidden={guiding || undefined}>
    <div className="fh-landscape"><img src={ART+'home-controls/background.jpg'} alt="浮生若梦大厅原稿：青绿山水、宫殿与宣纸画卷" draggable={false}/></div>
    <svg className="fh-atmosphere" viewBox="0 0 1920 1080" preserveAspectRatio="none" aria-hidden="true">
      <g className="fh-cloud fh-cloud--far"><path d="M250 316c100-26 254-20 330-9 76 12 5 25-48 29-51 5-110 9-67 18 74 15 201 8 227 23-71 8-186 2-227-4-129-18-77-36-19-41 63-6 64-9 7-14-65-6-141-6-203-2Z"/></g>
      <g className="fh-cloud fh-cloud--near"><path d="M1170 606c89-18 162-18 242-8 76 10 67 25 13 28-64 5-98 9-49 18 74 15 157 8 196 19-105 10-211 2-249-13-51-20 27-24 55-29 31-5 5-10-34-12-67-4-112-5-174-3Z"/></g>
      <g transform="translate(380 0)"><g className="fh-water"><path d="M626 862q68-22 128-18m-109 28q68-21 108-16m-62 26q31-10 65-13"/></g></g>
    </svg>
    <nav className="fh-account" aria-label="用户与灵玉">
      {[['用户档案','个人中心','04'],['灵玉余额','背包','05']].map(([name,panel,art],i) => <div className="fh-arrive" style={placement(art,200+i*80)} key={art}>
        <button className="fh-original-hanging fh-action" aria-label={name} aria-haspopup="dialog" onClick={() => onPanel(panel)}><img src={`${ART}home-tabs/${art}.png`} alt="" draggable={false}/></button>
      </div>)}
    </nav>
    <nav className="fh-left" aria-label="大厅左侧功能">
      {[['任务','rengwu'],['商城','shangcheng'],['背包','beibao'],['成就','chengjiu']].map(([name,art], i) => {
        const badge = name === '任务' && progress < 100 ? 'renwu-gantanhao' : name === '背包' && claimed ? 'beibao-gantanhao' : name === '成就' && progress === 100 ? 'cehngjiu-xin' : null
        return <div className="fh-arrive" style={placement(art,260+i*80)} key={name}>
          <button className="fh-painted-scroll fh-action" aria-label={name} aria-haspopup="dialog" onClick={() => onPanel(name)}><ControlArt name={art}/>{badge && <img className={`fh-art-badge ${badge === 'cehngjiu-xin' ? 'fh-art-badge--new' : ''}`} src={controlArt(badge)} alt={name === '任务' ? '有进行中的任务' : name === '背包' ? '签到奖励已入背包' : '成就已达成'} draggable={false}/>}</button>
        </div>
      })}
    </nav>
    <div className="fh-atlas fh-arrive" style={placement('tujian',580)}><button className="fh-painted-atlas fh-action" aria-label="修复图鉴" aria-description="可展开" onClick={openAtlas}><ControlArt name="tujian"/><span className="fh-open-hint" aria-hidden="true">可展开</span></button></div>
    <nav className="fh-right" aria-label="大厅右侧功能">
      {[['个人中心','01'],['公告','02'],['设置','03']].map(([name, art], i) => <div className="fh-arrive" style={placement(art,500+i*80)} key={name}><div className={i === 1 ? 'fh-sway' : ''}>
        <button className="fh-original-hanging fh-action" onClick={() => onPanel(name)} aria-label={name} aria-haspopup="dialog"><img src={`${ART}home-tabs/${art}.png`} alt="" draggable={false}/>{art === '01' && hero === '墨修' && <img className="fh-current-avatar" src={ART+'moxiu.webp'} alt=""/>}</button>
      </div></div>)}
    </nav>
    <nav className="fh-bottom fh-arrive" style={delay(660)} aria-label="大厅底部功能">
      <button className="fh-painted-edge fh-action" style={placement('juese')} aria-label="角色卡牌" aria-description="可展开" onClick={() => onNavigate('cards')}><ControlArt name="juese"/><span className="fh-open-hint" aria-hidden="true">可展开</span></button>
      <button className="fh-painted-edge fh-action" style={placement('daoju')} aria-label="道具" aria-description="可展开" onClick={() => onNavigate('items')}><ControlArt name="daoju"/><span className="fh-open-hint" aria-hidden="true">可展开</span></button>
      <button className="fh-painted-daily fh-action" style={placement('meirihuodongtishi')} aria-label="每日活动提示" onClick={() => onNavigate('activity')}><ControlArt name="meirihuodongtishi"/></button>
      <button className="fh-painted-edge fh-action" style={placement('shejiao')} aria-label="社交" onClick={() => onPanel('同行队伍')}><ControlArt name="shejiao"/></button>
      <button className="fh-painted-edge fh-action" style={placement('fuli')} aria-label="福利" onClick={() => onNavigate('benefits')}><ControlArt name="fuli"/></button>
      <button className="fh-painted-edge fh-action" style={placement('qiandao')} aria-label="签到" aria-description="可展开" onClick={() => onPanel('签到')} aria-haspopup="dialog"><ControlArt name="qiandao"/>{!claimed && <i className="fh-dot" aria-label="今日可签到"/>}<span className="fh-open-hint" aria-hidden="true">可展开</span></button>
    </nav>
    {unrolling && <div className="fh-unroll" aria-hidden="true"><span>展卷 · 入画</span></div>}
    </div>
    {guiding && <div className="fh-guide-layer" role="dialog" aria-modal="true" aria-labelledby={guideTitle} aria-describedby={guideDescription}
      onKeyDown={event => {
        if (event.key === 'Tab') { event.preventDefault(); event.currentTarget.querySelector<HTMLButtonElement>('.fh-guide-dismiss')?.focus() }
      }}>
      <div className="fh-guide-shade" aria-hidden="true"/>
      {['tujian', 'juese', 'daoju', 'qiandao'].map(art => <div className="fh-guide-spotlight" style={placement(art)} key={art} aria-hidden="true">
        <ControlArt name={art}/><span>可展开</span>
      </div>)}
      <div className="fh-guide-message">
        <p className="fh-guide-eyebrow">画境探索指引</p>
        <h2 id={guideTitle}>可展开区域</h2>
        <p id={guideDescription}>图鉴 · 角色 · 道具 · 签到</p>
        <p className="fh-guide-instruction">轻点任意位置，开始探索</p>
      </div>
      <button type="button" className="fh-guide-dismiss" aria-label="关闭可展开区域引导，开始探索" onClick={event => { event.stopPropagation(); onDismissGuide() }}/>
    </div>}
  </div>
}
