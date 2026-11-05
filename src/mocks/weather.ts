import type { WeatherData } from '../types/weather';

export const MOCK_WEATHER: WeatherData = {
  city: {
    id: 3448439,
    name: 'São Paulo',
    country: 'Brasil',
    admin1: 'São Paulo',
    latitude: -23.5475,
    longitude: -46.6361,
    timezone: 'America/Sao_Paulo',
  },
  timezone: 'America/Sao_Paulo',
  current: {
    temperatureC: 26.4,
    weatherCode: 2,
    relativeHumidity: 65,
    windSpeedKmh: 12.6,
    precipitationMm: 0,
    pressureHpa: 1015,
    observedAtLocal: '2026-01-10T12:00',
  },
  forecast: [
    { date: '2026-01-10', weatherCode: 2, temperatureMinC: 20, temperatureMaxC: 28 },
    { date: '2026-01-11', weatherCode: 61, temperatureMinC: 19.8, temperatureMaxC: 27.1 },
    { date: '2026-01-12', weatherCode: 3, temperatureMinC: 20.1, temperatureMaxC: 29.2 },
    { date: '2026-01-13', weatherCode: 1, temperatureMinC: 21, temperatureMaxC: 30 },
    { date: '2026-01-14', weatherCode: 0, temperatureMinC: 21.4, temperatureMaxC: 31.3 },
  ],
};
