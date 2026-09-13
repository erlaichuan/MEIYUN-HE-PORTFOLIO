import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const browser = await chromium.launch()
let releaseCloud
const cloudGate = new Promise(resolve => { releaseCloud = resolve })
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/src/main.tsx*', async route => {
    const response = await route.fetch()
    await route.fulfill({ response, body: (await response.text()).replace(/from "\/src\/App.tsx[^"]*"/, 'from "/src/components/game/GameView.tsx"') })
  })
  await page.route('**/map-controls/6.png', async route => {
    await cloudGate
    await route.continue()
  })
  await page.goto(process.env.DEMO_TEST_URL || 'http://localhost:5178/', { waitUntil: 'domcontentloaded' })
  const click = name => page.getByRole('button', { name, exact: true }).click()
  await click('进入游戏')
  await page.waitForTimeout(1100)
  await click('继续修复之旅')
  await click('关闭可展开区域引导，开始探索')
  await click('修复图鉴')
  await click('墨痕残卷，进入修复')
  await page.waitForSelector('.fm-map[data-ready="false"]')
  assert.equal(await page.locator('.fm-cloud-reveal').evaluate(el => getComputedStyle(el).animationPlayState), 'paused')
  assert.equal(await page.locator('.fm-cloud').evaluate(el => getComputedStyle(el).visibility), 'hidden')
  // Leaving during an unfinished download must not mount or animate a stale screen.
  await click('返回修复图鉴')
  await page.waitForSelector('.fm-map', { state: 'detached' })
  await click('墨痕残卷，进入修复')
  releaseCloud()
  await page.waitForSelector('.fm-map[data-ready="true"]')

  const positions = []
  for (const time of [600, 1000, 1500, 2200]) {
    const sample = await page.locator('.fm-map').evaluate((map, time) => {
      for (const animation of map.getAnimations({ subtree: true })) {
        animation.pause(); animation.currentTime = time
      }
      const cloud = map.querySelector('.fm-cloud').getBoundingClientRect()
      const reveal = map.querySelector('.fm-cloud-reveal')
      const rect = reveal.getBoundingClientRect()
      return { x: rect.left, right: rect.right, opacity: Number(getComputedStyle(reveal).opacity), finalX: cloud.left }
    }, time)
    positions.push(sample)
    if (time === 1000 || time === 2200) await page.screenshot({ path: `/tmp/demo-cloud-${time}.png` })
  }
  assert.equal(positions[0].opacity, 0)
  assert(positions[1].opacity > 0 && positions[1].opacity < 1)
  assert(positions[0].x < positions[1].x && positions[1].x < positions[2].x && positions[2].x < positions[3].x)
  assert(Math.abs(positions[3].x - positions[3].finalX) < 1)
  await page.locator('.fm-marker.is-current').click()
  await page.waitForSelector('.fg-repair-shade')
  assert.equal(await page.locator('.fg-repair-shade').evaluate(el => getComputedStyle(el).backdropFilter), 'none')
  await page.locator('.fg-reveal-monochrome').evaluate(image => image.decode())
  await page.waitForTimeout(350)
  await page.screenshot({ path: '/tmp/demo-repair-entrance.png' })
  await click('关闭修复，返回残卷地图')
  assert.equal(await page.locator('.fg-repair-shade').count(), 0)
  assert.deepEqual(errors, [])
  console.log(JSON.stringify({ slowImageGate: 'passed', earlyReturn: 'passed', leftToRightCloud: positions, repairBackdropFilter: 'none', errors }, null, 2))
} finally {
  releaseCloud()
  await browser.close()
}
