import { useEffect } from 'react'
import { useStore } from '../store'
import { playWebsiteSound, preloadWebsiteSound, prepareWebsiteSound, stopWebsiteSound } from '../scene/sceneAudio'

/** Only homepage buttons; project pages and the Demo own their existing audio. */
export default function WebsiteUISounds() {
  useEffect(() => {
    void preloadWebsiteSound().catch(() => {})
    let press: { x: number; y: number } | null = null
    const homeTarget = (event: Event) => {
      const state = useStore.getState()
      const target = event.target instanceof Element ? event.target : null
      if (state.phase !== 'scene' || state.overlay || document.querySelector('.ovh')) return null
      if (target?.closest('.fg-shell,[role="dialog"],[inert],[aria-disabled="true"]')) return null
      return target
    }
    const pointer = (event: PointerEvent) => {
      press = { x: event.clientX, y: event.clientY }
      if (homeTarget(event)) prepareWebsiteSound()
    }
    const click = (event: MouseEvent) => {
      const target = homeTarget(event)
      if (!target) return
      if (event.detail > 0 && press && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 8) return
      const button = target.closest('button,[role="button"]')
      if (!button || button.matches(':disabled,[aria-disabled="true"]')) return
      // Sound controls themselves stay silent, especially when muting.
      if (!button.closest('.scene-sound')) playWebsiteSound()
    }
    const visibility = () => { if (document.hidden) stopWebsiteSound() }
    document.addEventListener('pointerdown', pointer, { capture: true, passive: true })
    document.addEventListener('click', click, true)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      document.removeEventListener('pointerdown', pointer, true)
      document.removeEventListener('click', click, true)
      document.removeEventListener('visibilitychange', visibility)
      stopWebsiteSound()
    }
  }, [])
  return null
}
