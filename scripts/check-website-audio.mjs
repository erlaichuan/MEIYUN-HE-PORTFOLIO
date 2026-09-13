import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const browser = await chromium.launch()
try {
  const page = await browser.newPage()
  const errors = []
  let wavRequests = 0
  page.on('pageerror', error => errors.push(error.message))
  page.on('request', request => { if (request.url().endsWith('mixkit-interface-device-click-2577.wav')) wavRequests++ })
  const origin = process.env.DEMO_TEST_URL || 'http://localhost:5178/'
  const source = await (await page.request.get(new URL('/src/components/WebsiteUISounds.tsx', origin).href)).text()
  const audioModule = source.match(/from "([^"]*sceneAudio\.ts[^"]*)"/)[1]
  const storeModule = source.match(/from "([^"]*\/store\.ts[^"]*)"/)[1]
  const reactModule = source.match(/from "([^"]*\/react\.js[^"]*)"/)[1]
  const main = await (await page.request.get(new URL('/src/main.tsx', origin).href)).text()
  const domModule = main.match(/from "([^"]*react-dom_client\.js[^"]*)"/)[1]
  await page.route('**/src/main.tsx*', route => route.fulfill({ contentType: 'application/javascript', body: `
    import React from ${JSON.stringify(reactModule)};
    import ReactDOM from ${JSON.stringify(domModule)};
    import WebsiteUISounds from '/src/components/WebsiteUISounds.tsx';
    import * as audio from ${JSON.stringify(audioModule)};
    import {useStore} from ${JSON.stringify(storeModule)};
    useStore.getState().setPhase('scene'); window.store=useStore;
    const h=React.createElement;
    window.events=[]; document.addEventListener('website:ui-sound',e=>window.events.push(e.detail));
    window.audio=audio;
    ReactDOM.createRoot(document.getElementById('root')).render(h(React.StrictMode,null,
      h(WebsiteUISounds),
      h('button',{id:'ordinary'},'普通按钮'),
      h('button',{id:'hotspot',onClick:()=>audio.playSceneSound('drawer')},'首页热点'),
      h('button',{id:'disabled',disabled:true},'禁用按钮'),
      h('div',{className:'scene-sound'},h('button',{id:'mute',onClick:audio.toggleSceneMute},'声音开关')),
      h('div',{role:'dialog'},h('button',{id:'close'},'返回 / 关闭')),
      h('div',{className:'fg-shell'},h('button',{id:'game'},'游戏专属按钮')),
      h('div',{id:'scroll',style:{height:100,overflow:'auto'}},h('div',{style:{height:2000}},'可下滑区域'))
    ));
  ` }))
  await page.goto(origin, { waitUntil: 'networkidle' })
  const count = () => page.evaluate(() => window.events.length)
  await page.locator('#ordinary').click()
  await page.waitForTimeout(180)
  assert.equal(await count(), 1)
  await page.locator('#hotspot').click()
  await page.waitForTimeout(180)
  assert.equal(await count(), 2, 'DOM capture and the 3D hotspot must not double-play')
  await page.locator('#close').click()
  await page.waitForTimeout(180)
  await page.keyboard.press('Escape')
  await page.waitForTimeout(180)
  assert.equal(await count(), 2, 'Project return, close and Escape must be silent')
  await page.locator('#scroll').evaluate(el => {
    for (let i = 0; i < 40; i++) el.dispatchEvent(new WheelEvent('wheel', { bubbles: true, deltaY: 60 }))
  })
  await page.waitForTimeout(180)
  assert.equal(await count(), 2, 'Scrolling must be silent')
  await page.locator('#game').click()
  await page.waitForTimeout(180)
  assert.equal(await count(), 2, 'Game cues must remain independent')
  await page.evaluate(() => window.store.setState({ overlay: 'work' }))
  await page.locator('#ordinary').click()
  await page.waitForTimeout(180)
  assert.equal(await count(), 2, 'No new click cue anywhere in a project')
  await page.evaluate(() => window.store.setState({ overlay: null }))
  await page.locator('#mute').click()
  await page.waitForTimeout(180)
  await page.locator('#ordinary').click()
  await page.waitForTimeout(180)
  assert.equal(await count(), 2, 'Muted homepage must be silent')
  await page.locator('#mute').click()
  await page.waitForTimeout(180)
  assert.equal(await count(), 2)
  await page.locator('#ordinary').focus()
  await page.keyboard.press('Enter')
  await page.waitForTimeout(180)
  assert.equal(await count(), 3)
  assert.equal(wavRequests, 1, 'Recording should be loaded once, including Strict Mode')
  assert.deepEqual(errors, [])
  console.log(JSON.stringify({ events: await page.evaluate(() => window.events), wavRequests, errors }, null, 2))
} finally { await browser.close() }
