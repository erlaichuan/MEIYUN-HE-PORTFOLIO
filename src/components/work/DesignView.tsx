import { useCallback, useEffect, useRef, useState } from 'react'
import BackToFolders from './BackToFolders'
import PostersDeck from './PostersDeck'
import MagazineBook from './MagazineBook'
import IpDesign from './IpDesign'
import './design.css'

const SECTIONS = ['posters', 'magazine', 'rating'] as const

/** SELECTED WORK › DESIGN —— 三段式：海报 / 项目书 / 旋转作品档案 */
export default function DesignView() {
  const [sec, setSec] = useState(0)
  const railRef = useRef<HTMLDivElement>(null)
  const lock = useRef(false)

  const goto = useCallback((i: number) => {
    const n = Math.max(0, Math.min(SECTIONS.length - 1, i))
    setSec(n)
    lock.current = true
    window.setTimeout(() => {
      lock.current = false
    }, 950)
  }, [])

  /* 整页纵向切换：滚轮 / 键盘。海报段的横向滚轮交由内部消费 */
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const absX = Math.abs(e.deltaX)
      const absY = Math.abs(e.deltaY)
      // 横向占优时始终留给当前作品组件；即使光标落在页点或底部按钮上，
      // 斜向触控板手势也不能误触发整页纵向切换。
      if (absY <= absX) return
      const rotating = (e.target as HTMLElement)?.closest<HTMLElement>('[data-rotating-scroll]')
      if (rotating) {
        // 第三页内部滚动负责旋转作品；只有停在第一张并继续向上时才返回上一页。
        if (e.deltaY < 0 && rotating.dataset.atStart === 'true' && !lock.current) goto(sec - 1)
        return
      }
      if ((e.target as HTMLElement)?.closest('[data-hscroll]')) {
        if (absY < 26) return
      }
      if (lock.current || absY < 14) return
      goto(sec + (e.deltaY > 0 ? 1 : -1))
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return
      if (e.key === 'ArrowDown' || e.key === 'PageDown') goto(sec + 1)
      if (e.key === 'ArrowUp' || e.key === 'PageUp') goto(sec - 1)
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
    }
  }, [sec, goto])

  return (
    <div className="wv dv" data-section={SECTIONS[sec]}>
      <BackToFolders />
      <span className="dv__index">
        {String(sec + 1).padStart(2, '0')} /
      </span>

      <div ref={railRef} className="dv__rail" style={{ transform: `translateY(${-sec * 100}%)` }}>
        <section className="dv__sec">
          <PostersDeck active={sec === 0} />
        </section>
        <section className="dv__sec">
          <MagazineBook active={sec === 1} />
        </section>
        <section className="dv__sec">
          <IpDesign active={sec === 2} />
        </section>
      </div>

      {sec < SECTIONS.length - 1 && (
        <div className="wv__foot">
          <button
            type="button"
            className="dv__scrollCue"
            onClick={() => goto(sec + 1)}
            aria-label={sec === 0 ? '向下浏览项目书' : '向下浏览项目成绩'}
          >
            <span className="dv__scrollDisc" aria-hidden="true">
              <svg viewBox="0 0 48 48" fill="currentColor"><path d="M20 9h8v19l7-7 6 6-17 17L7 27l6-6 7 7Z"/></svg>
            </span>
            <span>向下浏览</span>
          </button>
        </div>
      )}

      <div className="dv__dots" aria-hidden>
        {SECTIONS.map((s, i) => (
          <button
            key={s}
            type="button"
            data-on={i === sec}
            onClick={() => goto(i)}
            aria-label={s}
          />
        ))}
      </div>
    </div>
  )
}
