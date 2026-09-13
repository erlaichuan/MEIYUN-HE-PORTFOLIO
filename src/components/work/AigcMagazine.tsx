import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent, type WheelEvent } from 'react'
import { AIGC_IMAGES } from '../../data/aigc.generated'
import BackToFolders from './BackToFolders'
import ProjectBackButton from './ProjectBackButton'
import './aigcMagazine.css'

const TITLES = [
  '伪装人生', '养家五年她只换来一句心寒', '系统让我当反派男主偏要宠我', '深海的诀别',
  '前夫哥别太抠了第第一季', '高考前我拒绝帮校花递情书给他', '家丑我偏要张扬',
  '吃我的用我的那我离婚你哭什么', '奖金清零？我们集体辞职后老板慌了', '妈妈走后我独立',
  '重生回到哥嫂换运前', '被欺负那天妈妈成了英雄', '地都慌了知道求我了',
] as const

const mod = (value: number, length: number) => ((value % length) + length) % length
const wrappedOffset = (index: number, progress: number, length: number) => {
  const half = length / 2
  return mod(index - progress + half, length) - half
}

/** AI DRAMA —— 参考 WebGL Magazine 的环形海报杂志体验。 */
export default function AigcMagazine() {
  const count = Math.min(AIGC_IMAGES.length, TITLES.length)
  const [progress, setProgress] = useState(0)
  const [focused, setFocused] = useState<number | null>(null)
  const progressRef = useRef(0)
  const targetRef = useRef(0)
  const frameRef = useRef<number | null>(null)
  const snapRef = useRef<number | null>(null)
  const dragRef = useRef<{ x: number; y: number; target: number; moved: boolean } | null>(null)
  const suppressClickRef = useRef(false)

  const animate = useCallback(function update() {
    const distance = targetRef.current - progressRef.current
    const next = Math.abs(distance) < 0.001 ? targetRef.current : progressRef.current + distance * 0.115
    progressRef.current = next
    setProgress(next)
    if (Math.abs(targetRef.current - next) > 0.001) frameRef.current = requestAnimationFrame(update)
    else frameRef.current = null
  }, [])

  const moveTo = useCallback((next: number) => {
    targetRef.current = next
    if (frameRef.current === null) frameRef.current = requestAnimationFrame(animate)
  }, [animate])

  const snap = useCallback(() => {
    if (snapRef.current !== null) window.clearTimeout(snapRef.current)
    snapRef.current = window.setTimeout(() => moveTo(Math.round(targetRef.current)), 110)
  }, [moveTo])

  useEffect(() => () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    if (snapRef.current !== null) window.clearTimeout(snapRef.current)
  }, [])

  useEffect(() => {
    if (focused === null) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFocused(null)
      if (event.key === 'ArrowLeft') setFocused((value) => value === null ? null : mod(value - 1, count))
      if (event.key === 'ArrowRight') setFocused((value) => value === null ? null : mod(value + 1, count))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [count, focused])

  const activeIndex = mod(Math.round(progress), count)
  const cards = useMemo(() => AIGC_IMAGES.slice(0, count), [count])

  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (focused !== null) return
    const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX
    event.preventDefault()
    moveTo(targetRef.current + delta * 0.0026)
    snap()
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (focused !== null) return
    dragRef.current = { x: event.clientX, y: event.clientY, target: targetRef.current, moved: false }
    suppressClickRef.current = false
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag) return
    const dx = drag.x - event.clientX
    const dy = drag.y - event.clientY
    const distance = Math.abs(dx) > Math.abs(dy) ? dx : dy
    drag.moved ||= Math.abs(distance) > 5
    moveTo(drag.target + distance / 132)
  }

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current) {
      suppressClickRef.current = dragRef.current.moved
      snap()
    }
    dragRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const focusCard = (index: number) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }
    const offset = wrappedOffset(index, targetRef.current, count)
    if (Math.abs(offset) > 0.45) moveTo(targetRef.current + offset)
    else setFocused(index)
  }

  return (
    <div className="wv aigcm-view">
      <BackToFolders />
      <main
        className="aigcm"
        tabIndex={0}
        aria-label="AI 剧海报 3D 杂志，滚动或拖动浏览"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            event.preventDefault(); moveTo(Math.round(targetRef.current) + 1)
          }
          if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            event.preventDefault(); moveTo(Math.round(targetRef.current) - 1)
          }
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault(); setFocused(activeIndex)
          }
        }}
      >
        <header className="aigcm__mast">
          <h1>ai短剧海报展示</h1>
        </header>

        <section className="aigcm__viewport" aria-live="polite">
          <div className="aigcm__stage">
            {cards.map((image, index) => {
              const offset = wrappedOffset(index, progress, count)
              const distance = Math.abs(offset)
              const style = {
                '--am-x': `calc(${offset} * var(--am-step))`, '--am-z': `${-distance * distance * 42}px`,
                '--am-ry': `${Math.max(-68, Math.min(68, offset * -13))}deg`,
                '--am-rz': `${Math.max(-3.5, Math.min(3.5, offset * -0.72))}deg`,
                '--am-scale': `${1 - Math.min(distance * 0.035, 0.2)}`,
                aspectRatio: `${image.width} / ${image.height}`,
                opacity: distance > 6.25 ? 0 : Math.max(0.2, 1 - distance * 0.095),
                zIndex: 100 - Math.round(distance * 10), pointerEvents: distance < 5.6 ? 'auto' : 'none',
              } as CSSProperties
              return (
                <div className="aigcm__cardShell" style={style} key={image.id}>
                  <button type="button" className="aigcm__card" data-current={index === activeIndex}
                    onClick={() => focusCard(index)} tabIndex={distance < 0.55 ? 0 : -1}
                    aria-label={`${String(index + 1).padStart(2, '0')} ${TITLES[index]}`}>
                    <img src={image.src} srcSet={image.srcSet} sizes="(max-width: 720px) 48vw, 22vw"
                      width={image.width} height={image.height} loading={distance < 2.5 ? 'eager' : 'lazy'}
                      draggable={false} alt={TITLES[index]} />
                    <span className="aigcm__cardNo">{String(index + 1).padStart(2, '0')}</span>
                  </button>
                </div>
              )
            })}
          </div>
        </section>

        <footer className="aigcm__footer">
          <p><span>2026</span><strong>VOL. AI</strong></p>
          <div className="aigcm__caption">
            <span>{String(activeIndex + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}</span>
            <h1 key={activeIndex}>{TITLES[activeIndex]}</h1>
          </div>
          <nav className="aigcm__controls" aria-label="海报切换">
            <button type="button" onClick={() => moveTo(Math.round(targetRef.current) - 1)} aria-label="上一张">←</button>
            <span aria-hidden><i style={{ transform: `scaleX(${(activeIndex + 1) / count})` }} /></span>
            <button type="button" onClick={() => moveTo(Math.round(targetRef.current) + 1)} aria-label="下一张">→</button>
          </nav>
        </footer>
      </main>

      {focused !== null && (
        <div className="aigcm__focus" role="dialog" aria-modal="true" aria-label={TITLES[focused]}
          onClick={() => setFocused(null)}>
          <ProjectBackButton placement="local" onClick={() => setFocused(null)} />
          <button type="button" className="aigcm__focusArrow aigcm__focusArrow--prev"
            onClick={(event) => { event.stopPropagation(); setFocused(mod(focused - 1, count)) }} aria-label="上一张海报">←</button>
          <figure onClick={(event) => event.stopPropagation()}>
            <img src={cards[focused].src} srcSet={cards[focused].srcSet} sizes="min(72vw, 72vh)" alt={TITLES[focused]} />
            <figcaption><span>{String(focused + 1).padStart(2, '0')}</span>{TITLES[focused]}</figcaption>
          </figure>
          <button type="button" className="aigcm__focusArrow aigcm__focusArrow--next"
            onClick={(event) => { event.stopPropagation(); setFocused(mod(focused + 1, count)) }} aria-label="下一张海报">→</button>
        </div>
      )}
    </div>
  )
}
