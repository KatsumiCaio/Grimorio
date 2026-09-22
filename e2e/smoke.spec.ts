import { test, expect } from '@playwright/test';

test.describe('Grimório RPG — Smoke & Critical Path', () => {
  test('deve carregar a aplicação e exibir o título do Grimório', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Grimório/i);
  });

  test('deve responder com status ok na rota de saúde da API', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.status).toBe('ok');
  });

  test('deve aplicar headers de segurança nas respostas da API', async ({ request }) => {
    const response = await request.get('/api/health');
    const headers = response.headers();
    expect(headers['x-content-type-options']).toBe('nosniff');
  });
});
