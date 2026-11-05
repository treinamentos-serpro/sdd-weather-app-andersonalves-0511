import { expect, test } from '@playwright/test';

function contrast(element: Element, property: 'color' | 'borderTopColor' | 'outlineColor') {
  function rgba(color: string) {
    const values = color.match(/[\d.]+/g)?.map(Number);
    if (!values || values.length < 3) throw new Error(`Cor não suportada: ${color}`);
    return [values[0], values[1], values[2], values[3] ?? 1];
  }
  function blend(top: number[], bottom: number[]) {
    return top.slice(0, 3).map((channel, index) => channel * top[3] + bottom[index] * (1 - top[3]));
  }
  function background(node: Element | null): number[] {
    if (!node) return [255, 255, 255];
    return blend(rgba(getComputedStyle(node).backgroundColor), background(node.parentElement));
  }
  function luminance(rgb: number[]) {
    const linear = rgb.map((channel) => {
      const value = channel / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  }
  const behind = background(property === 'outlineColor' ? element.parentElement : element);
  const foreground = blend(rgba(getComputedStyle(element)[property]), behind);
  const light = luminance(foreground);
  const dark = luminance(behind);
  return (Math.max(light, dark) + 0.05) / (Math.min(light, dark) + 0.05);
}

test('teclado mantém foco útil depois da busca e do retry', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Pular para o conteúdo' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();

  const input = page.getByRole('textbox', { name: 'Cidade' });
  await input.focus();
  await page.keyboard.press('Enter');
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(input).toHaveAccessibleDescription('Informe o nome de uma cidade.');
  await input.fill('São Paulo');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('article')).toHaveCount(5);
  await expect(page.getByRole('main')).toBeFocused();
  expect(
    await page.getByRole('main').evaluate(contrast, 'outlineColor' as const),
  ).toBeGreaterThanOrEqual(3);

  await page.getByRole('combobox').selectOption('error');
  await page.getByRole('button', { name: 'Tentar novamente' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('article')).toHaveCount(5);
  await expect(page.getByRole('main')).toBeFocused();
});

test('concluir busca não rouba foco de quem está alternando unidade', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('textbox', { name: 'Cidade' }).fill('São Paulo');
  await page.getByRole('textbox', { name: 'Cidade' }).press('Enter');
  const fahrenheit = page.getByRole('button', { name: '°F' });
  await fahrenheit.focus();
  await page.keyboard.press('Space');
  await expect(page.getByRole('article')).toHaveCount(5);
  await expect(fahrenheit).toBeFocused();
  await expect(fahrenheit).toHaveAttribute('aria-pressed', 'true');
});

test('textos e limites dos campos têm contraste mensurável', async ({ page }) => {
  await page.goto('/');
  const input = page.getByRole('textbox', { name: 'Cidade' });
  const select = page.getByRole('combobox');
  for (const control of [input, select]) {
    expect(await control.evaluate(contrast, 'borderTopColor' as const)).toBeGreaterThanOrEqual(3);
    await control.focus();
    expect(await control.evaluate(contrast, 'outlineColor' as const)).toBeGreaterThanOrEqual(3);
  }
  await select.selectOption('success');
  for (const locator of [
    page.getByRole('button', { name: 'Buscar' }),
    page.getByRole('button', { name: '°C' }),
    page.getByRole('button', { name: '°F' }),
    page.getByText('Parcialmente nublado').first(),
    page.getByText('Máxima').first(),
    page.getByText('26,4 °C'),
    page.getByRole('link', { name: 'Open-Meteo' }),
  ]) {
    expect(await locator.evaluate(contrast, 'color' as const)).toBeGreaterThanOrEqual(4.5);
  }
  const search = page.getByRole('button', { name: 'Buscar' });
  await search.hover();
  expect(await search.evaluate(contrast, 'color' as const)).toBeGreaterThanOrEqual(4.5);
});

test('todos os estados acomodam textos longos entre 320 e 1920 px', async ({ page }) => {
  await page.goto('/');
  for (const state of ['idle', 'loading', 'empty', 'error', 'success']) {
    await page.getByRole('combobox').selectOption(state);
    const heading = page.getByRole('region', { name: 'São Paulo' }).getByRole('heading');
    if (state === 'success') {
      await heading.evaluate((node) => {
        node.textContent = 'LocalidadeComNomeMuitoLongoSemEspaços'.repeat(5);
      });
      await page.getByText('26,4 °C').evaluate((node) => {
        node.textContent = 'Indisponível';
      });
    }
    if (state === 'error') {
      await page.getByRole('alert').evaluate((node) => {
        node.textContent = 'MensagemDeErroMuitoLongaSemEspaços'.repeat(8);
      });
    }
    for (const width of [320, 375, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        ),
      ).toBe(true);
      if (state === 'success') await expect(page.getByRole('article')).toHaveCount(5);
      for (const control of await page.locator('button, input, select, footer a').all()) {
        const box = await control.boundingBox();
        expect(box?.width).toBeGreaterThanOrEqual(44);
        expect(box?.height).toBeGreaterThanOrEqual(44);
      }
    }
  }
});

test('loading respeita preferência por movimento reduzido', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('combobox').selectOption('loading');
  const spinner = page.getByRole('status').locator('[aria-hidden="true"]');
  await expect(spinner).toHaveCSS('animation-name', 'none');
});
