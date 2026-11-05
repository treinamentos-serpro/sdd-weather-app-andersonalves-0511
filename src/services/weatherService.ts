import type { City, CurrentWeather, ForecastDay, WeatherData } from '../types/weather';

export type WeatherServiceErrorKind =
  | 'network'
  | 'api'
  | 'timeout'
  | 'invalid-response'
  | 'cancelled';

export class WeatherServiceError extends Error {
  constructor(
    message: string,
    readonly kind: WeatherServiceErrorKind = 'invalid-response',
    readonly status?: number,
  ) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

const REQUEST_TIMEOUT_MS = 10_000;
const NETWORK_ERROR_MESSAGE =
  'Não foi possível conectar à fonte de dados. Verifique sua conexão e tente novamente.';
const TIMEOUT_ERROR_MESSAGE =
  'A consulta excedeu o limite de 10 segundos. Verifique sua conexão e tente novamente.';

interface FetchOptions {
  signal?: AbortSignal;
}

export function fetchWithTimeout(url: string, options?: FetchOptions): Promise<Response>;
export function fetchWithTimeout<T>(
  url: string,
  consumeResponse: (response: Response) => Promise<T>,
  options?: FetchOptions,
): Promise<T>;
export async function fetchWithTimeout<T>(
  url: string,
  consumeResponseOrOptions?: ((response: Response) => Promise<T>) | FetchOptions,
  options: FetchOptions = {},
): Promise<Response | T> {
  const consumeResponse =
    typeof consumeResponseOrOptions === 'function' ? consumeResponseOrOptions : undefined;
  const requestOptions =
    typeof consumeResponseOrOptions === 'function' ? options : (consumeResponseOrOptions ?? {});

  if (requestOptions.signal?.aborted) {
    throw new WeatherServiceError('A consulta foi cancelada.', 'cancelled');
  }

  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const timedOut = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      controller.abort();
      reject(new WeatherServiceError(TIMEOUT_ERROR_MESSAGE, 'timeout'));
    }, REQUEST_TIMEOUT_MS);
  });
  let cancelRequest: (() => void) | undefined;
  const cancelled = requestOptions.signal
    ? new Promise<never>((_, reject) => {
        cancelRequest = () => {
          controller.abort();
          reject(new WeatherServiceError('A consulta foi cancelada.', 'cancelled'));
        };
        requestOptions.signal?.addEventListener('abort', cancelRequest, { once: true });
      })
    : undefined;

  try {
    const request = (async () => {
      const response = await fetch(url, { signal: controller.signal });
      return consumeResponse ? consumeResponse(response) : response;
    })();

    return await Promise.race(cancelled ? [request, timedOut, cancelled] : [request, timedOut]);
  } catch (error) {
    if (error instanceof WeatherServiceError) throw error;
    if (
      typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      error.name === 'AbortError'
    ) {
      throw new WeatherServiceError('A consulta foi cancelada.', 'cancelled');
    }

    throw new WeatherServiceError(NETWORK_ERROR_MESSAGE, 'network');
  } finally {
    if (timeout !== undefined) clearTimeout(timeout);
    if (cancelRequest) requestOptions.signal?.removeEventListener('abort', cancelRequest);
  }
}

interface ForecastResponse {
  timezone: string;
  current_units: {
    temperature_2m: string;
    wind_speed_10m: string;
    precipitation: string;
    surface_pressure: string;
  };
  daily_units: {
    temperature_2m_min: string;
    temperature_2m_max: string;
    precipitation_probability_max: string;
  };
  current?: {
    time?: string | null;
    temperature_2m?: number | null;
    relative_humidity_2m?: number | null;
    weather_code?: number | null;
    wind_speed_10m?: number | null;
    precipitation?: number | null;
    surface_pressure?: number | null;
  } | null;
  daily?: {
    time?: string[];
    weather_code?: (number | null)[];
    temperature_2m_min?: (number | null)[];
    temperature_2m_max?: (number | null)[];
    precipitation_probability_max?: (number | null)[];
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
    (value.admin1 != null && typeof value.admin1 !== 'string') ||
    (value.timezone != null && typeof value.timezone !== 'string')
  ) {
    throw new WeatherServiceError(
      'Resposta inválida: cidade sem identidade ou coordenadas válidas.',
    );
  }

  return {
    id: value.id,
    name: value.name,
    country: value.country,
    latitude: value.latitude,
    longitude: value.longitude,
    ...(typeof value.admin1 === 'string' ? { admin1: value.admin1 } : {}),
    ...(typeof value.timezone === 'string' ? { timezone: value.timezone } : {}),
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

function isOptionalNumberArray(value: unknown): value is (number | null)[] | null | undefined {
  return (
    value == null ||
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
    currentUnits.precipitation !== 'mm' ||
    currentUnits.surface_pressure !== 'hPa' ||
    dailyUnits.temperature_2m_min !== '°C' ||
    dailyUnits.temperature_2m_max !== '°C' ||
    dailyUnits.precipitation_probability_max !== '%'
  ) {
    return false;
  }

  return (
    isOptionalString(current.time) &&
    isOptionalNumber(current.temperature_2m) &&
    isOptionalNumber(current.relative_humidity_2m) &&
    isOptionalNumber(current.weather_code) &&
    isOptionalNumber(current.wind_speed_10m) &&
    isOptionalNumber(current.precipitation) &&
    isOptionalNumber(current.surface_pressure) &&
    (daily.time === undefined ||
      (Array.isArray(daily.time) && daily.time.every((date) => typeof date === 'string'))) &&
    isOptionalNumberArray(daily.weather_code) &&
    isOptionalNumberArray(daily.temperature_2m_min) &&
    isOptionalNumberArray(daily.temperature_2m_max) &&
    isOptionalNumberArray(daily.precipitation_probability_max)
  );
}

function fetchJson(
  url: string,
  operation: 'cities' | 'forecast',
  signal?: AbortSignal,
): Promise<unknown> {
  return fetchWithTimeout(
    url,
    async (response) => {
      if (!response.ok) {
        const message =
          response.status === 429
            ? 'A fonte de dados está recebendo muitas consultas. Aguarde um pouco e tente novamente.'
            : response.status >= 500
              ? 'A fonte de dados está temporariamente indisponível. Tente novamente em instantes.'
              : operation === 'cities'
                ? 'Não foi possível buscar cidades agora. Tente novamente.'
                : 'Não foi possível carregar a previsão agora. Tente novamente.';
        throw new WeatherServiceError(message, 'api', response.status);
      }
      return readJson(response);
    },
    { signal },
  );
}

export async function searchCities(name: string, signal?: AbortSignal): Promise<City[]> {
  const query = name.trim();

  if (!query) {
    return [];
  }

  const data = await fetchJson(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=pt&format=json`,
    'cities',
    signal,
  );

  if (!isRecord(data) || (data.results != null && !Array.isArray(data.results))) {
    throw new WeatherServiceError('Resposta inválida ao buscar cidades.');
  }

  return (data.results ?? []).map(mapCity);
}

export async function getWeather(city: City, signal?: AbortSignal): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation,surface_pressure',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'auto',
    forecast_days: '5',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    timeformat: 'iso8601',
  });
  const data = await fetchJson(
    `https://api.open-meteo.com/v1/forecast?${params}`,
    'forecast',
    signal,
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
    precipitationMm: current.precipitation ?? null,
    pressureHpa: current.surface_pressure ?? null,
    observedAtLocal: current.time ?? null,
  };
  const forecast: ForecastDay[] = daily.time.slice(0, 5).map((date, index) => ({
    date,
    weatherCode: daily.weather_code?.[index] ?? null,
    temperatureMinC: daily.temperature_2m_min?.[index] ?? null,
    temperatureMaxC: daily.temperature_2m_max?.[index] ?? null,
    precipitationProbability: daily.precipitation_probability_max?.[index] ?? null,
  }));

  return { city, timezone: data.timezone, current: currentWeather, forecast };
}
