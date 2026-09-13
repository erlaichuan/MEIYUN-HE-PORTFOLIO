import { getUISoundAudioContext, sceneAudioSnapshot, subscribeSceneAudio } from '../../../scene/sceneAudio'

type Material = 'button' | 'paper' | 'wood' | 'ink' | 'brush' | 'seal' | 'reward' | 'scroll'
const cue = (file: string, material: Material, duration: number, volume = .32, debounce = 100) => ({ file, material, duration, volume, debounce })
export const UI_SOUNDS = {
  'ui.click': cue('ui-click-soft', 'button', .038, .28),
  'ui.enter': cue('game-enter', 'button', .038, .35, 300),
  'ui.map': cue('map-repair', 'button', .038, .32, 150),
  'ui.paper': cue('paper-touch', 'paper', .13, .27),
  'ui.paperOpen': cue('paper-open', 'paper', .3, .28, 400),
  'ui.paperClose': cue('paper-close', 'paper', .22, .25, 280),
  'ui.scrollOpen': cue('scroll-open', 'scroll', .5, .3, 650),
  'ui.scrollClose': cue('scroll-close', 'scroll', .32, .27, 420),
  'ui.wood': cue('wood-tap', 'wood', .12, .27),
  'ui.tag': cue('hanging-tag', 'wood', .16, .27, 150),
  'ui.card': cue('card-select', 'paper', .17, .28),
  'ui.seal': cue('seal-stamp', 'seal', .18, .4, 300),
  'ui.brush': cue('brush-touch', 'brush', .15, .25, 150),
  'ui.ink': cue('ink-soft', 'ink', .11, .25),
  'ui.reward': cue('reward-light', 'reward', .4, .4, 550),
  'ui.rewardClaim': cue('reward-claim', 'reward', .5, .4, 700),
  'ui.back': cue('back-soft', 'paper', .12, .25),
  'ui.close': cue('close-soft', 'wood', .1, .25),
  'ui.tab': cue('tab-switch', 'wood', .15, .27, 150),
  'ui.repair': cue('repair-node', 'wood', .1, .25, 250),
  'ui.repairStart': cue('repair-start', 'seal', .21, .4, 300),
  'ui.repairComplete': cue('repair-complete', 'seal', .24, .42, 350),
} as const
export type UISound = keyof typeof UI_SOUNDS
const PLAYBACK_SOUNDS = ['ui.click', 'ui.enter', 'ui.rewardClaim', 'ui.map'] as const
type PlaybackSound = typeof PLAYBACK_SOUNDS[number]
function playbackSound(type: UISound): PlaybackSound {
  if (type === 'ui.enter') return 'ui.enter'
  if (type === 'ui.reward' || type === 'ui.rewardClaim') return 'ui.rewardClaim'
  if (['ui.map', 'ui.repair', 'ui.repairStart', 'ui.repairComplete', 'ui.ink', 'ui.brush'].includes(type)) return 'ui.map'
  return 'ui.click'
}

function preference(key: string, fallback: number) {
  try {
    const value = localStorage.getItem(key)
    if (value === null) return fallback
    if (key === 'soundEnabled') return value === 'false' ? 0 : 1
    const number = Number(value)
    return Number.isFinite(number) ? Math.max(0, Math.min(1, number)) : fallback
  } catch { return fallback }
}
let settings = { enabled: !!preference('soundEnabled', 1), volume: preference('soundVolume', 1) }
const listeners = new Set<() => void>()
export const subscribeUISound = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } }
export const uiSoundSnapshot = () => settings
const allowed = () => settings.enabled && settings.volume > 0 && !(sceneAudioSnapshot() & 1) && !document.hidden
const buffers = new Map<UISound, AudioBuffer>()
const encoded = new Map<PlaybackSound, ArrayBuffer>()
const recorded = new Set<PlaybackSound>()
const lastPlayed = new Map<string, number>()
const voices = new Set<{ type: UISound; group: string; stop: () => void }>()
let ctx: AudioContext | undefined
let bus: GainNode | undefined
let assets: Record<string, string> = {}
let preloadTask: Promise<void> | undefined
let generation = 0
let recordingsTask: Promise<void> | undefined

export function stopUISounds() {
  generation++
  voices.forEach(voice => voice.stop())
}
export function setUISoundSettings(next: Partial<typeof settings>) {
  settings = { ...settings, ...next, volume: Math.max(0, Math.min(1, next.volume ?? settings.volume)) }
  if (!allowed()) stopUISounds()
  if (ctx && bus) bus.gain.setTargetAtTime(settings.volume, ctx.currentTime, .015)
  try {
    localStorage.setItem('soundEnabled', String(settings.enabled))
    localStorage.setItem('soundVolume', String(settings.volume))
  } catch { /* Sound settings remain usable in private browsing. */ }
  listeners.forEach(listener => listener())
}

/** Precompute quiet, non-electronic paper friction and damped material resonances.
 * These are deliberately provisional assets, not impersonations of recorded Foley. */
function fallback(context: AudioContext, type: UISound) {
  const { material, duration } = UI_SOUNDS[type]
  const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate)
  const samples = buffer.getChannelData(0)
  if (material === 'button') {
    // A single dry button contact, not a shortened paper-rustle sample.
    // Inharmonic shell transients decay within milliseconds, with no noise bed,
    // sustained musical pitch, release double-click, or reverb tail.
    let peak = 0
    for (let i = 0; i < samples.length; i++) {
      const t = i / context.sampleRate
      const attack = Math.min(1, t / .0006)
      const fade = Math.min(1, (duration - t) / .005)
      samples[i] = attack * fade * (
        .62 * Math.sin(2 * Math.PI * 790 * t) * Math.exp(-360 * t) +
        .27 * Math.sin(2 * Math.PI * 1770 * t) * Math.exp(-650 * t) +
        .11 * Math.sin(2 * Math.PI * 2810 * t) * Math.exp(-950 * t)
      )
      peak = Math.max(peak, Math.abs(samples[i]))
    }
    if (peak) for (let i = 0; i < samples.length; i++) samples[i] *= .34 / peak
    return buffer
  }
  let low = 0, previous = 0, peak = 0
  for (let i = 0; i < samples.length; i++) {
    const t = i / context.sampleRate, p = t / duration
    const noise = Math.random() * 2 - 1
    low += .14 * (noise - low)
    const friction = (noise - previous) * .075 + low * .38
    previous = noise
    const edge = Math.min(1, t / .008) * Math.min(1, (duration - t) / .02)
    const rustle = Math.sin(Math.PI * p) ** .8 * (.65 + .35 * Math.sin(t * 89) ** 2)
    const wood = (.2 * Math.sin(t * 2 * Math.PI * 410) + .48 * Math.sin(t * 2 * Math.PI * 937) + .22 * Math.sin(t * 2 * Math.PI * 1627)) * Math.exp(-t * 48)
    let value = friction * rustle
    if (material === 'wood') value = wood * .5 + friction * Math.exp(-t * 65) * .35
    if (material === 'seal') value = wood * .35 + low * .6 * Math.exp(-t * 48) + friction * rustle * .3
    if (material === 'ink') value = low * Math.exp(-t * 45) * .3 + friction * rustle * .3
    if (material === 'brush') value = low * rustle + friction * rustle * .18
    if (material === 'scroll') value = friction * rustle * (.5 + .5 * Math.sin(t * 23) ** 2) + wood * .15
    if (material === 'reward') {
      // Quiet plucked-string partials, with a paper attack; no sustained oscillator/beep.
      value = friction * Math.exp(-t * 28) * .5
      for (const [frequency, gain] of [[659, .1], [1318, .13], [1983, .065]]) value += gain * Math.sin(t * 2 * Math.PI * frequency) * Math.exp(-t * 15)
    }
    samples[i] = value * edge
    peak = Math.max(peak, Math.abs(samples[i]))
  }
  const scale = peak > 0 ? .34 / peak : 1
  for (let i = 0; i < samples.length; i++) samples[i] *= scale
  return buffer
}

/** Only listed files are fetched: an empty manifest uses fallback without 404s. */
export function preloadUISounds() {
  return preloadTask ??= fetch(`${import.meta.env.BASE_URL}assets/audio/ui/manifest.json`)
    .then(response => response.ok ? response.json() : {})
    .then(value => { assets = value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string')) : {} })
    .then(() => Promise.all(PLAYBACK_SOUNDS.map(async type => {
      const file = assets[UI_SOUNDS[type].file]
      if (typeof file !== 'string' || !/^[a-z0-9-]+\.(wav|mp3|ogg)$/i.test(file)) return
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}assets/audio/ui/${file}`)
        if (response.ok) encoded.set(type, await response.arrayBuffer())
      } catch { /* This one file falls back without blocking the other recordings. */ }
    }))).then(() => {})
    .catch(() => { /* Offline preview uses the in-memory fallback. */ })
}
function loadRecordings(context: AudioContext) {
  return recordingsTask ??= preloadUISounds().then(() => Promise.all(PLAYBACK_SOUNDS.map(async type => {
    const bytes = encoded.get(type)
    if (!bytes) return
    try {
      const decoded = await context.decodeAudioData(bytes.slice(0))
      buffers.set(type, decoded)
      recorded.add(type)
    } catch { /* A missing/unsupported replacement never prevents a button working. */ }
  }))).then(() => {})
}
export function unlockUISounds() {
  try {
    if (!ctx) {
      ctx = getUISoundAudioContext()
      bus = ctx.createGain(); bus.gain.value = settings.volume
      const limiter = ctx.createDynamicsCompressor()
      limiter.threshold.value = -12; limiter.ratio.value = 8
      bus.connect(limiter); limiter.connect(ctx.destination)
      const clickFallback = fallback(ctx, 'ui.click')
      for (const type of PLAYBACK_SOUNDS) buffers.set(type, clickFallback)
      void loadRecordings(ctx)
    }
    if (ctx.state === 'suspended') void ctx.resume().catch(() => {})
  } catch { /* Audio unavailable: the Demo is still fully interactive. */ }
}

export function playUISound(type: UISound, options: { strength?: number; valid?: () => boolean; animation?: boolean } = {}) {
  if (!allowed() || options.valid?.() === false) return
  unlockUISounds()
  if (!ctx || !bus) return
  const soundType = playbackSound(type)
  const spec = UI_SOUNDS[soundType]
  const group = soundType
  // Long recorded chimes should not be layered again by the ensuing entrance.
  if (options.animation && (voices.size > 0 || nowSinceLastCue() < 300)) return
  const now = performance.now()
  if (now - (lastPlayed.get(group) ?? -Infinity) < spec.debounce) return
  lastPlayed.set(group, now)
  const version = generation, context = ctx, output = bus
  const start = () => {
    if (!allowed() || version !== generation || options.valid?.() === false || context.state !== 'running') return
    if (options.animation && voices.size > 0) return
    for (const voice of voices) if (voice.group === group) voice.stop()
    while (voices.size >= 4) voices.values().next().value?.stop()
    const source = context.createBufferSource(), gain = context.createGain()
    source.buffer = buffers.get(soundType)!
    gain.gain.value = spec.volume
    source.connect(gain); gain.connect(output)
    const voice = { type: soundType as UISound, group, stop: () => { source.stop(); source.disconnect(); gain.disconnect(); voices.delete(voice) } }
    voices.add(voice)
    source.onended = () => { source.disconnect(); gain.disconnect(); voices.delete(voice) }
    source.start()
    if (import.meta.env.DEV) window.dispatchEvent(new CustomEvent('fusheng:ui-sound', { detail: { type: soundType, requestedType: type, file: recorded.has(soundType) ? assets[spec.file] : 'fallback', volume: gain.gain.value, active: voices.size } }))
  }
  // Wait for decoding even on the first gesture: do not play the old synthesized
  // click while the user's requested recording is still loading.
  void Promise.all([loadRecordings(context), context.state === 'running' ? Promise.resolve() : context.resume()]).then(start, () => {})
}

function nowSinceLastCue() {
  return performance.now() - Math.max(-Infinity, ...lastPlayed.values())
}

/** Scope every delayed/animation cue to its owner; no late sounds after leaving. */
export function soundAtAnimation(animation: Animation, type: UISound, fraction = 0, strength = 1) {
  let frame = 0, cancelled = false
  const version = generation
  const tick = () => {
    if (cancelled || version !== generation || animation.playState === 'idle') return
    const { delay, duration } = animation.effect!.getComputedTiming()
    const target = (delay ?? 0) + Number(duration) * fraction
    if (typeof animation.currentTime === 'number' && animation.currentTime >= target) {
      playUISound(type, { strength, animation: true }); return
    }
    frame = requestAnimationFrame(tick)
  }
  frame = requestAnimationFrame(tick)
  return () => { cancelled = true; cancelAnimationFrame(frame) }
}
const unsubscribe = subscribeSceneAudio(() => { if (!allowed()) stopUISounds() })
if (import.meta.hot) import.meta.hot.dispose(() => { stopUISounds(); unsubscribe(); bus?.disconnect() })
