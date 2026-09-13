import { useLayoutEffect, useRef } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { playUISound, soundAtAnimation } from './audio/uiSoundManager'

const easing = 'cubic-bezier(0.22, 1, 0.36, 1)'
const entrance = [
  { opacity: 0, transform: 'translateY(55px) scale(0.98)', offset: 0, easing },
  { opacity: 1, transform: 'translateY(-5px) scale(1.01)', offset: 0.7, easing },
  { opacity: 1, transform: 'translateY(0) scale(1)', offset: 1 },
]
const localEntrance = [
  { opacity: 0, transform: 'translateY(16px)' },
  { opacity: 1, transform: 'translateY(0)' },
]

/** Animate only information artwork; the portrait, background and hanging tabs stay still. */
export function useDetailMotion(tab: number) {
  const root = useRef<HTMLElement>(null)
  const previousTab = useRef(tab)
  const switched = useRef(false)
  const reduced = useReducedMotion()

  useLayoutEffect(() => {
    if (previousTab.current !== tab) switched.current = true
    previousTab.current = tab
    if (!root.current) return
    if (reduced) { if (!switched.current) playUISound('ui.paper'); return }

    const local = switched.current
    const animations: Animation[] = []
    const panels = root.current.querySelectorAll<HTMLElement>('.lh-attributes > .lh-art')
    const delays = [120, 120, 220, 320, 400, 480]
    panels.forEach((panel, index) => {
      animations.push(panel.animate(local ? localEntrance : entrance, {
        duration: local ? 260 : 480,
        delay: local ? 0 : (delays[index] ?? 480 + (index - 5) * 80),
        easing: local ? easing : 'linear', fill: 'both',
      }))
    })
    const content = root.current.querySelector<HTMLElement>('.lh-content')
    if (content) animations.push(content.animate(local ? localEntrance : entrance, {
      duration: local ? 260 : 480, delay: local ? 0 : 220,
      easing: local ? easing : 'linear', fill: 'both',
    }))
    // First actual information-panel reveal only; the portrait itself has no animation.
    const cancelSound = !local && animations[0] ? soundAtAnimation(animations[0], 'ui.paper') : undefined

    // The panel finishes at 700 ms; leave a 100 ms visual pause before the bars fill.
    root.current.querySelectorAll<SVGRectElement>('.lh-stat-cover').forEach((cover, index) => {
      animations.push(cover.animate([
        { transform: 'scaleX(1)' }, { transform: 'scaleX(0)' },
      ], { duration: 600, delay: (local ? 360 : 800) + index * 50, easing, fill: 'both' }))
    })
    return () => { cancelSound?.(); animations.forEach(animation => animation.cancel()) }
  }, [tab, reduced])

  return root
}
