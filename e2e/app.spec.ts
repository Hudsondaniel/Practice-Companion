import { test, expect } from '@playwright/test'

test('login gate shows on home', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Practice Assistant' })).toBeVisible()
  await expect(page.getByPlaceholder('Email')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
})

test('settings route shows login gate', async ({ page }) => {
  await page.goto('/settings')
  await expect(page.getByPlaceholder('Email')).toBeVisible()
})

test('can switch to create account', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Need an account?' }).click()
  await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible()
})

test('forgot password flow is available', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Forgot password?' }).click()
  await expect(page.getByRole('button', { name: 'Send reset link' })).toBeVisible()
})
