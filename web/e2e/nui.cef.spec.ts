import { test, expect } from '@playwright/test'

// Simulates the FiveM NUI environment: invokeNative present (CEF mode), the
// sync_notify resource callbacks stubbed, and — crucially — prefers-reduced-motion
// forced to "reduce", which real FiveM CEF reports even though players never
// asked for it. Regression guard: the rail countdown must keep running there.
test('NUI mode renders transparent and the rail drains under reduced motion', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.addInitScript(() => {
    ;(window as unknown as Record<string, unknown>).invokeNative = () => {}
    ;(window as unknown as Record<string, unknown>).GetParentResourceName = () => 'sync_notify'
  })
  await page.route(/sync_notify/, route => route.fulfill({ json: { ok: true } }))
  await page.goto('/')

  expect(await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor)).toBe('rgba(0, 0, 0, 0)')
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgba(0, 0, 0, 0)')

  await page.evaluate(() => window.postMessage({ scope: 'sync_notify', action: 'notify', data: { type: 'success', title: 'Rail check', message: 'Should drain', duration: 4000 } }, '*'))
  const fill = page.locator('.notify-rail.is-timed > span')
  await expect(fill).toBeVisible()
  await expect(fill).toHaveCSS('animation-name', 'rail-countdown')
  await expect(fill).toHaveCSS('animation-play-state', 'running')
  const start = await fill.evaluate(element => element.getBoundingClientRect().height)
  await page.waitForTimeout(1200)
  const later = await fill.evaluate(element => element.getBoundingClientRect().height)
  expect(later).toBeLessThan(start)

  const accentAlpha = await page.locator('.notification').first().evaluate(element => getComputedStyle(element).getPropertyValue('--accent-a14'))
  expect(accentAlpha.trim()).toMatch(/^rgba\(\d+, \d+, \d+, 0\.14\)$/)
  await context.close()
})
