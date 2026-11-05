import { test as base } from '@playwright/test';
import { MOCK_WEATHER } from '../../src/mocks/weather';

interface WeatherApi {
  mode: 'success' | 'empty' | 'error' | 'loading';
  release: () => void;
}

export const test = base.extend<{ weatherApi: WeatherApi }>({
  weatherApi: [
    async ({ page }, use) => {
      let release!: () => void;
      const pending = new Promise<void>((resolve) => {
        release = resolve;
      });
      const api: WeatherApi = { mode: 'success', release };

      await page.route(/https:\/\/(geocoding-api|api)\.open-meteo\.com\//, async (route) => {
        if (api.mode === 'loading') await pending;

        if (route.request().url().includes('geocoding-api')) {
          await route.fulfill({
            json: { results: api.mode === 'empty' ? [] : [MOCK_WEATHER.city] },
          });
          return;
        }

        if (api.mode === 'error') {
          api.mode = 'success';
          await route.fulfill({ status: 503, json: { error: true } });
          return;
        }

        const { current, forecast, timezone } = MOCK_WEATHER;
        await route.fulfill({
          json: {
            timezone,
            current_units: {
              temperature_2m: '°C',
              wind_speed_10m: 'km/h',
            },
            daily_units: {
              temperature_2m_min: '°C',
              temperature_2m_max: '°C',
            },
            current: {
              time: current.observedAtLocal,
              temperature_2m: current.temperatureC,
              relative_humidity_2m: current.relativeHumidity,
              weather_code: current.weatherCode,
              wind_speed_10m: current.windSpeedKmh,
            },
            daily: {
              time: forecast.map((day) => day.date),
              weather_code: forecast.map((day) => day.weatherCode),
              temperature_2m_min: forecast.map((day) => day.temperatureMinC),
              temperature_2m_max: forecast.map((day) => day.temperatureMaxC),
            },
          },
        });
      });

      await use(api);
      release();
      await page.unrouteAll({ behavior: 'ignoreErrors' });
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
