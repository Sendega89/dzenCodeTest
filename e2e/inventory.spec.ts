import { expect, test } from '@playwright/test'

test('login, orders, socket and the products microfrontend', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Пароль').fill('demo')
  const socketPromise = page.waitForEvent('websocket')
  await page.getByRole('button', { name: 'Войти' }).click()
  await expect(page.getByRole('heading', { name: /Приходы/ })).toBeVisible()
  const socket = await socketPromise
  expect(socket.url()).toContain('4001')
  await expect(page.locator('[data-realtime="socket"]')).toBeVisible()

  await page.getByRole('button', { name: /название прихода|Приход периферии/ }).first().click()
  await expect(page.getByRole('button', { name: 'Добавить продукт' })).toBeVisible()
  await page.getByRole('button', { name: 'Закрыть' }).click()
  await expect(page.getByRole('button', { name: 'Добавить продукт' })).toHaveCount(0)

  const health = await page.request.get('/api/health')
  expect(health.ok()).toBeTruthy()
  await expect(health.json()).resolves.toMatchObject({ service: 'gateway' })

  await page.getByRole('link', { name: 'ПРОДУКТЫ' }).click()
  await expect(page.getByRole('heading', { name: /Продукты/ })).toBeVisible()
  await page.getByLabel('Тип').selectOption({ label: 'Мониторы' })
  await expect(page.getByText('показано')).toBeVisible()
})

test('create and delete an order through the services', async ({ page }) => {
  const title = `Приход e2e ${Date.now()}`
  await page.goto('/login')
  await page.getByLabel('Пароль').fill('demo')
  await page.getByRole('button', { name: 'Войти' }).click()
  await page.getByRole('button', { name: 'Новый приход' }).click()
  await page.getByLabel('Название прихода').fill(title)
  await page.getByRole('button', { name: 'Сохранить' }).click()
  const created = page.getByRole('button', { name: title })
  await expect(created).toBeVisible()
  await created.locator('xpath=ancestor::article').getByRole('button', { name: 'Удалить' }).click()
  await page.getByRole('button', { name: 'Удалить' }).last().click()
  await expect(page.getByRole('button', { name: title })).toHaveCount(0)
})
