import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent, type WheelEvent } from 'react'
import { RATING_IMAGES, type RatingImage } from '../../data/rating.generated'

const RATING_TITLES = [
  '甜港京婚',
  '当离婚律师想离婚',
  '龙凤呈祥：狂潮',
  '屠龙策',
  '甜港京婚',
  '别叫姐姐',
  '漓江仙子的人间烟火',
  '南洋往事',
  '觉醒即无敌转身叛仙门',
  '南洋往事',
  '此生知我心',
  '夫人每天都在担心掉马',
  '老公的工资婆婆的账',
  '张女士她出手了',
] as const

// User-supplied results, matched by project order (including repeated titles).
const RATING_METRICS = [
  '红果站内预约量破100万',
  '红果播放量破10亿',
  '抖音播放量破1亿',
  '抖音播放量破亿，红果热度破5000万',
  '抖音播放量破亿，红果热度破5400万',
  '红果热度破5000万，抖音播放量破1亿',
  '抖音播放量破亿，红果热度破5600万',
  '上线48小时抖音播放量破2亿',
  '抖音播放量破亿，红果热度破5300万',
  '抖音播放量破3亿',
  '全网播放量破亿',
  '红果热度破5100万，抖音播放量破亿',
  '抖音播放量破3亿，红果热度破5200万',
  '抖音播放量破1亿',
] as const

const clampTo = (value: number, lastIndex: number) => Math.max(0, Math.min(lastIndex, value))

type RotatingArchiveProps = {
  active: boolean
  images: RatingImage[]
  titles: readonly string[]
  metrics?: readonly string[]
  heading?: string
  ghost?: string
  showScrollHint?: boolean
}

/** DESIGN › 03 —— 纵向滚动驱动的 3D 旋转作品环 */
export default function IpDesign({ active }: { active: boolean }) {
  return (
    <RotatingArchive
      active={active}
      images={RATING_IMAGES}
      titles={RATING_TITLES}
      metrics={RATING_METRICS}
      heading="SELECTED PROJECTS"
      ghost="RATING"
      showScrollHint
    />
  )
}

/** 可供真人剧与 AI 剧栏目共同使用的滚动 3D 作品环。 */
export function RotatingArchive({
  active,
  images,
  titles,
  metrics,
  heading = 'SELECTED PROJECTS',
  ghost = 'RATING',
  showScrollHint = false,
}: RotatingArchiveProps) {
  const lastIndex = Math.min(images.length, titles.length) - 1
  const [progress, setProgress] = useState(0)
  const progressRef = useRef(0)
  const targetRef = useRef(0)
  const frameRef = useRef<number | null>(null)
  const snapRef = useRef<number | null>(null)
  const dragRef = useRef<{ y: number; target: number; moved: boolean } | null>(null)
  const suppressClickRef = useRef(false)

  const animate = useCallback(function runFrame() {
    const distance = targetRef.current - progressRef.current
    const next = Math.abs(distance) < 0.001 ? targetRef.current : progressRef.current + distance * 0.16
    progressRef.current = next
    setProgress(next)

    if (Math.abs(targetRef.current - next) > 0.001) {
      frameRef.current = requestAnimationFrame(runFrame)
    } else {
      frameRef.current = null
    }
  }, [])

  const schedule = useCallback(() => {
    if (frameRef.current === null) frameRef.current = requestAnimationFrame(animate)
  }, [animate])

  const moveTo = useCallback((next: number) => {
    targetRef.current = clampTo(next, lastIndex)
    schedule()
  }, [lastIndex, schedule])

  const queueSnap = useCallback(() => {
    if (snapRef.current !== null) window.clearTimeout(snapRef.current)
    snapRef.current = window.setTimeout(() => moveTo(Math.round(targetRef.current)), 120)
  }, [moveTo])

  useEffect(() => () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    if (snapRef.current !== null) window.clearTimeout(snapRef.current)
  }, [])

  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!active) return
    const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX
    if (delta < 0 && targetRef.current <= 0.001) return
    event.preventDefault()
    moveTo(targetRef.current + delta * 0.0027)
    queueSnap()
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragRef.current = { y: event.clientY, target: targetRef.current, moved: false }
    suppressClickRef.current = false
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag) return
    const distance = drag.y - event.clientY
    drag.moved ||= Math.abs(distance) > 5
    moveTo(drag.target + distance / 115)
  }

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current) {
      suppressClickRef.current = dragRef.current.moved
      queueSnap()
    }
    dragRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const activeIndex = clampTo(Math.round(progress), lastIndex)

  return (
    <div
      className="rating"
      data-active={active}
      data-has-metrics={!!metrics || undefined}
      data-at-start={progress <= 0.001}
      data-rotating-scroll
      tabIndex={active ? 0 : -1}
      aria-label="滚动浏览作品"
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={(event) => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
          event.preventDefault()
          event.stopPropagation()
          moveTo(Math.round(targetRef.current) + 1)
        }
        if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
          if (targetRef.current <= 0.001 && event.key === 'ArrowUp') return
          event.preventDefault()
          event.stopPropagation()
          moveTo(Math.round(targetRef.current) - 1)
        }
      }}
    >
      <span className="rating__ghost" aria-hidden>{ghost}</span>

      <header className="rating__header">
        <span>{heading}</span>
        <span>SCROLL TO ROTATE</span>
      </header>

      <div className="rating__scene">
        <div className="rating__ring">
          {images.map((image, index) => {
            const offset = index - progress
            const distance = Math.abs(offset)
            const theta = offset * 28
            const visible = distance < 4.1
            const style = {
              '--rating-angle': `${theta}deg`,
              '--rating-angle-back': `${-theta}deg`,
              '--rating-tilt': `${Math.max(-5, Math.min(5, offset * 1.2))}deg`,
              aspectRatio: `${image.width} / ${image.height}`,
              opacity: visible ? Math.max(0.06, 1 - distance * 0.23) : 0,
              zIndex: 100 - Math.round(distance * 10),
              pointerEvents: visible ? 'auto' : 'none',
            } as CSSProperties

            return (
              <button
                type="button"
                className="rating__card"
                data-current={index === activeIndex}
                style={style}
                key={image.id}
                tabIndex={visible ? 0 : -1}
                onClick={() => {
                  if (suppressClickRef.current) {
                    suppressClickRef.current = false
                    return
                  }
                  moveTo(index)
                }}
                aria-label={`${String(index + 1).padStart(2, '0')} ${titles[index]}`}
              >
                <img
                  src={image.src}
                  srcSet={image.srcSet}
                  sizes="(max-width: 700px) 52vw, 34vw"
                  width={image.width}
                  height={image.height}
                  loading={index < 3 ? 'eager' : 'lazy'}
                  draggable={false}
                  alt={titles[index]}
                />
                <span className="rating__cardNo">{String(index + 1).padStart(2, '0')}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="rating__caption" aria-live="polite" aria-atomic="true">
        <span className="rating__count">
          {String(activeIndex + 1).padStart(2, '0')} / {String(lastIndex + 1).padStart(2, '0')}
        </span>
        <h1 key={activeIndex}>{titles[activeIndex]}</h1>
        {metrics?.[activeIndex] && <p className="rating__metric" key={`metric-${activeIndex}`}>{metrics[activeIndex]}</p>}
      </div>

      <div className="rating__controls">
        {showScrollHint && <span className="rating__scrollHint">滑动查看</span>}
        <button type="button" onClick={() => moveTo(Math.round(targetRef.current) - 1)} disabled={activeIndex === 0} aria-label="上一个作品">↑</button>
        <span className="rating__track" aria-hidden>
          <i style={{ transform: `scaleX(${lastIndex ? progress / lastIndex : 0})` }} />
        </span>
        <button type="button" onClick={() => moveTo(Math.round(targetRef.current) + 1)} disabled={activeIndex === lastIndex} aria-label="下一个作品">↓</button>
      </div>
    </div>
  )
}
