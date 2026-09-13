import { currentPose, flyTo, focusPoseFor, releaseCamera } from './cameraDirector'
import { restPose } from './cameraPath'
import { releaseZoom } from './userZoom'

const DETAIL_FOCUS_MS = 760
const DETAIL_FILL = 0.64

let active: string | null = null
let musicRange: { anchor: readonly [number, number, number]; far: number; near: number } | null = null
const listeners = new Set<() => void>()

function notify() {
  for (const listener of listeners) listener()
}

export function subscribeDetailFocus(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function detailFocusActive(): boolean {
  return active !== null
}

/** Match loudness to the actual MP3 approach, not a second independent camera timer. */
export function detailMusicProximity(position: readonly [number, number, number]): number {
  if (active !== 'mp3-player' || !musicRange) return 0
  const distance = Math.hypot(...position.map((value, i) => value - musicRange!.anchor[i]))
  return Math.min(1, Math.max(0, (musicRange.far - distance) / Math.max(.001, musicRange.far - musicRange.near)))
}

export function focusDetail(
  id: string,
  anchor: readonly [number, number, number],
  worldHeight: number,
) {
  if (active === id) {
    resetDetailFocus()
    return
  }

  active = id
  notify()
  releaseZoom()
  const from = currentPose()
  const to = focusPoseFor(anchor, worldHeight, DETAIL_FILL, from)
  musicRange = id === 'mp3-player' ? {
    anchor: [...anchor],
    far: Math.hypot(...from.pos.map((value, i) => value - anchor[i])),
    near: Math.hypot(...to.pos.map((value, i) => value - anchor[i])),
  } : null
  flyTo(from, to, DETAIL_FOCUS_MS)
}

/** 返回 true 代表本次确实关闭了一个物件近景。 */
export function resetDetailFocus(): boolean {
  if (!active) return false
  active = null
  musicRange = null
  notify()
  flyTo(currentPose(), restPose(), DETAIL_FOCUS_MS, releaseCamera)
  return true
}
