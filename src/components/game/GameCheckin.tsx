import { useEffect, useId, useRef } from 'react'
import { ART } from './gameData'
import './gameCheckin.css'

// Native coordinates in quan.png (1964 × 990), registered to reference 21.jpg.
const rewards = [
  { x:630, y:288, w:144, h:391, name:'云岫缘与表情包' },
  { x:790, y:291, w:142, h:390, name:'稀有道具与灵玉' },
  { x:948, y:292, w:181, h:390, name:'角色卡' },
  { x:1107, y:292, w:146, h:389, name:'灵玉与中秋限定奖励' },
  { x:1274, y:289, w:141, h:389, name:'神秘奖励' },
  { x:1443, y:287, w:206, h:425, name:'神秘宝箱' },
  { x:1682, y:308, w:217, h:427, name:'角色卡与灵玉大礼' },
]

export default function GameCheckin({ claimed, onClaim, onClose }: {
  claimed: boolean; onClaim: () => void; onClose: () => void
}) {
  const close = useRef<HTMLButtonElement>(null)
  const artMask = useId()
  useEffect(() => { close.current?.focus({ preventScroll:true }) }, [])
  return <div className="fg-checkin-shade">
    <section className="fg-checkin-scroll" role="dialog" aria-modal="true" aria-label="七日签到" aria-describedby="fg-checkin-status" onKeyDown={event => {
      if (event.key !== 'Tab') return
      const targets = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'))
      const first = targets[0], last = targets[targets.length-1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }}>
      <div className="fc-artboard">
        <svg className="fc-scroll-art" viewBox="0 0 1964 990" aria-hidden="true">
          <defs><mask id={artMask}><rect width="1964" height="990" fill="white"/><circle cx="137" cy="119" r="32" fill="black"/></mask></defs>
          <image href={ART+'checkin/quan.png'} width="1964" height="990" mask={`url(#${artMask})`}/>
          {/* Continue the scroll edge beneath the former baked-in close icon. */}
          <svg x="146" y="87" width="23" height="65" viewBox="146 158 23 65"><image href={ART+'checkin/quan.png'} width="1964" height="990"/></svg>
        </svg>
        {rewards.map((reward,i) => <figure className="fc-reward-art" key={i} style={{left:`${reward.x/1964*100}%`,top:`${reward.y/990*100}%`,width:`${reward.w/1964*100}%`,height:`${reward.h/990*100}%`}}>
          <img src={`${ART}checkin/${i+1}.png`} alt={`第${i+1}日奖励原稿：${reward.name}`} draggable={false}/>
        </figure>)}
      </div>
      <button ref={close} type="button" className="fc-close" aria-label="关闭签到，返回大厅" title="关闭签到（Esc）" onClick={onClose}><svg viewBox="90 12 80 80" aria-hidden="true"><image href={ART+'atlas-controls/4.png'} width="257" height="101"/></svg></button>
      <div className="fc-current-day">
        <p id="fg-checkin-status" role="status">{claimed ? '今日已签到 · 灵玉已入背包' : '今日签到 · 领取灵玉 × 20'}</p>
        <button className="fc-claim" data-ui-sound="none" type="button" disabled={claimed} onClick={onClaim}>{claimed ? '今日已领取' : '领取今日奖励'}</button>
        <small>七日奖励为原稿展示 · 每日领取状态以此处为准</small>
      </div>
    </section>
  </div>
}
