import { expect, type Page, test } from '@playwright/test';

const city = {
  id: 3448439,
  name: 'São Paulo',
  country: 'Brasil',
  admin1: 'São Paulo',
  latitude: -23.5475,
  longitude: -46.63611,
  timezone: 'America/Sao_Paulo',
};

const forecast = {
  timezone: 'America/Sao_Paulo',
  current_units: {
    temperature_2m: '°C',
    wind_speed_10m: 'km/h',
  },
  daily_units: {
    temperature_2m_min: '°C',
    temperature_2m_max: '°C',
  },
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
};

async function mockSuccessfulWeather(page: Page) {
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    await route.fulfill({ json: { results: [city] } });
  });
  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    await route.fulfill({ json: forecast });
  });
}

test('busca uma cidade e alterna a temperatura para Fahrenheit', async ({ page }) => {
  await mockSuccessfulWeather(page);

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

test('exibe estado vazio quando o geocoding não retorna results', async ({ page }) => {
  let forecastRequests = 0;
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    await route.fulfill({ json: {} });
  });
  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    forecastRequests += 1;
    await route.fulfill({ json: forecast });
  });

  await page.goto('/');
  await page.getByRole('textbox', { name: 'Cidade' }).fill('Cidade inexistente');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('status')).toContainText('Nenhuma cidade encontrada');
  expect(forecastRequests).toBe(0);
});

test('busca e renderiza a previsão em viewport mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await mockSuccessfulWeather(page);

  await page.goto('/');
  await page.getByRole('textbox', { name: 'Cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();

  const weather = page.getByRole('region', { name: 'São Paulo' });
  await expect(weather).toContainText('0,0 °C');
  await expect(page.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(5);

  await page.getByRole('button', { name: '°F' }).click();
  await expect(weather).toContainText('32,0 °F');
});
