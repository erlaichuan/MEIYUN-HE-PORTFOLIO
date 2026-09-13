import { useSyncExternalStore } from 'react'
import { setUISoundSettings, subscribeUISound, uiSoundSnapshot } from './uiSoundManager'
import './uiSoundSettings.css'

export default function UISoundSettings() {
  const settings = useSyncExternalStore(subscribeUISound, uiSoundSnapshot, uiSoundSnapshot)
  return <fieldset className="fg-sfx-settings">
    <legend>声音设置</legend>
    <label>音效 <button type="button" aria-label="音效开关" aria-pressed={settings.enabled} onClick={() => setUISoundSettings({ enabled: !settings.enabled })}>{settings.enabled ? '开' : '关'}</button></label>
    <label htmlFor="fg-sfx-volume">音效音量 <output>{Math.round(settings.volume * 100)}%</output></label>
    <input id="fg-sfx-volume" type="range" min="0" max="100" value={Math.round(settings.volume * 100)} onChange={event => setUISoundSettings({ volume: Number(event.target.value) / 100 })}/>
  </fieldset>
}
