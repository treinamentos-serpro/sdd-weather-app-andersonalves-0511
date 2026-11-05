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
    precipitation: 'mm',
    surface_pressure: 'hPa',
  },
  daily_units: {
    temperature_2m_min: '°C',
    temperature_2m_max: '°C',
    precipitation_probability_max: '%',
  },
  current: {
    time: '2026-01-10T12:00',
    temperature_2m: 0,
    relative_humidity_2m: 65,
    weather_code: 0,
    wind_speed_10m: 12.5,
    precipitation: 0,
    surface_pressure: 1015,
  },
  daily: {
    time: ['2026-01-10', '2026-01-11', '2026-01-12', '2026-01-13', '2026-01-14'],
    weather_code: [0, 1, 2, 3, 61],
    temperature_2m_min: [-2, -1, 0, 1, 2],
    temperature_2m_max: [2, 3, 4, 5, 6],
    precipitation_probability_max: [0, 10, 25, 50, 100],
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

test('busca vazia ou só com espaços pede uma cidade sem consultar a API', async ({ page }) => {
  let geocodingRequests = 0;
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    geocodingRequests += 1;
    await route.fulfill({ json: { results: [city] } });
  });

  await page.goto('/');
  const input = page.getByRole('textbox', { name: 'Cidade' });

  await input.fill('');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.getByRole('alert')).toContainText('Informe o nome de uma cidade.');
  await expect(input).toBeFocused();

  await input.fill('   ');
  await input.press('Enter');
  await expect(page.getByRole('alert')).toContainText('Informe o nome de uma cidade.');
  expect(geocodingRequests).toBe(0);
});

test('codifica caracteres especiais da busca e preserva o termo no request', async ({ page }) => {
  const query = "São João-d'Aliança & região";
  const resultCity = { ...city, name: query };
  let geocodingName: string | null = null;
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    geocodingName = new URL(route.request().url()).searchParams.get('name');
    await route.fulfill({ json: { results: [resultCity] } });
  });
  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    await route.fulfill({ json: forecast });
  });

  await page.goto('/');
  await page.getByRole('textbox', { name: 'Cidade' }).fill(`  ${query}  `);
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('region', { name: query })).toBeVisible();
  expect(geocodingName).toBe(query);
});

for (const [description, geocodingResponse] of [
  ['results ausente', {}],
  ['results vazio', { results: [] }],
] as const) {
  test(`exibe estado vazio quando o geocoding retorna ${description}`, async ({ page }) => {
    let forecastRequests = 0;
    await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
      await route.fulfill({ json: geocodingResponse });
    });
    await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
      forecastRequests += 1;
      await route.fulfill({ json: forecast });
    });

    await page.goto('/');
    await page.getByRole('textbox', { name: 'Cidade' }).fill('Cidade inexistente');
    await page.getByRole('button', { name: 'Buscar' }).click();

    await expect(page.getByRole('status')).toContainText('Nenhuma cidade encontrada');
    await expect(page.getByRole('textbox', { name: 'Cidade' })).toHaveValue('Cidade inexistente');
    expect(forecastRequests).toBe(0);
  });
}

test('mantém as cinco datas e sinaliza campos ausentes no forecast', async ({ page }) => {
  const incompleteForecast = {
    ...forecast,
    current: {
      time: null,
      temperature_2m: null,
      relative_humidity_2m: 0,
      weather_code: null,
      wind_speed_10m: 0,
      surface_pressure: null,
    },
    daily: {
      time: forecast.daily.time,
      temperature_2m_min: [0, null],
      temperature_2m_max: [null],
      precipitation_probability_max: [0, null, 100],
    },
  };
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    await route.fulfill({ json: { results: [city] } });
  });
  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    await route.fulfill({ json: incompleteForecast });
  });

  await page.goto('/');
  await page.getByRole('textbox', { name: 'Cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();

  const weather = page.getByRole('region', { name: 'São Paulo' });
  await expect(weather).toBeVisible();
  await expect(weather).toContainText('Indisponível');
  await expect(weather).toContainText('0 %');
  await expect(weather).toContainText('0 km/h');
  const days = page.getByRole('article');
  await expect(days).toHaveCount(5);
  await expect(days.nth(0)).toContainText('0,0 °C');
  await expect(days.nth(0)).toContainText('0 %');
  await expect(days.nth(1)).toContainText('Indisponível');
  await expect(days.nth(4)).toContainText('Indisponível');
  await expect(page.getByText(/undefined|NaN|Infinity/i)).toHaveCount(0);
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
