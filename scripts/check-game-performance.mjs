import assert from 'node:assert/strict'
import { chromium } from 'playwright'

// Run against the local Vite server, in a fresh profile (never changes user saves).
const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('response', response => {
    if (response.status() >= 400 && response.url().includes('/assets/fusheng/')) errors.push(`${response.status()} ${response.url()}`)
  })
  await page.route('**/src/main.tsx*', async route => {
    const response = await route.fetch()
    await route.fulfill({ response, body: (await response.text()).replace(/from "\/src\/App.tsx[^"]*"/, 'from "/src/components/game/GameView.tsx"') })
  })
  await page.goto(process.env.DEMO_TEST_URL || 'http://localhost:5178/', { waitUntil: 'domcontentloaded' })
  const click = name => page.getByRole('button', { name, exact: true }).click()
  await click('进入游戏')
  await page.waitForTimeout(1100)
  await click('继续修复之旅')
  await page.waitForTimeout(1100)
  assert.equal(await page.locator('.fh-landscape').evaluate(el => getComputedStyle(el).opacity), '1')
  assert.equal(await page.locator('.fh-guide-shade').evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(9, 16, 15, 0.5)')
  await page.screenshot({ path: '/tmp/demo-guide-transparent.png' })
  await click('关闭可展开区域引导，开始探索')
  await click('修复图鉴')
  await page.waitForSelector('.fa-atlas')
  await page.waitForTimeout(1000)

  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Performance.enable')
  const metrics = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]))
  const before = await metrics()
  for (let i = 0; i < 3; i++) {
    await click('下一部图鉴'); await page.waitForTimeout(600)
    await click('上一部图鉴'); await page.waitForTimeout(600)
  }
  const after = await metrics()
  const delta = Object.fromEntries(['LayoutCount', 'RecalcStyleCount', 'LayoutDuration', 'TaskDuration'].map(key => [key, after[key] - before[key]]))
  assert(delta.LayoutCount < 90, `Atlas is relaying out on animation frames: ${delta.LayoutCount}`)
  const active = await page.locator('.fa-chapter.is-selected').boundingBox()
  const stage = await page.locator('.fg-stage').boundingBox()
  assert(Math.abs(active.height / stage.height - 565 / 1080) < .002)
  await page.screenshot({ path: '/tmp/demo-atlas-optimized.png' })

  await page.getByRole('button', { name: '墨痕残卷，进入修复', exact: true }).click()
  await page.waitForTimeout(1700)
  for (let i = 0; i < 4; i++) {
    await page.locator('.fm-marker.is-current').click()
    assert((await page.locator('.fm-cloud').evaluate(el => getComputedStyle(el).animationPlayState)).split(',').every(state => state.trim() === 'paused'))
    if (i === 0) {
      // Synthetic high-frequency input: measure layout reads, not subjective FPS.
      const reads = await page.locator('.fg-reveal-painting').evaluate(el => {
        const rect = el.getBoundingClientRect()
        const original = el.getBoundingClientRect.bind(el)
        let reads = 0
        el.getBoundingClientRect = () => { reads++; return original() }
        for (let n = 0; n < 120; n++) el.dispatchEvent(new PointerEvent('pointermove', {
          bubbles: true, pointerType: 'mouse', clientX: rect.left + n, clientY: rect.top + 40,
        }))
        el.getBoundingClientRect = original
        return reads
      })
      assert(reads <= 1, `Pointer handler reads layout ${reads} times`)
    }
    await page.locator('.fg-tools').getByRole('button', { name: ['画魂笔', '灵莲', '灵剪', '画魂笔'][i], exact: true }).click()
    for (const button of await page.locator('.fg-repair-spot').all()) await button.click()
    await click('完成此处修复')
  }
  assert.match(await page.locator('.fm-progress').innerText(), /已修复/)
  await click('返回修复图鉴')
  await click('关闭修复图鉴')
  await click('角色卡牌')
  const names = await page.locator('.gc-card').evaluateAll(elements => elements.map(el => el.getAttribute('aria-label')))
  for (const name of names) {
    await click(name)
    await page.waitForSelector('.lh-detail')
    for (const section of ['身份背景', '战斗定位', '法器属性']) {
      await click(section)
      assert.equal(await page.locator('.lh-content [role="status"]').innerText(), '区域未开放')
      assert.equal(await page.locator('.lh-attributes, .lh-content .fg-weapon').count(), 0)
    }
    // Keyboard tab switching must use the same unavailable view.
    await page.getByRole('button', { name: '法器属性', exact: true }).press('Home')
    assert.equal(await page.getByRole('button', { name: '身份背景', exact: true }).getAttribute('aria-pressed'), 'true')
    assert.equal(await page.locator('.lh-content [role="status"]').innerText(), '区域未开放')
    await click('技能属性')
    assert.equal(await page.locator('.lh-content').count(), 0)
    assert.equal(await page.locator('.lh-attributes').count(), 1)
    await page.waitForTimeout(450)
    const tabs = await page.locator('.lh-tab').evaluateAll(elements => elements.map(el => ({ top: el.style.top, transition: getComputedStyle(el).transitionProperty })))
    assert(tabs.every(tab => tab.top === tabs[0].top && tab.transition === 'transform'))
    await click('返回角色卡牌')
  }
  await click('关闭角色卡牌')
  await click('签到')
  await page.waitForSelector('.fg-checkin-scroll')
  assert.equal(await page.locator('.fh-cloud').first().evaluate(el => getComputedStyle(el).animationPlayState), 'paused')
  await page.keyboard.press('Escape')
  await click('道具'); await click('关闭道具页面')
  await click('任务')
  assert.equal(await page.locator('.fg-info h2').innerText(), '区域未开放')
  await page.keyboard.press('Escape')
  const save = await page.evaluate(() => JSON.parse(localStorage.getItem('fusheng-save-v1')))
  assert.equal(save.stage, 4)
  assert.deepEqual(errors, [])
  console.log(JSON.stringify({ atlasSixTransitions: delta, completedRepairStages: save.stage, testedCharacters: names.length, errors }, null, 2))
} finally {
  await browser.close()
}
