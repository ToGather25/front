import { test, expect } from '@playwright/test'

test('홈 페이지 접속', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/주보/)
})
