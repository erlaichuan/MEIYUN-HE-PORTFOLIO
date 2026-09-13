import { useEffect, useSyncExternalStore } from 'react'
import { pauseSceneMusic, playSceneMusic, sceneAudioSnapshot, setSceneMusicEnabled, subscribeSceneAudio, toggleSceneMute } from '../scene/sceneAudio'
import { useStore } from '../store'

/** Lives above navigation and project views, so changing pages cannot pause the track. */
export function SceneMusicPlayback() {
  const phase = useStore(value => value.phase)
  const overlay = useStore(value => value.overlay)
  useEffect(() => { if (phase === 'scene') setSceneMusicEnabled(true) }, [phase])
  useEffect(() => { if (phase === 'scene' && !overlay) playSceneMusic() }, [phase, overlay])
  useEffect(() => () => setSceneMusicEnabled(false), [])
  return null
}

export default function SceneSoundControls({ inOverlay = false }: { inOverlay?: boolean }) {
  const state=useSyncExternalStore(subscribeSceneAudio,sceneAudioSnapshot,()=>0)
  const overlay=useStore(value=>value.overlay)
  if (overlay && !inOverlay) return null
  const canStart = !!(state&8) && !(state&1) && !(state&32)
  const offerPlay = !!(state&64) || !!(state&4) || !!(state&16)
  return <div className="scene-sound" role="group" aria-label="声音控制">
    <button type="button" onClick={toggleSceneMute} aria-pressed={!!(state&1)} aria-label={state&1?'开启声音':'静音所有声音'}>声音：{state&1?'关':'开'}</button>
    {inOverlay&&!!(state&8)&&<button type="button" onClick={offerPlay ? playSceneMusic : pauseSceneMusic}>
      {offerPlay ? state&16 ? '重试背景音乐' : '播放背景音乐' : '暂停背景音乐'}
    </button>}
    {!!(state&16)&&canStart&&<span role="status">背景音乐暂不可用</span>}
  </div>
}
