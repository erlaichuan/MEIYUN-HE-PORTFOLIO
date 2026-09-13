import { ART } from './gameData'

const numbered = (folder: string, count: number) => Array.from({ length: count }, (_, i) => `${folder}/${i + 1}.png`)
export const gameAssets = {
  entry: ['start/background.jpg', 'start/title.png', 'start/enter.png'],
  choose: ['landscape.webp', 'paper.webp', 'selection/moxiu.jpg', 'selection/mowan.jpg'],
  home: ['home-controls/background.jpg', ...['01', '02', '03', '04', '05'].map(id => `home-tabs/${id}.png`),
    ...['rengwu', 'shangcheng', 'beibao', 'chengjiu', 'tujian', 'juese', 'daoju', 'meirihuodongtishi', 'shejiao', 'fuli', 'qiandao', 'renwu-gantanhao'].map(id => `home-controls/${id}.png`)],
  atlas: ['atlas-controls/background.jpg', 'atlas-controls/title.png', ...numbered('atlas-controls', 4), ...numbered('atlas', 5)],
  cards: ['character-cards/background.png', ...numbered('character-cards', 7), 'ui-22.webp', 'atlas-controls/4.png'],
  checkin: ['checkin/quan.png', ...numbered('checkin', 7)],
  map: ['ui-18.webp', ...[5, 6, 7, 8, 9].map(id => `map-controls/${id}.png`)],
  repair: ['landscape.webp', 'ui/paper.png'],
  items: ['ui-5.jpg', 'ui/close.png'],
} satisfies Record<string, string[]>

// Keep only a bounded working set of decoded images, not the entire art library.
const decoded = new Map<string, { image: HTMLImageElement; bytes: number }>()
const inFlight = new Map<string, Promise<void>>()
const budget = 48 * 1024 * 1024
let retainedBytes = 0

async function decode(path: string, priority: 'low' | 'auto' = 'low') {
  const hit = decoded.get(path)
  if (hit) { decoded.delete(path); decoded.set(path, hit); return }
  if (inFlight.has(path)) return inFlight.get(path)
  const image = new Image()
  image.decoding = 'async'
  image.fetchPriority = priority
  image.src = ART + path
  const task = image.decode().then(() => {
    const bytes = image.naturalWidth * image.naturalHeight * 4
    if (bytes > budget) return
    while (retainedBytes + bytes > budget || decoded.size >= 48) {
      const oldest = decoded.entries().next().value
      if (!oldest) break
      decoded.delete(oldest[0]); retainedBytes -= oldest[1].bytes
    }
    decoded.set(path, { image, bytes }); retainedBytes += bytes
  }).catch(() => {
    // Optional warming must never block navigation; normal <img> loading retries.
  }).finally(() => { inFlight.delete(path) })
  inFlight.set(path, task)
  return task
}

export const gameAssetsReady = (paths: readonly string[]) => paths.every(path => decoded.has(path))

/** Visible artwork is not optional prefetch: decode even with data-saving enabled. */
export async function prepareGameAssets(paths: readonly string[], signal: AbortSignal) {
  const pending = [...new Set(paths)]
  const worker = async () => {
    while (pending.length && !signal.aborted) await decode(pending.shift()!, 'auto')
  }
  await Promise.all([worker(), worker()])
}

/** Two low-priority decodes at a time, cancellable between files. No loading gate. */
export function warmGameAssets(paths: readonly string[], signal: AbortSignal) {
  if (signal.aborted || document.hidden) return Promise.resolve()
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  if (connection?.saveData) return Promise.resolve()
  const pending = [...new Set(paths)]
  const worker = async () => {
    while (pending.length && !signal.aborted && !document.hidden) {
      await decode(pending.shift()!)
    }
  }
  return Promise.all([worker(), worker()]).then(() => undefined)
}

/** Let the current entrance animation finish before preparing its likely exits. */
export function scheduleGameAssets(paths: readonly string[], delay = 1100) {
  const controller = new AbortController()
  const timer = window.setTimeout(() => { void warmGameAssets(paths, controller.signal) }, delay)
  return () => { clearTimeout(timer); controller.abort() }
}
