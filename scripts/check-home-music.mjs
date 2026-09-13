import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const origin = process.env.DEMO_TEST_URL || 'http://localhost:5178/'
for (const allowed of [true, false]) {
  const browser = await chromium.launch({ args: [
    `--autoplay-policy=${allowed ? 'no-user-gesture-required' : 'document-user-activation-required'}`,
    '--disable-features=PreloadMediaEngagementData,MediaEngagementBypassAutoplayPolicies',
  ] })
  try {
    const page = await browser.newPage()
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.addInitScript(({ allowed }) => {
      window.tracks = []
      const NativeAudio = window.Audio
      window.Audio = class extends NativeAudio {
        constructor(...args) { super(...args); window.tracks.push(this) }
      }
      // Headless Chromium can exempt autoplay; explicitly exercise NotAllowedError recovery.
      if (!allowed) {
        let activated = false
        document.addEventListener('pointerdown', event => { if (event.isTrusted) activated = true }, { capture: true })
        const nativePlay = HTMLMediaElement.prototype.play
        HTMLMediaElement.prototype.play = function () {
          if (!activated) return Promise.reject(new DOMException('Autoplay blocked', 'NotAllowedError'))
          return nativePlay.call(this)
        }
      }
    }, { allowed })
    const source = await (await page.request.get(new URL('/src/components/SceneSoundControls.tsx', origin).href)).text()
    const audio = source.match(/from "([^"]*sceneAudio\.ts[^"]*)"/)[1]
    const store = source.match(/from "([^"]*\/store\.ts[^"]*)"/)[1]
    const react = source.match(/from "([^"]*\/react\.js[^"]*)"/)[1]
    const main = await (await page.request.get(new URL('/src/main.tsx', origin).href)).text()
    const dom = main.match(/from "([^"]*react-dom_client\.js[^"]*)"/)[1]
    await page.route('**/src/main.tsx*', route => route.fulfill({ contentType: 'application/javascript', body: `
      import React from ${JSON.stringify(react)};
      import ReactDOM from ${JSON.stringify(dom)};
      import Controls, {SceneMusicPlayback} from '/src/components/SceneSoundControls.tsx';
      import * as audio from ${JSON.stringify(audio)};
      import {useStore} from ${JSON.stringify(store)};
      import {FUSHENG_MUSIC} from '/src/scene/backgroundMusic.ts';
      window.audio=audio; window.store=useStore;
      const h=React.createElement;
      ReactDOM.createRoot(document.getElementById('root')).render(h(React.StrictMode,null,
        h(SceneMusicPlayback),h(Controls),h('button',{id:'ordinary'},'普通首页按钮'),
        h('button',{id:'project',onClick:()=>{window.release=audio.holdSceneMusicForProject(FUSHENG_MUSIC,{cloudScrollOpening:true})}},'项目')
      ));
      setTimeout(()=>useStore.getState().setPhase('scene'),100);
    ` }))
    await page.goto(origin)
    await page.waitForFunction(() => window.audio && window.tracks.length > 0)
    if (!allowed) {
      await page.waitForFunction(() => window.audio.sceneAudioSnapshot() & 4)
      assert.equal(await page.evaluate(() => window.tracks[0].paused), true)
      await page.locator('#ordinary').click()
    }
    await page.waitForFunction(() => (window.audio.sceneAudioSnapshot() & 2) && window.tracks[0].currentTime > .1)
    assert.equal(await page.getByText('点击开启背景音乐').count(), 0)
    assert.equal(await page.evaluate(() => window.tracks.length), 1)
    assert.equal(await page.evaluate(() => window.tracks[0].volume), .12)
    await page.getByRole('button', {name:'静音所有声音',exact:true}).click()
    assert.equal(await page.evaluate(() => window.tracks[0].paused), true)
    await page.evaluate(() => { window.store.setState({overlay:'work'}); window.store.setState({overlay:null}) })
    await page.waitForTimeout(100)
    assert.equal(await page.evaluate(() => window.tracks[0].paused), true, 'Returning home must respect mute')
    await page.getByRole('button', {name:'开启声音',exact:true}).click()
    await page.waitForFunction(() => window.audio.sceneAudioSnapshot() & 2)
    await page.evaluate(() => window.audio.setSceneMusicProximity(1))
    await page.waitForTimeout(250)
    assert.equal(await page.evaluate(() => window.tracks[0].volume), .75)
    await page.locator('#project').click()
    assert.equal(await page.evaluate(() => window.tracks[0].paused), true, 'Opening cue precedes project music')
    await page.waitForFunction(() => window.audio.sceneAudioSnapshot() & 2)
    assert.match(await page.evaluate(() => window.tracks[0].src), /fusheng-bamboo-flute/)
    await page.evaluate(() => window.release())
    await page.waitForFunction(() => window.audio.sceneAudioSnapshot() & 2)
    assert.match(await page.evaluate(() => window.tracks[0].src), /coffee-and-herbs/)
    assert.deepEqual(errors, [])
    console.log(JSON.stringify({policy:allowed?'autoplay allowed: starts without input':'simulated autoplay rejection: resumes on ordinary interaction', errors}))
  } finally { await browser.close() }
}
