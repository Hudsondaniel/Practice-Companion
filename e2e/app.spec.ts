import { test, expect } from '@playwright/test'

test('dashboard loads with app title', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
})

test('practice tools panel is always visible', async ({ page }) => {
  await page.goto('/practice')
  await expect(page.getByRole('heading', { name: 'Practice Tools' })).toBeVisible()
  await expect(page.getByText('Metronome')).toBeVisible()
})

test('sidebar navigation works', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Exercises' }).click()
  await expect(page.getByRole('heading', { name: 'Exercises' })).toBeVisible()
})
