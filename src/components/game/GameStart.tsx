import { ART } from './gameData'

export function IntroClouds({ sweep = false }: { sweep?: boolean }) {
  return <svg className={sweep ? 'fg-intro-clouds fg-intro-clouds--sweep' : 'fg-intro-clouds'} viewBox="0 0 1920 1080" aria-hidden="true">
    <g className="fg-cloud fg-cloud--one"><path d="M-100 375 C60 355 150 367 270 350 S430 320 350 305 C295 292 210 302 237 281 C257 265 390 270 460 249 C365 287 326 282 349 294 C392 316 528 311 489 334 C446 360 286 350 228 375 C196 389 380 386 411 400 C315 411 124 390-100 415Z"/></g>
    <g className="fg-cloud fg-cloud--two"><path d="M1430 640 C1580 616 1820 640 1880 603 C1910 584 1730 602 1680 580 C1620 553 1860 555 1980 525 L2020 568 C1880 588 1810 581 1830 595 C1870 617 2030 604 1990 632 C1940 672 1610 651 1430 665Z"/></g>
  </svg>
}

/** Use the supplied separate artwork unchanged; animate only its presentation layers. */
export default function GameStart({ agreed, onAgreement, onEnter, onInfo, onClose, busy }: {
  agreed: boolean; onAgreement: () => void; onEnter: () => void; onInfo: () => void; onClose: () => void; busy: boolean
}) {
  return <div className="fg-start-screen">
    <div className="fg-start-art">
      <img className="fg-start-ground fg-start-background" src={ART+'start/background.jpg'} alt="双龙古画宣纸背景" draggable={false}/>
      <div className="fg-start-scroll fg-start-title"><img className="fg-start-ink" src={ART+'start/title.png'} alt="浮生若梦 · 朱砂卷轴与水墨题字" draggable={false}/></div>
    </div>
    <IntroClouds/>
    <div className="fg-start-actions">
      <button type="button" className="fg-start-enter" aria-label="进入游戏" disabled={busy} onClick={onEnter}>
        <img src={ART+'start/enter.png'} alt="" draggable={false}/>
      </button>
      <div className="fg-start-agreement">
        <button type="button" aria-pressed={agreed} onClick={onAgreement} disabled={busy}><span aria-hidden="true">{agreed ? '☑' : '☐'}</span> 我已了解此为网页交互体验</button>
        <button type="button" onClick={onInfo} disabled={busy}>体验说明</button>
      </div>
    </div>
    <button type="button" className="fg-intro-close fg-start-close" aria-label="关闭游戏开场" title="关闭（Esc）" disabled={busy} onClick={onClose}>×</button>
  </div>
}
