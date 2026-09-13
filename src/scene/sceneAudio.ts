import { BACKGROUND_MUSIC } from './backgroundMusic'
import { playCloudScrollSound } from './cloudScrollSound'

/** Shared website click recording, with independently controlled background music. */
export type SceneSound = 'drawer' | 'mouse' | 'paper' | 'box' | 'frame'
let context: AudioContext | null = null
let master: GainNode | null = null
let music: HTMLAudioElement | null = null
let volumeFrame = 0
let musicEnabled = false
let userPaused = false
type MusicTrack = typeof BACKGROUND_MUSIC
let currentTrack: MusicTrack = BACKGROUND_MUSIC
const projectTracks = new Map<symbol, MusicTrack>()
let projectOpening: { owner: symbol; cancel: (() => void) | null } | null = null
const trackPositions = new Map<string, number>()
const demoHolds = new Set<symbol>()
let blocked = false
let failed = false
let playing = false
let proximity = 0
let playAttempt = 0
let muted = false
const listeners = new Set<() => void>()
const notify = () => listeners.forEach(listener => listener())
export const subscribeSceneAudio = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } }
export const sceneAudioSnapshot = () => (muted ? 1 : 0) | (playing ? 2 : 0) | (blocked ? 4 : 0) | (BACKGROUND_MUSIC.src ? 8 : 0) | (failed ? 16 : 0) | (demoHolds.size ? 32 : 0) | (userPaused ? 64 : 0)

function audio() {
  if (!context) {
    context = new AudioContext()
    master = context.createGain(); master.gain.value = muted ? 0 : .38
    const limiter = context.createDynamicsCompressor()
    master.connect(limiter); limiter.connect(context.destination)
  }
  if (context.state === 'suspended') void context.resume().catch(() => {})
  return context
}

/** UI effects share the existing context, but keep their own gain and preferences. */
export const getUISoundAudioContext = () => audio()

const WEBSITE_CLICK = '/assets/audio/ui/mixkit-interface-device-click-2577.wav'
let clickBytes: Promise<ArrayBuffer> | null = null
let clickBuffer: Promise<AudioBuffer> | null = null
let clickVoice: { source: AudioBufferSourceNode; gain: GainNode } | null = null
let clickRequest = 0
let lastClick = -Infinity

export function preloadWebsiteSound() {
  return clickBytes ??= fetch(WEBSITE_CLICK).then(response => {
    if (!response.ok) throw new Error('Website click recording unavailable')
    return response.arrayBuffer()
  }).catch(error => { clickBytes = null; throw error })
}

export function prepareWebsiteSound() {
  if (muted || document.hidden) return
  try {
    const ctx = audio()
    clickBuffer ??= preloadWebsiteSound().then(bytes => ctx.decodeAudioData(bytes.slice(0)))
    void clickBuffer.catch(() => { clickBuffer = null })
  } catch { /* Audio support is optional. */ }
}

export function stopWebsiteSound() {
  clickRequest += 1
  if (!clickVoice || !context) return
  const { source, gain } = clickVoice
  gain.gain.setTargetAtTime(0, context.currentTime, .005)
  try { source.stop(context.currentTime + .025) } catch { /* Already ended. */ }
  clickVoice = null
}

export function playWebsiteSound(kind: 'click' | SceneSound = 'click') {
  const requestedAt = performance.now()
  if (muted || document.hidden || requestedAt - lastClick < 120) return
  lastClick = requestedAt
  const request = ++clickRequest
  prepareWebsiteSound()
  void clickBuffer?.then(buffer => {
    // No delayed burst after decoding, muted interactions or a hidden tab.
    if (request !== clickRequest || muted || document.hidden || performance.now() - requestedAt > 400 || context?.state !== 'running') return
    stopWebsiteSound()
    const ctx = context, source = ctx.createBufferSource(), gain = ctx.createGain()
    source.buffer = buffer
    gain.gain.value = .65
    source.connect(gain); gain.connect(master!)
    const voice = { source, gain }
    clickVoice = voice
    source.onended = () => { source.disconnect(); gain.disconnect(); if (clickVoice === voice) clickVoice = null }
    source.start()
    if (import.meta.env.DEV) document.dispatchEvent(new CustomEvent('website:ui-sound', { detail: { kind, file: WEBSITE_CLICK } }))
  }).catch(() => { /* Navigation never waits for audio. */ })
}

export function playSceneSound(sound: SceneSound) {
  playWebsiteSound(sound)
}

const wantsMusic = () => musicEnabled && !userPaused && !demoHolds.size && !muted && !!BACKGROUND_MUSIC.src
// A quieter room bed and a stronger MP3 close-up, smoothly following camera distance.
const musicVolume = () => muted ? 0 : currentTrack.src === BACKGROUND_MUSIC.src ? .12 + .63 * proximity : .12

function updateMusicVolume(smooth = false) {
  cancelAnimationFrame(volumeFrame)
  if (!music) return
  const track = music, target = musicVolume(), start = track.volume, time = performance.now()
  if (!smooth) { track.volume = target; return }
  const step = () => {
    const progress = Math.min(1, (performance.now() - time) / 180)
    track.volume = start + (target - start) * progress
    if (progress < 1) volumeFrame = requestAnimationFrame(step)
  }
  volumeFrame = requestAnimationFrame(step)
}

/** Camera updates a scalar only; sound effects keep their own gain and never get louder. */
export function setSceneMusicProximity(value: number) {
  const next = Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0))
  if (Math.abs(next - proximity) < .001) return
  proximity = next
  updateMusicVolume(true)
}

function ensureMusic() {
  if (!music) {
    music = new Audio()
    music.crossOrigin = 'anonymous'
    music.loop = true
    music.preload = 'auto'
    music.volume = musicVolume()
    music.src = currentTrack.src
    music.addEventListener('pause', () => { playing = false; notify() })
    music.addEventListener('error', () => { failed = true; playing = false; blocked = false; notify() })
    music.addEventListener('loadedmetadata', () => {
      const position = trackPositions.get(currentTrack.src) ?? 0
      if (music && Number.isFinite(music.duration) && position < music.duration) music.currentTime = position
    })
    music.addEventListener('playing', () => {
      playing = !!music && !music.paused && wantsMusic()
      if (playing) blocked = false
      notify()
    })
  }
  return music
}

function pauseMusic() {
  playAttempt += 1
  music?.pause()
  playing = false
  blocked = false
  notify()
}

async function syncMusic() {
  if (!wantsMusic()) {
    if (muted || userPaused) cancelProjectOpening()
    pauseMusic(); return
  }
  if (projectOpening) {
    pauseMusic()
    const opening = projectOpening
    try {
      const ctx = audio()
      if (ctx.state !== 'running') {
        blocked = true; notify()
        void ctx.resume().then(() => {
          if (ctx.state === 'running' && projectOpening === opening && wantsMusic()) void syncMusic()
        }).catch(() => {})
        return
      }
      if (!opening.cancel) opening.cancel = playCloudScrollSound(ctx, master!, () => {
        if (projectOpening !== opening) return
        projectOpening = null
        void syncMusic()
      })
      return
    } catch {
      // An unavailable sound effect must never block the actual music or navigation.
      cancelProjectOpening()
    }
  }
  const attempt = ++playAttempt
  try {
    // Music plays natively: a suspended UI-effects AudioContext must not silence it.
    const track = ensureMusic()
    await track.play()
    if (attempt !== playAttempt) return
    if (!wantsMusic()) { pauseMusic(); return }
    failed = false
    playing = !track.paused
    blocked = false
    notify()
  } catch (error) {
    if (attempt !== playAttempt) return
    playing = false
    blocked = error instanceof DOMException && error.name === 'NotAllowedError'
    failed = !blocked && !(error instanceof DOMException && error.name === 'AbortError')
    notify()
  }
}

export function setSceneMusicEnabled(active: boolean) {
  if (musicEnabled === active) return
  musicEnabled = active
  void syncMusic()
}

function updateMusicTrack() {
  const next = [...projectTracks.values()].at(-1) ?? BACKGROUND_MUSIC
  if (next.src === currentTrack.src) { void syncMusic(); return }
  // Rapid navigation (including Strict Mode remounts) must not overwrite a saved position
  // with the temporary zero time of a source that has not loaded yet.
  if (music && music.readyState >= HTMLMediaElement.HAVE_METADATA && Number.isFinite(music.currentTime)) {
    trackPositions.set(currentTrack.src, music.currentTime)
  }
  pauseMusic()
  currentTrack = next
  failed = false
  if (music) music.src = next.src
  updateMusicVolume()
  void syncMusic()
}

/** One shared player prevents overlapping songs and restores the previous track on exit. */
function cancelProjectOpening() {
  projectOpening?.cancel?.()
  projectOpening = null
}

export function holdSceneMusicForProject(track: MusicTrack, options?: { cloudScrollOpening?: boolean }) {
  const token = Symbol('project-music')
  cancelProjectOpening()
  projectTracks.set(token, track)
  if (options?.cloudScrollOpening && !muted) projectOpening = { owner: token, cancel: null }
  userPaused = false
  updateMusicTrack()
  return () => {
    if (!projectTracks.delete(token)) return
    if (projectOpening?.owner === token) cancelProjectOpening()
    updateMusicTrack()
  }
}
/** Each mounted Demo owner releases its hold on exit, including interrupted lazy loads. */
export function holdSceneMusicForDemo() {
  const token = Symbol('game-demo')
  demoHolds.add(token)
  pauseMusic()
  return () => {
    if (!demoHolds.delete(token)) return
    void syncMusic()
  }
}
export function pauseSceneMusic() {
  userPaused = true
  cancelProjectOpening()
  pauseMusic()
}
export function playSceneMusic() {
  userPaused = false
  if (failed) { failed = false; music?.load() }
  void syncMusic()
  notify()
}
export function toggleSceneMute() {
  muted=!muted
  if (muted) stopWebsiteSound()
  if(context&&master)master.gain.setTargetAtTime(muted?0:.38,context.currentTime,.03)
  updateMusicVolume()
  void syncMusic();notify()
}
const onPageShow = () => { void syncMusic() }
const onGesture = (event: Event) => {
  // Sound buttons apply their own intent; autoplay retry must not race their click handler.
  if (event.target instanceof Element && event.target.closest('.scene-sound')) return
  if (wantsMusic() && !playing && !failed) void syncMusic()
}
const onKeyGesture = (event: KeyboardEvent) => {
  if (!event.repeat && !['Shift', 'Control', 'Alt', 'Meta', 'Escape'].includes(event.key)) onGesture(event)
}
const onPageHide = () => { stopWebsiteSound();pauseMusic();void context?.suspend().catch(()=>{}) }
if(typeof document!=='undefined') {
  document.addEventListener('pointerdown',onGesture,{capture:true})
  document.addEventListener('click',onGesture,{capture:true})
  document.addEventListener('keydown',onKeyGesture,{capture:true})
  window.addEventListener('pagehide',onPageHide)
  window.addEventListener('pageshow',onPageShow)
}
if(import.meta.hot)import.meta.hot.dispose(()=>{
  document.removeEventListener('pointerdown',onGesture,{capture:true})
  document.removeEventListener('click',onGesture,{capture:true})
  document.removeEventListener('keydown',onKeyGesture,{capture:true})
  window.removeEventListener('pagehide',onPageHide)
  window.removeEventListener('pageshow',onPageShow)
  cancelAnimationFrame(volumeFrame)
  stopWebsiteSound();cancelProjectOpening();pauseMusic();music?.removeAttribute('src');music?.load();void context?.close()
})
