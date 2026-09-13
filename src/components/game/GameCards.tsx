import type { CSSProperties } from 'react'
import { ART, characters } from './gameData'
import './gameCards.css'

const cards = [
  { index:1, x:284, width:248 }, { index:0, x:545, width:240 },
  { index:4, x:786, width:241 }, { index:2, x:1034, width:239 },
  { index:3, x:1279, width:238 }, { index:5, x:1528, width:242 },
]
const place = (x:number,y:number,width:number,height:number):CSSProperties => ({left:`${x/19.2}%`,top:`${y/10.8}%`,width:`${width/19.2}%`,height:`${height/10.8}%`})

export default function GameCards({ onClose, onSelect }: { onClose:()=>void; onSelect:(index:number)=>void }) {
  return <section className="gc-cards" aria-label="角色卡牌">
    <img className="gc-background" src={ART+'character-cards/background.png'} alt="竹影宣纸背景" draggable={false}/>
    <img className="gc-title" style={place(587,104,688,134)} src={ART+'character-cards/7.png'} alt="角色卡牌" draggable={false}/>
    <svg className="gc-calligraphy" style={place(70,343,214,400)} viewBox="70 343 214 400" role="img" aria-label="浮生绘境"><image href={ART+'ui-22.webp'} width="1920" height="1080"/></svg>
    {cards.map((card,i) => <div key={card.index}>
      <button className="gc-card" style={place(card.x,254,card.width,618)} aria-label={`查看${characters[card.index].name}角色详情`} onClick={() => onSelect(card.index)}>
        <img src={`${ART}character-cards/${i+1}.png`} alt="" draggable={false}/>
      </button>
      <div className="gc-reflection" style={place(card.x,874,card.width,145)} aria-hidden="true"><img src={`${ART}character-cards/${i+1}.png`} alt="" draggable={false}/></div>
    </div>)}
    <button className="gc-close" style={place(1787,102,80,80)} aria-label="关闭角色卡牌" title="返回大厅（Esc）" onClick={onClose}>
      <svg viewBox="90 12 80 80" aria-hidden="true"><image href={ART+'atlas-controls/4.png'} width="257" height="101"/></svg>
    </button>
  </section>
}
