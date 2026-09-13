import { useId, type CSSProperties } from 'react'
import { ART, steps } from './gameData'
import { gameAssets } from './gameAssetWarmup'
import { useGameArtReady } from './useGameArtReady'
import './gameMap.css'

// Coordinates follow the original 1920 × 1080 composition.
const place = (x:number, y:number, width:number, height:number):CSSProperties => ({ left:`${x/19.2}%`, top:`${y/10.8}%`, width:`${width/19.2}%`, height:`${height/10.8}%` })
const markers = [[712,150],[1214,163],[1031,429],[1357,454]]

export default function GameMap({ stage, progress, blocked, onClose, onStep }: {
  stage:number; progress:number; blocked:boolean; onClose:()=>void; onStep:(index:number)=>void
}) {
  const artId = useId()
  const ready = useGameArtReady(gameAssets.map)
  return <section className="fm-map" data-ready={ready} aria-busy={!ready} aria-label="墨痕残卷修复地图" inert={blocked}>
    <img className="fm-background" src={ART+'ui-18.webp'} alt="" draggable={false} decoding="async"/>
    <div className="fm-shade" aria-hidden="true"/>
    <svg className="fm-scroll" style={place(220,8,1501,1080)} viewBox="0 0 1501 1080" role="img" aria-label="青绿山水残卷修复地图">
      <defs><clipPath id={`${artId}-landscape`}>
        <path d="M432 325L572 325L600 317Q794 320 953 384Q1178 457 1278 548L1318 627L1356 748Q1291 825 1195 889L991 846Q829 790 653 750L594 739L584 671L543 723L320 714Z"/>
      </clipPath></defs>
      <image href={ART+'map-controls/5.png'} width="1501" height="1080"/>
      {/* Reveal the original landscape over a temporary paper wash; never stretch the artwork. */}
      <g className="fm-landscape-layer" clipPath={`url(#${artId}-landscape)`}>
        <rect className="fm-paper-wash" width="1501" height="1080" fill="#faeabf"/>
        <image className="fm-landscape" href={ART+'map-controls/5.png'} width="1501" height="1080"/>
      </g>
    </svg>
    <div className="fm-cloud" style={place(43,130,1016,856)} aria-hidden="true">
      <div className="fm-cloud-reveal"><div className="fm-cloud-counter">
        <img className="fm-cloud-art" src={ART+'map-controls/6.png'} alt="" draggable={false} decoding="async"/>
      </div></div>
    </div>
    <img className="fm-title" style={place(1474,92,276,502)} src={ART+'map-controls/8.png'} alt="墨痕残卷" draggable={false} decoding="async"/>
    {markers.map(([x,y],i) => {
      const pending = i > stage, done = i < stage, current = i === stage
      const state = pending ? '待修复' : done ? '已完成' : '开始修复'
      return <button key={steps[i].name} className={`fm-marker ${pending ? 'is-pending' : done ? 'is-done' : 'is-current'}`}
        style={{...place(x,y,84,181), '--marker-delay':`${800+i*80}ms`, '--idle-delay':`${1400+i*350}ms`} as CSSProperties} aria-label={`${steps[i].name}，${state}`} title={`${steps[i].name} · ${state}`} aria-current={current ? 'step' : undefined} disabled={!current || !ready} onClick={() => { if (current && ready) onStep(i) }}>
        <span className="fm-marker-float">
        <svg viewBox="44 40 84 305" aria-hidden="true">
          <defs><clipPath id={`${artId}-tag-${i}`}><rect width="172" height="215"/></clipPath></defs>
          <g clipPath={`url(#${artId}-tag-${i})`}>
            <image href={ART+'map-controls/7.png'} width="172" height="345"/>
          </g>
          <svg className="fm-marker-line" x="0" y="215" width="172" height="130" viewBox="0 215 172 130" overflow="hidden">
            <image href={ART+'map-controls/7.png'} width="172" height="345"/>
          </svg>
          {pending && <g>
            <path d="M58 69 86 54 114 69V192L86 206 58 192Z" fill="#76736c"/>
            <text className="fm-pending-label" x="86" y="100" textAnchor="middle"><tspan x="86">待</tspan><tspan x="86" dy="34">修</tspan><tspan x="86" dy="34">复</tspan></text>
          </g>}
        </svg>
        {done && <span className="fm-completed">已修</span>}
        </span>
        <span className="fm-marker-caption">{steps[i].name} · {state}</span>
      </button>
    })}
    <button className="fm-close" style={place(1732,119,76,81)} aria-label="返回修复图鉴" title="返回修复图鉴（Esc）" onClick={onClose}>
      <svg viewBox="60 112 76 81" aria-hidden="true"><image href={ART+'map-controls/9.png'} width="191" height="305"/></svg>
    </button>
    <p className="fm-progress" aria-live="polite">{stage===steps.length ? '墨痕残卷已修复 · 山河如初' : `${steps[stage].name} · 修复进度 ${progress}%`}</p>
    {!ready && <p className="fm-loading" role="status">正在展开残卷…</p>}
  </section>
}
