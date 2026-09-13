import { useLayoutEffect, type RefObject } from 'react'
import { playUISound, preloadUISounds, soundAtAnimation, stopUISounds, unlockUISounds, type UISound } from './uiSoundManager'

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
export function playUIClose(paper = false, back = false) {
  playUISound(back ? 'ui.back' : 'ui.close', { strength: paper ? .5 : 1 })
  if (paper) playUISound('ui.paperClose')
}

/** One capture listener provides button defaults. Explicit data-ui-sound overrides
 * let components reserve success-only cues, without duplicating audio plumbing. */
export function useGameUISounds(root: RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const element = root.current
    if (!element) return
    void preloadUISounds()
    const cleanups = new Set<() => void>()
    const unlock = () => unlockUISounds()
    const click = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null
      const button = target?.closest<HTMLElement>('button,[role="button"]')
      if (!button || button.matches(':disabled,[aria-disabled="true"]') || button.closest('[inert],.scene-sound')) return
      const custom = button.dataset.uiSound
      if (custom === 'none') return
      if (custom) { playUISound(custom as UISound); return }
      const label = button.getAttribute('aria-label') || button.textContent || ''
      if (button.matches('.lh-tab,.fg-hanging-tab')) {
        // The selected tag sounds on transitionend, not on both click and impact.
        if (button.getAttribute('aria-pressed') === 'true' || reduced()) playUISound('ui.tag')
        return
      }
      if (button.matches('.fg-start-enter')) {
        playUISound('ui.enter'); return
      }
      if (button.matches('.fa-chapter') && label.startsWith('墨痕残卷')) { playUISound('ui.map'); return }
      if (button.matches('.fh-painted-atlas')) { playUISound('ui.seal', { strength: .55 }); return }
      if (button.matches('.fm-marker')) { playUISound('ui.repairStart'); return }
      if (button.matches('.fh-original-hanging')) { playUISound('ui.tag'); return }
      if (/关闭|^×/.test(label) && !/操作提示/.test(label)) {
        playUIClose(!!button.closest('.fg-paper,.fg-checkin-scroll,.fa-atlas')); return
      }
      if (/返回|结束体验/.test(label)) { playUIClose(!!button.closest('.fg-paper'), true); return }
      if (button.matches('.gc-card,.fa-chapter') || button.closest('.fg-choose-cards')) { playUISound('ui.card'); return }
      if (button.matches('.fa-control,.fh-painted-scroll') || button.closest('.fg-start-agreement')) { playUISound('ui.paper'); return }
      if (button.closest('.fg-tools')) { playUISound('ui.repair'); return }
      playUISound('ui.click')
    }
    const animationStart = (event: AnimationEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const cues: Record<string, UISound> = {
        'fg-panel-in': 'ui.scrollOpen', 'fh-unroll': 'ui.scrollOpen',
        'fa-enter': 'ui.paperOpen', 'fm-unroll': 'ui.map',
        'fc-open': 'ui.paperOpen', 'gc-enter': 'ui.paperOpen', 'fh-dialog': 'ui.paperOpen',
      }
      const sound = cues[event.animationName]
      if (sound) playUISound(sound, { valid: () => target.isConnected, animation: true })
      if (event.animationName === 'fm-marker-in' && target === element.querySelector('.fm-marker')) playUISound('ui.repair', { animation: true })
      if (event.animationName === 'fm-title-in') {
        const animation = target.getAnimations().find(a => a instanceof CSSAnimation && a.animationName === event.animationName)
        if (animation) cleanups.add(soundAtAnimation(animation, 'ui.map', .75, .6))
      }
    }
    const transitionEnd = (event: TransitionEvent) => {
      const target = event.target
      if (target instanceof Element && target.matches('.lh-tab.is-selected,.fg-hanging-tab.is-selected') && ['top', 'transform'].includes(event.propertyName)) playUISound('ui.tag')
    }
    const key = (event: KeyboardEvent) => {
      if (event.repeat) return
      unlock()
      // Atlas keyboard paging bypasses click. Tabs use their actual landing event.
      const target = event.target instanceof Element ? event.target : null
      if (target?.closest('.fa-atlas') && ['ArrowLeft','ArrowRight'].includes(event.key)) playUISound('ui.paper')
      if (reduced() && target?.matches('.lh-tab,.fg-hanging-tab') && ['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) playUISound('ui.tag')
    }
    const hidden = () => { if (document.hidden) stopUISounds() }
    element.addEventListener('pointerdown', unlock, true)
    element.addEventListener('keydown', key, true)
    element.addEventListener('click', click, true)
    element.addEventListener('animationstart', animationStart)
    element.addEventListener('transitionend', transitionEnd)
    document.addEventListener('visibilitychange', hidden)
    return () => {
      cleanups.forEach(cancel => cancel())
      stopUISounds()
      element.removeEventListener('pointerdown', unlock, true)
      element.removeEventListener('keydown', key, true)
      element.removeEventListener('click', click, true)
      element.removeEventListener('animationstart', animationStart)
      element.removeEventListener('transitionend', transitionEnd)
      document.removeEventListener('visibilitychange', hidden)
    }
  }, [root])
}
