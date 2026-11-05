import { expect, test } from './weatherFixtures';

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

test('teclado mantém foco útil depois da busca e do retry', async ({ page, weatherApi }) => {
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
  const focusTarget = page.locator('main:focus, input[name="city"]:focus');
  await expect(focusTarget).toHaveCount(1);
  expect(await focusTarget.evaluate(contrast, 'outlineColor' as const)).toBeGreaterThanOrEqual(3);

  weatherApi.mode = 'error';
  await input.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('alert')).toContainText('HTTP 503');
  await page.getByRole('button', { name: 'Tentar novamente' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('article')).toHaveCount(5);
  await expect(page.getByRole('main')).toBeFocused();
});

test('concluir busca não rouba foco de quem está alternando unidade', async ({
  page,
  weatherApi,
}) => {
  weatherApi.mode = 'loading';
  await page.goto('/');
  await page.getByRole('textbox', { name: 'Cidade' }).fill('São Paulo');
  await page.getByRole('textbox', { name: 'Cidade' }).press('Enter');
  const fahrenheit = page.getByRole('button', { name: '°F' });
  await fahrenheit.focus();
  await page.keyboard.press('Space');
  weatherApi.mode = 'success';
  weatherApi.release();
  await expect(page.getByRole('article')).toHaveCount(5);
  await expect(fahrenheit).toBeFocused();
  await expect(fahrenheit).toHaveAttribute('aria-pressed', 'true');
});

test('textos e limites dos campos têm contraste mensurável', async ({ page }) => {
  await page.goto('/');
  const input = page.getByRole('textbox', { name: 'Cidade' });
  for (const control of [input]) {
    expect(await control.evaluate(contrast, 'borderTopColor' as const)).toBeGreaterThanOrEqual(3);
    await control.focus();
    expect(await control.evaluate(contrast, 'outlineColor' as const)).toBeGreaterThanOrEqual(3);
  }
  await input.fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.getByRole('article')).toHaveCount(5);
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

test('todos os estados acomodam textos longos entre 320 e 1920 px', async ({
  page,
  weatherApi,
}) => {
  for (const state of ['idle', 'loading', 'empty', 'error', 'success'] as const) {
    weatherApi.mode = state === 'idle' ? 'success' : state;
    await page.goto('/');
    if (state !== 'idle') {
      await page.getByRole('textbox', { name: 'Cidade' }).fill('São Paulo');
      await page.getByRole('button', { name: 'Buscar' }).click();
    }
    if (state === 'loading') await expect(page.getByRole('status')).toContainText('Carregando');
    if (state === 'empty') await expect(page.getByRole('status')).toContainText('Nenhuma cidade');
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
      await expect(page.getByRole('alert')).toBeVisible();
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
    if (state === 'loading') {
      weatherApi.mode = 'success';
      weatherApi.release();
      await expect(page.getByRole('article')).toHaveCount(5);
    }
  }
});

test('loading respeita preferência por movimento reduzido', async ({ page, weatherApi }) => {
  weatherApi.mode = 'loading';
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('textbox', { name: 'Cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();
  const spinner = page.getByRole('status').locator('[aria-hidden="true"]');
  await expect(spinner).toHaveCSS('animation-name', 'none');
});
