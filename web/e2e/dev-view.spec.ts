import { test, expect } from '@playwright/test'

test('switches preview modes and persists state', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name:'transparent' }).click()
  await expect(page.locator('.dev-root')).toHaveClass(/view-transparent/)
  await page.reload(); await expect(page.locator('.dev-root')).toHaveClass(/view-transparent/)
})

test('sends, updates, and clears notifications', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name:'Send notification' }).click()
  await expect(page.locator('.notification[role=status]').first()).toBeVisible()
  await page.getByRole('button', { name:'Clear all' }).click()
  await expect(page.locator('.notification[role=status]')).toHaveCount(0)
})

test('captures every design, view, and viewport preset', async ({ page }) => {
  await page.goto('/')
  for (const design of ['split','floating']) {
    await page.getByLabel('Default design').selectOption(design)
    for (const viewport of ['1920x1080','2560x1440','3440x1440','3840x2160']) {
      await page.getByLabel('Canvas').selectOption(viewport)
      for (const view of ['gameplay','neutral','transparent']) {
        await page.getByRole('button', { name:view, exact:true }).click()
        await page.getByRole('button', { name:'Clear all' }).click()
        await page.getByRole('button', { name:'Send notification' }).click()
        await expect(page.locator(`.notification.design-${design}`)).toBeVisible()
        await page.screenshot({ path:`output/playwright/sync-${design}-${view}-${viewport}.png`, fullPage:true })
      }
    }
  }
})

test('exercises every design stack and queue at every position', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name:'Clear all' }).click()
  const positions=['top-left','top-center','top-right','middle-left','middle-right','bottom-left','bottom-center','bottom-right']
  for (const design of ['split','floating']) {
    await page.getByLabel('Default design').selectOption(design)
    for (const position of positions) {
      await page.getByLabel('Position').selectOption(position)
      await page.getByRole('button', { name:'Queue ×8' }).click()
      await expect(page.locator(`.notification-stack.${position} .notification.design-${design}`)).toHaveCount(4)
      const stack = page.locator(`.notification-stack.${position}`)
      const indicator = stack.locator('.queue-indicator')
      await expect(indicator).toContainText('4 queued')
      const [stackBox, indicatorBox] = await Promise.all([stack.boundingBox(), indicator.boundingBox()])
      expect(stackBox).not.toBeNull(); expect(indicatorBox).not.toBeNull()
      if (position.endsWith('left')) expect(indicatorBox!.x - stackBox!.x).toBeLessThanOrEqual(8)
      if (position.endsWith('right')) expect(stackBox!.x + stackBox!.width - indicatorBox!.x - indicatorBox!.width).toBeLessThanOrEqual(8)
      if (position.endsWith('center')) expect(Math.abs((stackBox!.x + stackBox!.width / 2) - (indicatorBox!.x + indicatorBox!.width / 2))).toBeLessThanOrEqual(1)
      await page.getByRole('button', { name:'Clear all' }).click()
    }
  }
})

test('renders contained full and micro concept comparisons', async ({ page }) => {
  await page.goto('/')
  for (const mode of ['full','micro']) {
    await page.getByRole('button', { name:`Compare ${mode}` }).click()
    await expect(page.locator(`.notification.mode-${mode}`)).toHaveCount(2)
    await expect(page.locator('.design-rail')).toHaveCount(0)
    const split = page.locator('.design-split').first()
    const splitIcon = split.locator('.notify-icon')
    const [cardBox, iconBox] = await Promise.all([split.boundingBox(), splitIcon.boundingBox()])
    expect(cardBox).not.toBeNull(); expect(iconBox).not.toBeNull()
    expect(iconBox!.y).toBeGreaterThanOrEqual(cardBox!.y)
    expect(iconBox!.y + iconBox!.height).toBeLessThanOrEqual(cardBox!.y + cardBox!.height)
    for (const design of ['split','floating']) {
      const card = page.locator(`.design-${design}`).first()
      const [currentCardBox, copyBox] = await Promise.all([card.boundingBox(), card.locator('.notify-copy').boundingBox()])
      expect(currentCardBox).not.toBeNull(); expect(copyBox).not.toBeNull()
      const cardCenter = currentCardBox!.y + currentCardBox!.height / 2
      const copyCenter = copyBox!.y + copyBox!.height / 2
      expect(Math.abs(cardCenter - copyCenter)).toBeLessThanOrEqual(1.5)
      const utility = card.locator('.notify-percent')
      if (mode === 'full' && await utility.count()) {
        const utilityBox = await utility.boundingBox()
        expect(utilityBox).not.toBeNull()
        expect(utilityBox!.x + utilityBox!.width).toBeLessThanOrEqual(currentCardBox!.x + currentCardBox!.width)
      }
    }
    if (mode === 'micro') {
      const textBox = await split.locator('.notify-copy h2').boundingBox()
      expect(textBox).not.toBeNull()
      expect(textBox!.x).toBeGreaterThan(iconBox!.x + iconBox!.width)
      const iconMarkers = await page.locator('.notification.mode-micro .notify-icon').evaluateAll(elements => elements.map(element => getComputedStyle(element, '::after').content))
      expect(iconMarkers.every(content => content === 'none')).toBe(true)
    }
    const floating = page.locator('.design-floating').first()
    const [railBox, shellLeft] = await Promise.all([
      floating.locator('.notify-rail').boundingBox(),
      floating.evaluate(element => Number.parseFloat(getComputedStyle(element, '::after').left))
    ])
    expect(railBox).not.toBeNull(); expect(shellLeft - railBox!.width).toBeGreaterThanOrEqual(6)
    for (const view of ['gameplay','neutral']) {
      await page.getByRole('button', { name:view, exact:true }).click()
      await page.screenshot({ path:`output/playwright/comparison-${mode}-${view}.png`, fullPage:true })
    }
  }
})

test('aligns notification actions and workbench controls', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name:'Clear all' }).click()
  await page.getByRole('button', { name:'Action', exact:true }).click()
  await page.getByRole('button', { name:'Send notification' }).click()
  const card = page.locator('.notification.is-action').first()
  await page.waitForTimeout(250)
  const [copyAxis, actionAxis] = await Promise.all([
    card.locator('.notify-copy').evaluate(element => element.getBoundingClientRect().x + Number.parseFloat(getComputedStyle(element).paddingLeft)),
    card.locator('.notify-actions').evaluate(element => element.getBoundingClientRect().x + Number.parseFloat(getComputedStyle(element).paddingLeft))
  ])
  expect(Math.abs(copyAxis - actionAxis)).toBeLessThanOrEqual(.5)

  const toolbarLabel = page.locator('label[for="dev-design"]')
  const toolbarControl = page.getByLabel('Default design')
  const [labelBox, controlBox] = await Promise.all([toolbarLabel.boundingBox(), toolbarControl.boundingBox()])
  expect(labelBox).not.toBeNull(); expect(controlBox).not.toBeNull()
  expect(Math.abs((labelBox!.y + labelBox!.height / 2) - (controlBox!.y + controlBox!.height / 2))).toBeLessThanOrEqual(1)

  const fieldControls = page.locator('.form-grid > label:not(.check) > input, .form-grid > label:not(.check) > select, .form-grid > label:not(.check) > textarea')
  const tops = await fieldControls.evaluateAll(elements => elements.slice(0, 5).map(element => element.getBoundingClientRect().top))
  expect(Math.max(...tops) - Math.min(...tops)).toBeLessThanOrEqual(1)
})

test('has no connected stack background', async ({ page }) => {
  await page.goto('/')
  const content = await page.locator('.notification-stack').first().evaluate(element => getComputedStyle(element, '::before').content)
  expect(content).toBe('none')
})
