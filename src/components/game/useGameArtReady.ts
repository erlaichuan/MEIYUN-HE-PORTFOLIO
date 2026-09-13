import { useEffect, useState } from 'react'
import { gameAssetsReady, prepareGameAssets } from './gameAssetWarmup'

/** Keep the entrance timeline at its first frame until the real artwork is decoded. */
export function useGameArtReady(paths: readonly string[]) {
  const [ready, setReady] = useState(() => gameAssetsReady(paths))
  useEffect(() => {
    const controller = new AbortController()
    let frame = 0
    const finish = () => {
      if (controller.signal.aborted) return
      frame = requestAnimationFrame(() => { if (!controller.signal.aborted) setReady(true) })
    }
    // Decode failures settle normally; the close button stays available while loading.
    // Do not start on a timer: a late image would otherwise skip its own entrance.
    void prepareGameAssets(paths, controller.signal).then(finish)
    return () => { controller.abort(); cancelAnimationFrame(frame) }
  }, [paths])
  return ready
}
