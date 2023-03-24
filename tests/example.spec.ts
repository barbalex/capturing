import { test, expect } from '@playwright/test'

test('has home title', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Erfassen: Home/)
})
