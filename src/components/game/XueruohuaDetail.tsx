import type { CSSProperties } from 'react'
import { DetailStats } from './DetailStats'
import { useDetailMotion } from './useDetailMotion'
import { ART } from './gameData'
import './luhanzhouDetail.css'

const source = ART+'xueruohua-detail/'
const place = (x:number,y:number,w:number,h:number):CSSProperties => ({left:`${x/19.2}%`,top:`${y/10.8}%`,width:`${w/19.2}%`,height:`${h/10.8}%`})
const tabs = [
  { name:'身份背景', art:'shengfenbeijing', x:448, y:-278, w:178, h:651 },
  { name:'技能属性', art:'jinengshuxing', x:576, y:-274, w:162, h:636 },
  { name:'战斗定位', art:'zhandoudingwei', x:692, y:-278, w:178, h:651 },
  { name:'法器属性', art:'faqishuxing', x:820, y:-274, w:162, h:636 },
]

export default function XueruohuaDetail({ tab,onTab,onBack,onHome }: {
  tab:number; onTab:(tab:number)=>void; onBack:()=>void; onHome:()=>void
}) {
  const motionRef = useDetailMotion(tab)
  return <section ref={motionRef} className="lh-detail" aria-label="薛若华角色详情">
    <img className="lh-background" src={ART+'details/background.jpg'} alt="" draggable={false}/>
    <img className="lh-art lh-portrait" style={place(696,0,1227,1080)} src={source+'1.png'} alt="花神侍女薛若华，捧莲立于人物卷轴中" draggable={false}/>
    <button className="lh-back" style={place(44,99,211,68)} aria-label="返回角色卡牌" title="返回角色卡牌（Esc）" onClick={onBack}>
      <svg viewBox="44 51 211 68" aria-hidden="true"><image href={source+'back.png'} width="303" height="168"/></svg>
    </button>
    <button className="lh-home" style={place(271,100,74,70)} aria-label="返回主界面" title="返回大厅" onClick={onHome}><img src={source+'1_副本.png'} alt="" draggable={false}/></button>
    {tab === 1 && <div className="lh-attributes" role="region" aria-label="薛若华技能属性">
      <img className="lh-art" style={place(93,143,457,421)} src={source+'7.png'} alt="等级9" draggable={false}/>
      <img className="lh-art" style={place(110,487,433,164)} src={source+'8.png'} alt="等级进度：LV.52/120，525/1000" draggable={false}/>
      <DetailStats character="xueruohua" style={place(530,278,669,495)} src={source+'2.png'} alt="薛若华属性：生命值、灵力、攻击力、暴击率、速度"/>
      <img className="lh-art" style={place(0,600,621,246)} src={source+'4.png?v=8b682f8a'} alt="莲华净尘，三星：召唤净世莲花驱散古画中的污渍与霉斑，让蒙尘的画面重现清明。" draggable={false}/>
      <img className="lh-art" style={place(559,683,622,269)} src={source+'3.png?v=93b6c3fe'} alt="万蕊回春，四星：以迅捷身法穿梭画境，追踪并锁定隐藏裂痕与异变源头，快速完成关键部位修复。" draggable={false}/>
      <img className="lh-art" style={place(0,777,621,257)} src={source+'5.png?v=9afa5040'} alt="花影护卷，四星：展开花光结界，安抚画中游魂并保护脆弱画纸，防止修复过程造成二次损伤。" draggable={false}/>
    </div>}
    {tab !== 1 && <article className="lh-content lh-content--unavailable" aria-label={`薛若华 · ${tabs[tab].name}`}>
      <h2 role="status">区域未开放</h2>
    </article>}
    <div className="lh-tabs" role="group" aria-label="人物介绍选择栏">
      {tabs.map((item,i) => {
        return <button key={item.art} className={`lh-tab ${tab===i?'is-selected':''}`} style={place(item.x+item.w/2-58,52,116,276)} aria-label={item.name} aria-pressed={tab===i} title={item.name}
          onClick={() => onTab(i)} onKeyDown={event => {
            const next = event.key==='ArrowRight' ? (i+1)%4 : event.key==='ArrowLeft' ? (i+3)%4 : event.key==='Home' ? 0 : event.key==='End' ? 3 : null
            if (next===null) return
            event.preventDefault(); onTab(next)
            event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus()
          }}>
          <img src={source+item.art+'.png'} alt="" draggable={false} style={{left:`${(116-item.w)/2/116*100}%`,top:`${(item.y-52)/276*100}%`,width:`${item.w/116*100}%`,height:`${item.h/276*100}%`}}/>
        </button>
      })}
    </div>
  </section>
}
