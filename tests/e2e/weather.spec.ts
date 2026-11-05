import { expect, test } from '@playwright/test';

test('busca uma cidade e alterna a temperatura para Fahrenheit', async ({ page }) => {
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    await route.fulfill({
      json: {
        results: [
          {
            id: 3448439,
            name: 'São Paulo',
            country: 'Brasil',
            admin1: 'São Paulo',
            latitude: -23.5475,
            longitude: -46.63611,
            timezone: 'America/Sao_Paulo',
          },
        ],
      },
    });
  });

  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    await route.fulfill({
      json: {
        timezone: 'America/Sao_Paulo',
        current: {
          time: '2026-01-10T12:00',
          temperature_2m: 0,
          relative_humidity_2m: 65,
          weather_code: 0,
          wind_speed_10m: 12.5,
        },
        daily: {
          time: ['2026-01-10', '2026-01-11', '2026-01-12', '2026-01-13', '2026-01-14'],
          weather_code: [0, 1, 2, 3, 61],
          temperature_2m_min: [-2, -1, 0, 1, 2],
          temperature_2m_max: [2, 3, 4, 5, 6],
        },
      },
    });
  });

  await page.goto('/');
  await page.getByRole('textbox', { name: 'Cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();

  const weather = page.getByRole('region', { name: 'São Paulo' });
  await expect(weather).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeVisible();
  await expect(weather).toContainText('0,0 °C');

  await page.getByRole('button', { name: '°F' }).click();

  await expect(weather).toContainText('32,0 °F');
});
