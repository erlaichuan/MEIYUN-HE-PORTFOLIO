import { useEffect, useRef, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { ART } from './gameData'
import { playUISound } from './audio/uiSoundManager'

/** Codrops-inspired moving colour reveal; original artwork remains unmodified. */
export default function RepairPainting({ children, progress }: { children: ReactNode; progress: number }) {
  const root = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const bounds = useRef<DOMRect | null>(null)
  const cursor = useRef({ x: 50, y: 50, targetX: 50, targetY: 50, time: 0 })
  const reduced = useReducedMotion()
  const reveal = (x: number, y: number) => {
    const element = root.current
    if (!element) return
    const position = cursor.current
    position.targetX = Math.max(0, Math.min(100, x))
    position.targetY = Math.max(0, Math.min(100, y))
    if (element.dataset.revealing !== 'true' || reduced) {
      position.x = position.targetX
      position.y = position.targetY
    }
    element.dataset.revealing = 'true'
    const paint = (time: number) => {
      const delta = Math.min((time - (position.time || time)) / 1000, 0.05)
      position.time = time
      const ease = reduced ? 1 : 1 - Math.exp(-24 * delta)
      position.x += (position.targetX - position.x) * ease
      position.y += (position.targetY - position.y) * ease
      element.style.setProperty('--repair-x', `${position.x}%`)
      element.style.setProperty('--repair-y', `${position.y}%`)
      if (Math.abs(position.targetX - position.x) + Math.abs(position.targetY - position.y) > 0.02) {
        frame.current = requestAnimationFrame(paint)
      } else {
        frame.current = 0
        position.time = 0
      }
    }
    if (!frame.current) frame.current = requestAnimationFrame(paint)
  }
  const hide = () => {
    bounds.current = null
    if (root.current) root.current.dataset.revealing = 'false'
    cancelAnimationFrame(frame.current)
    frame.current = 0
    cursor.current.time = 0
  }
  useEffect(() => {
    const invalidateBounds = () => { bounds.current = null }
    const observer = new ResizeObserver(invalidateBounds)
    if (root.current) observer.observe(root.current)
    const dialog = root.current?.closest('.fg-repair')
    dialog?.addEventListener('animationend', invalidateBounds)
    const onBlur = () => {
      if (root.current) root.current.dataset.revealing = 'false'
      cancelAnimationFrame(frame.current)
      frame.current = 0
      cursor.current.time = 0
      invalidateBounds()
    }
    const onVisibility = () => { if (document.hidden) onBlur() }
    window.addEventListener('blur', onBlur)
    window.addEventListener('resize', invalidateBounds)
    window.addEventListener('scroll', invalidateBounds, true)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      observer.disconnect()
      dialog?.removeEventListener('animationend', invalidateBounds)
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('resize', invalidateBounds)
      window.removeEventListener('scroll', invalidateBounds, true)
      document.removeEventListener('visibilitychange', onVisibility)
      cancelAnimationFrame(frame.current)
    }
  }, [])
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' && event.buttons === 0 && event.type !== 'pointerdown') return
    const rect = bounds.current ??= event.currentTarget.getBoundingClientRect()
    reveal((event.clientX - rect.left) / rect.width * 100, (event.clientY - rect.top) / rect.height * 100)
  }
  const keyMove = (event: KeyboardEvent<HTMLDivElement>) => {
    const delta = { ArrowLeft: [-5, 0], ArrowRight: [5, 0], ArrowUp: [0, -5], ArrowDown: [0, 5] }[event.key]
    if (!delta) return
    event.preventDefault()
    reveal(cursor.current.targetX + delta[0], cursor.current.targetY + delta[1])
  }
  return <div ref={root} className="fg-painting fg-reveal-painting" tabIndex={0} role="group"
    aria-label="残卷显色画布：移动鼠标或手指查看局部原色，也可用方向键移动显色区域" aria-describedby="repair-reveal-hint"
    onPointerEnter={move} onPointerMove={move} onPointerDown={event => {
      if (!(event.target as Element).closest('button')) playUISound('ui.brush')
      move(event)
    }} onPointerLeave={hide} onPointerCancel={hide}
    onPointerUp={(event) => { if (event.pointerType !== 'mouse') hide() }}
    onFocusCapture={(event) => {
      const bounds = event.currentTarget.getBoundingClientRect()
      const target = event.target.getBoundingClientRect()
      reveal((target.left + target.width / 2 - bounds.left) / bounds.width * 100, (target.top + target.height / 2 - bounds.top) / bounds.height * 100)
    }}
    onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) hide() }} onKeyDown={keyMove}>
    <img className="fg-reveal-monochrome" src={ART + 'landscape.webp'} alt="墨痕残卷青绿山水，鼠标附近显现原色，其他区域为黑白" draggable={false}/>
    <img className="fg-reveal-colour" src={ART + 'landscape.webp'} alt="" aria-hidden="true" draggable={false}/>
    <div className="fg-cracks" style={{ opacity: 1 - progress / 100 }}/>
    {children}
  </div>
}
