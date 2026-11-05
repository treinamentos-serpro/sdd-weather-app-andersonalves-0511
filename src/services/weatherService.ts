import type { City, CurrentWeather, ForecastDay, WeatherData } from '../types/weather';

export class WeatherServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

interface GeocodingResponse {
  results?: City[];
}

interface ForecastResponse {
  timezone: string;
  current?: {
    time?: string | null;
    temperature_2m?: number | null;
    relative_humidity_2m?: number | null;
    weather_code?: number | null;
    wind_speed_10m?: number | null;
  } | null;
  daily?: {
    time?: string[];
    weather_code?: (number | null)[];
    temperature_2m_min?: (number | null)[];
    temperature_2m_max?: (number | null)[];
  } | null;
}

export async function searchCities(name: string): Promise<City[]> {
  const query = name.trim();

  if (!query) {
    return [];
  }

  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=pt&format=json`,
  );

  if (!response.ok) {
    throw new WeatherServiceError(`Erro ao buscar cidades (HTTP ${response.status}).`);
  }

  const data: GeocodingResponse = await response.json();

  return (data.results ?? []).map((city) => ({
    id: city.id,
    name: city.name,
    country: city.country,
    admin1: city.admin1,
    latitude: city.latitude,
    longitude: city.longitude,
    timezone: city.timezone,
  }));
}

export async function getWeather(city: City): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    timezone: 'auto',
    forecast_days: '5',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    timeformat: 'iso8601',
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);

  if (!response.ok) {
    throw new WeatherServiceError(`Erro ao buscar previsão (HTTP ${response.status}).`);
  }

  const data: ForecastResponse | null = await response.json();

  if (!data?.current || !data.daily) {
    throw new WeatherServiceError('Resposta incompleta: current ou daily ausente.');
  }

  const { current, daily } = data;

  if (!Array.isArray(daily.time) || daily.time.length < 5) {
    throw new WeatherServiceError('Resposta incompleta: previsão deve conter cinco datas.');
  }

  const currentWeather: CurrentWeather = {
    temperatureC: current.temperature_2m ?? null,
    weatherCode: current.weather_code ?? null,
    relativeHumidity: current.relative_humidity_2m ?? null,
    windSpeedKmh: current.wind_speed_10m ?? null,
    observedAtLocal: current.time ?? null,
  };
  const forecast: ForecastDay[] = daily.time.slice(0, 5).map((date, index) => ({
    date,
    weatherCode: daily.weather_code?.[index] ?? null,
    temperatureMinC: daily.temperature_2m_min?.[index] ?? null,
    temperatureMaxC: daily.temperature_2m_max?.[index] ?? null,
  }));

  return { city, timezone: data.timezone, current: currentWeather, forecast };
}
