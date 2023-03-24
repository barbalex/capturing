import { test, expect } from '@playwright/test'

test('has home title', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Erfassen: Home/)
})

test('Doku link', async ({ page }) => {
  await page.goto(`/`)
  await page.getByRole('link', { name: 'Doku' }).click()
  await expect(page).toHaveURL('/docs')
})

test('Home link', async ({ page }) => {
  await page.goto(`/docs`)
  await page.getByRole('link', { name: 'Erfassen' }).click()
  await expect(page).toHaveURL('/')
})

test('Daten link', async ({ page }) => {
  await page.goto(`/`)
  await page.getByRole('link', { name: 'Daten' }).click()
  await expect(page).toHaveURL('/projects')
})
