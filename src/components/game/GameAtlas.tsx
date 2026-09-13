import { useId, useState, type CSSProperties } from 'react'
import { ART } from './gameData'
import './gameAtlas.css'

// Original panel bounds and visible illustration bounds in each 671 × 865 PNG.
const chapters = [
  { name:'云起初篇', panel:[239,192,152,461], crop:[160,180,350,685] },
  { name:'墨痕残卷', panel:[250,113,180,562], crop:[135,102,440,733] },
  { name:'古简残章', panel:[264,160,152,465], crop:[165,150,355,715] },
  { name:'朱篆遗印', panel:[312,107,151,462], crop:[215,95,425,717] },
  { name:'丹青遗笔', panel:[325,193,150,461], crop:[280,180,280,685] },
]
const position = (x:number,y:number,w:number,h:number):CSSProperties => ({left:`${x/19.2}%`,top:`${y/10.8}%`,width:`${w/19.2}%`,height:`${h/10.8}%`})

export default function GameAtlas({ progress, onClose, onEnter, onNotice }: {
  progress:number; onClose:()=>void; onEnter:()=>void; onNotice:(text:string)=>void
}) {
  const [selected,setSelected] = useState(1)
  const borderMask = useId()
  const browse = (index:number) => setSelected(Math.max(0,Math.min(chapters.length-1,index)))
  return <section className="fa-atlas" aria-label="修复图鉴" onKeyDown={event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); browse(selected + (event.key === 'ArrowRight' ? 1 : -1)) }
  }}>
    <img className="fa-background" src={ART+'atlas-controls/background.jpg'} alt="祥云宣纸图鉴背景" draggable={false}/>
    <svg className="fa-border" viewBox="0 0 1920 1080" aria-hidden="true">
      <defs><mask id={borderMask}><rect width="1920" height="1080" fill="white"/><rect x="660" y="90" width="710" height="155" fill="black"/></mask></defs>
      <g fill="none" stroke="#c99a38" mask={`url(#${borderMask})`}><rect x="174" y="137" width="1596" height="775" rx="95" strokeWidth="7" opacity=".45"/><rect x="186" y="151" width="1570" height="750" rx="80" strokeWidth="2" opacity=".65"/></g>
    </svg>
    <h1 className="fa-title" style={position(670,104,688,134)}><img src={ART+'atlas-controls/title.png'} alt="修复图鉴" draggable={false}/></h1>
    <div className="fa-gallery" aria-label="图鉴章节">
      {chapters.map((chapter,i) => {
        const active = i === selected, relative = i-selected
        const center = relative === 0 ? 720 : relative === -1 ? 292 : relative < -1 ? 292+(relative+1)*294 : 1164+(relative-1)*294
        const [px,py,pw,ph] = chapter.panel, [cx,cy,cw,ch] = chapter.crop
        const height = active ? 565 : 465, scale = height/465, width=pw*height/ph
        const visible = center > 0 && center < 1900
        return <button key={chapter.name} className={`fa-chapter ${active ? 'is-selected' : ''}`} style={{
          ...position(0,0,pw*465/ph,465), zIndex:active?2:1,
          transform:`translate(${(center-width/2)/19.2}cqw,${(active?284:300)/19.2}cqw) scale(${scale})`,
        }}
          aria-label={chapter.name+(i===1?'，进入修复':'，尚未开放，可浏览')} aria-current={active?'true':undefined} tabIndex={visible?0:-1} aria-hidden={!visible || undefined}
          onClick={() => { if(i===1) onEnter(); else { browse(i); onNotice(`${chapter.name}尚未开放，当前可体验墨痕残卷修复。`) } }}>
          <svg className="fa-chapter-art" viewBox={`${cx} ${cy} ${cw} ${ch}`} style={{left:`${(cx-px)/pw*100}%`,top:`${(cy-py)/ph*100}%`,width:`${cw/pw*100}%`,height:`${ch/ph*100}%`}} aria-hidden="true"><image href={`${ART}atlas/${i+1}.png`} width="671" height="865"/></svg>
        </button>
      })}
    </div>
    <button className="fa-control fa-close" style={position(151,108,75,75)} onClick={onClose} aria-label="关闭修复图鉴" title="返回大厅（Esc）"><svg viewBox="90 12 80 80" aria-hidden="true"><image href={ART+'atlas-controls/4.png'} width="257" height="101"/></svg></button>
    <button className="fa-control" style={position(455,511,123,101)} aria-label="上一部图鉴" disabled={selected===0} onClick={() => browse(selected-1)}><img src={ART+'atlas-controls/1.png'} alt="" draggable={false}/></button>
    <button className="fa-control" style={position(917,516,123,101)} aria-label="下一部图鉴" disabled={selected===chapters.length-1} onClick={() => browse(selected+1)}><img src={ART+'atlas-controls/2.png'} alt="" draggable={false}/></button>
    <button className="fa-control" style={position(1468,117,375,101)} aria-label="浏览最后一部图鉴" disabled={selected===chapters.length-1} onClick={() => browse(chapters.length-1)}><img src={ART+'atlas-controls/3.png'} alt="" draggable={false}/></button>
    <p className="fa-status" aria-live="polite">{chapters[selected].name} · {selected === 1 ? `修复 ${progress}% · 点击画卷进入` : '尚未开放'}<small>← → 浏览图鉴</small></p>
  </section>
}
