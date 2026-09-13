import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from 'gsap'
import SceneSoundControls from '../SceneSoundControls'
import './longDramaLightbox.css'

export type ArtworkPreview = { source: HTMLImageElement; rotate: boolean }

/** Match the visible bitmap, not the letterboxed <img> element. */
function sourceBounds(source: HTMLImageElement) {
  const rect = source.getBoundingClientRect()
  const scale = Math.min(rect.width / source.naturalWidth, rect.height / source.naturalHeight)
  const width = source.naturalWidth * scale
  const height = source.naturalHeight * scale
  return { x: rect.left + (rect.width - width) / 2, y: rect.top + (rect.height - height) / 2, width, height }
}

export default function LongDramaLightbox({ selection, onClose }: {
  selection: ArtworkPreview; onClose: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const image = useRef<HTMLImageElement>(null)
  const backdrop = useRef<HTMLDivElement>(null)
  const closeAction = useRef<() => void>(() => {})
  const [failed, setFailed] = useState(false)

  useLayoutEffect(() => {
    const modal = dialog.current!
    const poster = image.current!
    const shade = backdrop.current!
    const source = selection.source
    const previousFocus = document.activeElement
    const originalVisibility = source.style.visibility
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const spin = selection.rotate && !reduced
    let animation: gsap.core.Timeline | null = null
    let started = false
    let closing = false

    const fit = () => {
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const scale = Math.min((viewportWidth - 32) / source.naturalWidth, (viewportHeight - 116) / source.naturalHeight)
      const width = source.naturalWidth * scale
      const height = source.naturalHeight * scale
      return { x: (viewportWidth - width) / 2, y: 76 + (viewportHeight - 116 - height) / 2, width, height }
    }
    const restore = () => {
      gsap.set(source, originalVisibility ? { visibility: originalVisibility } : { clearProps: 'visibility' })
    }
    const finish = () => {
      restore()
      modal.close()
      if (source.isConnected) source.focus({ preventScroll: true })
      else if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true })
      onClose()
    }
    const start = () => {
      if (started || closing) return
      started = true
      modal.dataset.phase = 'opening'
      const destination = fit()
      gsap.set(source, { visibility: 'hidden' })
      animation = gsap.timeline({ onComplete: () => { modal.dataset.phase = 'open' } })
        .fromTo(shade, { opacity: 0 }, { opacity: 1, duration: reduced ? 0 : .25 }, 0)
      if (spin) {
        animation.fromTo(poster, { ...sourceBounds(source), rotation: 0, rotationY: 0, transformPerspective: 1600, opacity: 1 }, {
          ...destination, rotationY: 360, duration: .85, ease: 'power3.inOut',
        }, 0)
      } else {
        // GIFs and moving strips use a simple reveal without rotation or travel.
        animation.fromTo(poster, { ...destination, rotation: 0, rotationY: 0, opacity: 0 }, {
          opacity: 1, duration: reduced ? 0 : .2,
        }, 0)
      }
    }
    closeAction.current = () => {
      if (closing) return
      closing = true
      modal.dataset.phase = 'closing'
      animation?.kill()
      if (!started) { finish(); return }
      animation = gsap.timeline({ onComplete: finish })
      if (spin && source.isConnected) {
        animation.to(poster, { ...sourceBounds(source), rotationY: 0, duration: .75, ease: 'power3.inOut' }, 0)
          .to(shade, { opacity: 0, duration: .35 }, .4)
      } else {
        animation.to([poster, shade], { opacity: 0, duration: reduced ? 0 : .18 }, 0)
      }
    }
    const resize = () => {
      if (!started || closing) return
      animation?.progress(1)
      gsap.set(poster, fit())
    }
    modal.dataset.spin = String(spin)
    modal.showModal()
    if (poster.complete && poster.naturalWidth) start()
    else poster.addEventListener('load', start, { once: true })
    window.addEventListener('resize', resize)
    return () => {
      animation?.kill()
      poster.removeEventListener('load', start)
      window.removeEventListener('resize', resize)
      restore()
      if (modal.open) modal.close()
    }
  }, [selection, onClose])

  const close = () => closeAction.current()
  return createPortal(
    <dialog ref={dialog} className="ld-lightbox" aria-label={`放大查看：${selection.source.alt}`}
      onCancel={(event) => { event.preventDefault(); close() }}
      onKeyDown={(event) => { event.stopPropagation() }} onWheel={(event) => event.stopPropagation()}
      onClick={(event) => { if (event.target === event.currentTarget) close() }}>
      <div ref={backdrop} className="ld-lightbox__backdrop" onClick={close} aria-hidden="true" />
      <img ref={image} className="ld-lightbox__image" src={selection.source.currentSrc || selection.source.src}
        alt={selection.source.alt} draggable={false} onClick={close} onError={() => setFailed(true)}
        role="button" tabIndex={0} aria-label="收起图片"
        onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); close() } }} />
      {failed && <p className="ld-lightbox__error" role="status">图片未能载入，请关闭后重试。</p>}
      <button className="ld-lightbox__close" type="button" autoFocus onClick={close}>收起图片 <span aria-hidden="true">×</span></button>
      <p className="ld-lightbox__hint">点击图片、空白处或按 Esc 收起</p>
      <SceneSoundControls inOverlay />
    </dialog>, document.body,
  )
}
