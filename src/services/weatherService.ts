import type { City, CurrentWeather, ForecastDay, WeatherData } from '../types/weather';

export class WeatherServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

export function fetchWithTimeout(url: string): Promise<Response>;
export function fetchWithTimeout<T>(
  url: string,
  consumeResponse: (response: Response) => Promise<T>,
): Promise<T>;
export async function fetchWithTimeout<T>(
  url: string,
  consumeResponse?: (response: Response) => Promise<T>,
): Promise<Response | T> {
  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const timedOut = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      controller.abort();
      reject(new WeatherServiceError('A requisição demorou demais.'));
    }, 10_000);
  });

  try {
    const request = (async () => {
      const response = await fetch(url, { signal: controller.signal });
      return consumeResponse ? consumeResponse(response) : response;
    })();

    return await Promise.race([request, timedOut]);
  } catch (error) {
    if (error instanceof WeatherServiceError) throw error;
    if (
      typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      error.name === 'AbortError'
    ) {
      throw new WeatherServiceError('A requisição demorou demais.');
    }

    throw new WeatherServiceError('Falha de rede.');
  } finally {
    if (timeout !== undefined) clearTimeout(timeout);
  }
}

interface ForecastResponse {
  timezone: string;
  current_units: {
    temperature_2m: string;
    wind_speed_10m: string;
  };
  daily_units: {
    temperature_2m_min: string;
    temperature_2m_max: string;
  };
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

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      error.name === 'AbortError'
    ) {
      throw error;
    }

    throw new WeatherServiceError('Resposta inválida da API.');
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mapCity(value: unknown): City {
  if (
    !isRecord(value) ||
    typeof value.id !== 'number' ||
    !Number.isInteger(value.id) ||
    typeof value.name !== 'string' ||
    typeof value.country !== 'string' ||
    typeof value.latitude !== 'number' ||
    !Number.isFinite(value.latitude) ||
    typeof value.longitude !== 'number' ||
    !Number.isFinite(value.longitude) ||
    (value.admin1 !== undefined && typeof value.admin1 !== 'string') ||
    (value.timezone !== undefined && typeof value.timezone !== 'string')
  ) {
    throw new WeatherServiceError(
      'Resposta inválida: cidade sem identidade ou coordenadas válidas.',
    );
  }

  return {
    id: value.id,
    name: value.name,
    country: value.country,
    admin1: value.admin1,
    latitude: value.latitude,
    longitude: value.longitude,
    timezone: value.timezone,
  };
}

function isOptionalNumber(value: unknown): value is number | null | undefined {
  return value == null || (typeof value === 'number' && Number.isFinite(value));
}

function isOptionalString(value: unknown): value is string | null | undefined {
  return value == null || typeof value === 'string';
}

function isValidTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat('pt-BR', { timeZone: value });
    return true;
  } catch (error) {
    if (error instanceof RangeError) return false;
    throw error;
  }
}

function isOptionalNumberArray(value: unknown): value is (number | null)[] | undefined {
  return (
    value === undefined ||
    (Array.isArray(value) && value.every((item) => item === null || isOptionalNumber(item)))
  );
}

function isForecastResponse(value: unknown): value is ForecastResponse {
  if (
    !isRecord(value) ||
    typeof value.timezone !== 'string' ||
    !value.timezone.trim() ||
    !isValidTimeZone(value.timezone)
  ) {
    return false;
  }

  const { current, daily } = value;
  const { current_units: currentUnits, daily_units: dailyUnits } = value;
  if (
    !isRecord(current) ||
    !isRecord(daily) ||
    !isRecord(currentUnits) ||
    !isRecord(dailyUnits) ||
    currentUnits.temperature_2m !== '°C' ||
    currentUnits.wind_speed_10m !== 'km/h' ||
    dailyUnits.temperature_2m_min !== '°C' ||
    dailyUnits.temperature_2m_max !== '°C'
  ) {
    return false;
  }

  return (
    isOptionalString(current.time) &&
    isOptionalNumber(current.temperature_2m) &&
    isOptionalNumber(current.relative_humidity_2m) &&
    isOptionalNumber(current.weather_code) &&
    isOptionalNumber(current.wind_speed_10m) &&
    (daily.time === undefined ||
      (Array.isArray(daily.time) && daily.time.every((date) => typeof date === 'string'))) &&
    isOptionalNumberArray(daily.weather_code) &&
    isOptionalNumberArray(daily.temperature_2m_min) &&
    isOptionalNumberArray(daily.temperature_2m_max)
  );
}

function fetchJson(url: string, httpErrorMessage: (status: number) => string): Promise<unknown> {
  return fetchWithTimeout(url, async (response) => {
    if (!response.ok) throw new WeatherServiceError(httpErrorMessage(response.status));
    return readJson(response);
  });
}

export async function searchCities(name: string): Promise<City[]> {
  const query = name.trim();

  if (!query) {
    return [];
  }

  const data = await fetchJson(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=pt&format=json`,
    (status) => `Erro ao buscar cidades (HTTP ${status}).`,
  );

  if (!isRecord(data) || (data.results !== undefined && !Array.isArray(data.results))) {
    throw new WeatherServiceError('Resposta inválida ao buscar cidades.');
  }

  return (data.results ?? []).map(mapCity);
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
  const data = await fetchJson(
    `https://api.open-meteo.com/v1/forecast?${params}`,
    (status) => `Erro ao buscar previsão (HTTP ${status}).`,
  );

  if (!isRecord(data) || !isRecord(data.current) || !isRecord(data.daily)) {
    throw new WeatherServiceError('Resposta incompleta: current ou daily ausente.');
  }

  if (
    typeof data.timezone !== 'string' ||
    !data.timezone.trim() ||
    !isValidTimeZone(data.timezone)
  ) {
    throw new WeatherServiceError('Resposta inválida: fuso horário ausente.');
  }

  if (!isForecastResponse(data)) {
    throw new WeatherServiceError('Resposta inválida: estrutura de previsão inconsistente.');
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
