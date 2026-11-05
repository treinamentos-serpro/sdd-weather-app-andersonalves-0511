import { expect, test } from '@playwright/test';

test('UI mock permite buscar, alternar unidade e recuperar erro sem API', async ({ page }) => {
  await page.route(/https:\/\/(geocoding-api|api)\.open-meteo\.com\//, (route) => route.abort());
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Consulte o clima' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.getByRole('status')).toContainText('Carregando');
  await expect(page.getByRole('article')).toHaveCount(5);
  await page.getByRole('button', { name: '°F' }).click();
  await expect(page.getByRole('region', { name: 'São Paulo' })).toContainText('79,5 °F');
  await page.getByRole('combobox').selectOption('error');
  await expect(page.getByRole('alert')).toContainText('Erro simulado');
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByRole('article')).toHaveCount(5);
  await expect(page.getByRole('region', { name: 'São Paulo' })).toContainText('79,5 °F');
});

test('layout e controles permanecem acessíveis de 320 a 1920 px', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('combobox').selectOption('success');

  for (const width of [320, 375, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true);
    const columns = await page
      .getByRole('list')
      .evaluate((list) => getComputedStyle(list).gridTemplateColumns.split(' ').length);
    expect(columns).toBe(width >= 1024 ? 5 : width >= 640 ? 3 : 2);
    for (const name of ['Buscar', '°C', '°F']) {
      const box = await page.getByRole('button', { name, exact: true }).boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
  }
});
