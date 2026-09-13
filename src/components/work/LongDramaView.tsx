import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'
import { gsap } from 'gsap'
import BackToFolders from './BackToFolders'
import LongDramaIntro from './LongDramaIntro'
import LongDramaLightbox, { type ArtworkPreview } from './LongDramaLightbox'
import './longDrama.css'

const SLIDES = [
  ['恋爱生物钟', '主题 Logo · 字形设计'],
  ['恋爱生物钟', '主题 Logo · 色彩延展'],
  ['恋爱生物钟', '主题宣传海报'],
  ['恋爱生物钟', '人物宣传海报'],
  ['恋爱生物钟', '宣发物料设计'],
  ['长歌行', '宣发 / 破 15 亿海报'],
  ['长歌行', 'GIF 动图海报'],
] as const

/** Directional outer-slide / inner-image parallax, inspired by Codrops SlideshowAnimations demo 1. */
export default function LongDramaView() {
  const root = useRef<HTMLDivElement>(null)
  const slides = useRef<(HTMLElement | null)[]>([])
  const current = useRef(0)
  const timeline = useRef<gsap.core.Timeline | null>(null)
  const busy = useRef(false)
  const previewOpen = useRef(false)
  const suppressClick = useRef(false)
  const pointer = useRef<{ x: number; y: number } | null>(null)
  const zoomHint = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [moving, setMoving] = useState(false)
  const [preview, setPreview] = useState<ArtworkPreview | null>(null)

  const hideZoomHint = useCallback(() => {
    if (zoomHint.current) zoomHint.current.hidden = true
  }, [])
  const showZoomHint = (target: EventTarget | null, x: number, y: number) => {
    const hint = zoomHint.current
    if (!hint) return
    if (busy.current || previewOpen.current || !(target instanceof HTMLImageElement)
      || !target.dataset.zoom || !target.complete || !target.naturalWidth
      || !target.closest('.ld-intro[data-reveal="true"]')) {
      hideZoomHint()
      return
    }
    hint.hidden = false
    hint.style.left = `${Math.max(12, Math.min(x + 16, window.innerWidth - hint.offsetWidth - 12))}px`
    hint.style.top = `${Math.max(12, y + 18 + hint.offsetHeight > window.innerHeight - 12 ? y - hint.offsetHeight - 14 : y + 18)}px`
  }
  const trackZoomHint = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch' || event.buttons) { hideZoomHint(); return }
    showZoomHint(event.target, event.clientX, event.clientY)
  }

  const openPreview = useCallback((source: HTMLImageElement) => {
    if (busy.current || previewOpen.current || !source.complete || !source.naturalWidth) return
    hideZoomHint()
    previewOpen.current = true
    setPreview({ source, rotate: source.dataset.zoom !== 'plain' })
  }, [hideZoomHint])
  const closePreview = useCallback(() => { previewOpen.current = false; setPreview(null) }, [])

  const navigate = useCallback((direction: number, target?: number) => {
    if (busy.current || previewOpen.current) return
    const next = Math.max(0, Math.min(SLIDES.length - 1, target ?? current.current + direction))
    if (next === current.current) return
    const outgoing = slides.current[current.current]
    const incoming = slides.current[next]
    if (!outgoing || !incoming) return
    hideZoomHint()
    const oldImage = outgoing.querySelector('.ld__image')
    const newImage = incoming.querySelector('.ld__image')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    busy.current = true
    setMoving(true)
    current.current = next
    setIndex(next)
    gsap.set(incoming, { visibility: 'visible', zIndex: 2 })
    gsap.set(outgoing, { zIndex: 1 })
    timeline.current = gsap.timeline({
      defaults: { duration: reduced ? 0 : 1.3, ease: 'power4.inOut' },
      onComplete: () => {
        gsap.set(outgoing, { visibility: 'hidden', yPercent: 0, zIndex: 0 })
        gsap.set(oldImage, { yPercent: 0 })
        gsap.set(incoming, { zIndex: 1 })
        busy.current = false
        setMoving(false)
      },
    })
      .to(outgoing, { yPercent: -direction * 100 }, 0)
      .to(oldImage, { yPercent: direction * 30 }, 0)
      .fromTo(incoming, { yPercent: direction * 100 }, { yPercent: 0 }, 0)
      .fromTo(newImage, { yPercent: -direction * 30 }, { yPercent: 0 }, 0)
  }, [hideZoomHint])

  useEffect(() => {
    const el = root.current
    if (!el) return
    let accumulated = 0
    let lastWheel = 0
    let gestureUsed = false
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return // Preserve pinch-to-zoom.
      event.preventDefault()
      const now = performance.now()
      if (now - lastWheel > 220) { accumulated = 0; gestureUsed = false }
      lastWheel = now
      if (busy.current || gestureUsed) return
      accumulated += event.deltaY * (event.deltaMode === 1 ? 16 : 1)
      if (Math.abs(accumulated) < 45) return
      gestureUsed = true
      navigate(accumulated > 0 ? 1 : -1)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('resize', hideZoomHint)
    return () => {
      el.removeEventListener('wheel', onWheel)
      window.removeEventListener('resize', hideZoomHint)
      timeline.current?.kill()
    }
  }, [navigate, hideZoomHint])

  return (<>
    <div className="ld" ref={root} onKeyDown={(event) => {
      if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(event.key)) {
        event.preventDefault()
        navigate(['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1)
      }
    }}>
      <BackToFolders />
      <header className="ld__header">
        <p>POSTER PROJECTS / 2021</p>
        <h1>长剧海报</h1>
        <span>DRAMA SERIES — VISUAL DESIGN</span>
      </header>
      <div className="ld__stage" role="region" aria-roledescription="轮播" aria-label="长剧海报作品"
        tabIndex={0}
        onPointerOver={trackZoomHint} onPointerMove={trackZoomHint} onPointerLeave={hideZoomHint}
        onFocusCapture={(event) => {
          const rect = event.target.getBoundingClientRect()
          showZoomHint(event.target, rect.left + rect.width / 2, rect.top + rect.height / 2)
        }}
        onBlurCapture={hideZoomHint}
        onClick={(event) => {
          if (suppressClick.current) return
          const target = event.target
          if (target instanceof HTMLImageElement && target.dataset.zoom) openPreview(target)
        }}
        onKeyDown={(event) => {
          const target = event.target
          if ((event.key === 'Enter' || event.key === ' ') && target instanceof HTMLImageElement && target.dataset.zoom) {
            event.preventDefault(); event.stopPropagation(); openPreview(target)
          }
        }}
        onPointerDown={(event) => {
          hideZoomHint()
          if (event.pointerType === 'mouse' && event.button !== 0) return
          suppressClick.current = false
          pointer.current = { x: event.clientX, y: event.clientY }
          // Keep clicks targeted at artwork; capture only background gestures.
          if (!(event.target instanceof HTMLImageElement && event.target.dataset.zoom)) event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerUp={(event) => {
          if (!pointer.current) return
          const dx = event.clientX - pointer.current.x
          const dy = event.clientY - pointer.current.y
          pointer.current = null
          suppressClick.current = Math.hypot(dx, dy) > 8
          const delta = Math.abs(dx) > Math.abs(dy) ? dx : dy
          if (Math.abs(delta) > 45) navigate(delta < 0 ? 1 : -1)
        }} onPointerCancel={() => { pointer.current = null }}>
        {SLIDES.map(([title, subtitle], i) => (
          <figure key={i} className="ld__slide" ref={(el) => { slides.current[i] = el }}
            style={{ visibility: i === 0 ? 'visible' : 'hidden' }}
            aria-hidden={index !== i} aria-label={`${i + 1} / 7，${title}，${subtitle}`}>
            <div className="ld__image ld__image--intro">
              <LongDramaIntro active={index === i} entering={moving} variant={i === 0 ? 'construction' : i === 1 ? 'color' : i === 2 ? 'promotion' : i === 3 ? 'characters' : i === 4 ? 'publicity' : i === 5 ? 'ballad' : 'ballad-gif'} />
            </div>
          </figure>
        ))}
      </div>
      <footer className="ld__footer">
        <div className="ld__caption" aria-live="polite" aria-atomic="true">
          <span>{String(index + 1).padStart(2, '0')} / 07</span>
          <h2>{SLIDES[index][0]}</h2><p>{SLIDES[index][1]}</p>
        </div>
        <div className="ld__navigation">
          <button type="button" aria-label="上一张海报" disabled={moving || index === 0} onClick={() => navigate(-1)}>←</button>
          <div className="ld__dots" aria-label="选择海报">
            {SLIDES.map((_, i) => <button key={i} type="button" aria-label={`第 ${i + 1} 张海报`}
              aria-current={index === i ? 'true' : undefined} disabled={moving}
              onClick={() => navigate(i > index ? 1 : -1, i)}><i /></button>)}
          </div>
          <button type="button" aria-label="下一张海报" disabled={moving || index === SLIDES.length - 1} onClick={() => navigate(1)}>→</button>
        </div>
        <p className="ld__hint">滚动 / 滑动 / 方向键切换</p>
      </footer>
      <div ref={zoomHint} className="ld__zoom-hint" hidden aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <circle cx="10" cy="10" r="6.5" /><path d="m15 15 6 6M10 7v6M7 10h6" />
        </svg>
        点击可查看大图
      </div>
    </div>
    {preview && <LongDramaLightbox selection={preview} onClose={closePreview} />}
  </>)
}
