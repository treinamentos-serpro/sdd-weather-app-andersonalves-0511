import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  fetchWithTimeout,
  getWeather,
  searchCities,
  WeatherServiceError,
} from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('fetchWithTimeout', () => {
  it('retorna a resposta e limpa o timer no sucesso', async () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const response = new Response('{}');
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchWithTimeout('https://api.open-meteo.com/')).resolves.toBe(response);

    expect(fetchMock).toHaveBeenCalledExactlyOnceWith('https://api.open-meteo.com/', {
      signal: expect.any(AbortSignal),
    });
    expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('aborta exatamente em 10 segundos com uma mensagem clara de timeout', async () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const fetchMock = vi.fn((_url: string, options: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        options.signal?.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'));
        });
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const request = fetchWithTimeout('https://api.open-meteo.com/');
    const rejection = expect(request).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'timeout',
      message:
        'A consulta excedeu o limite de 10 segundos. Verifique sua conexão e tente novamente.',
    });

    await vi.advanceTimersByTimeAsync(9_999);
    expect(fetchMock.mock.calls[0][1].signal?.aborted).toBe(false);
    expect(vi.getTimerCount()).toBe(1);

    await vi.advanceTimersByTimeAsync(1);
    await rejection;
    expect(fetchMock.mock.calls[0][1].signal?.aborted).toBe(true);
    expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('simula rede offline com fetch rejeitado e retorna uma mensagem amigável', async () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(fetchWithTimeout('https://api.open-meteo.com/')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'network',
      message:
        'Não foi possível conectar à fonte de dados. Verifique sua conexão e tente novamente.',
    });
    expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('não classifica um cancelamento explícito como timeout', async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const fetchMock = vi.fn((_url: string, options: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        options.signal?.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'));
        });
      });
    });
    vi.stubGlobal('fetch', fetchMock);
    const request = fetchWithTimeout('https://api.open-meteo.com/', {
      signal: controller.signal,
    });

    const rejection = expect(request).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'cancelled',
    });
    controller.abort();
    await rejection;
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('searchCities', () => {
  it.each(['', '   ', '\t\n'])('retorna vazio sem consultar a rede para %j', async (name) => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities(name)).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('codifica e decodifica Unicode, apóstrofo, hífen e ampersand no nome', async () => {
    const city = {
      id: 3448439,
      name: 'São Paulo',
      country: 'Brasil',
      admin1: 'São Paulo',
      latitude: -23.5475,
      longitude: -46.63611,
      timezone: 'America/Sao_Paulo',
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ results: [{ ...city, country_code: 'BR' }] })),
      );
    vi.stubGlobal('fetch', fetchMock);

    const query = "São João-d'Aliança & região";
    await expect(searchCities(`  ${query}  `)).resolves.toEqual([city]);
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      "https://geocoding-api.open-meteo.com/v1/search?name=S%C3%A3o%20Jo%C3%A3o-d'Alian%C3%A7a%20%26%20regi%C3%A3o&count=10&language=pt&format=json",
      { signal: expect.any(AbortSignal) },
    );
    expect(new URL(fetchMock.mock.calls[0][0]).searchParams.get('name')).toBe(query);
  });

  it('preserva cidades sem região ou fuso opcionais', async () => {
    const cities = [
      { id: 1, name: 'Cidade A', country: 'Brasil', latitude: -23, longitude: -46 },
      { id: 2, name: 'Cidade B', country: 'Portugal', latitude: 38, longitude: -9 },
    ];
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ results: cities }))),
    );

    await expect(searchCities('Cidade')).resolves.toEqual(cities);
  });

  it('normaliza região e fuso nulos como campos opcionais ausentes', async () => {
    const city = { id: 1, name: 'Cidade', country: 'Brasil', latitude: -23, longitude: -46 };
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ results: [{ ...city, admin1: null, timezone: null }] })),
        ),
    );

    await expect(searchCities('Cidade')).resolves.toEqual([city]);
  });

  it.each([
    {},
    { results: [] },
    { results: null },
  ])('retorna vazio quando não há resultados: %j', async (payload) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(payload))));

    await expect(searchCities('Inexistente')).resolves.toEqual([]);
  });

  it('rejeita JSON inválido como erro do serviço', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockRejectedValue(new SyntaxError('JSON inválido')),
      }),
    );

    await expect(searchCities('São Paulo')).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it.each([
    { results: {} },
    { results: 'inválido' },
  ])('rejeita uma propriedade results malformada: %j', async (payload) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(payload))));

    await expect(searchCities('São Paulo')).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('rejeita uma cidade sem coordenadas válidas', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({ results: [{ id: 1, name: 'Cidade' }] }))),
    );

    await expect(searchCities('Cidade')).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it.each([
    400, 429, 500,
  ])('lança WeatherServiceError para HTTP %i sem ler o corpo', async (status) => {
    const json = vi.fn();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status, json }));

    await expect(searchCities('São Paulo')).rejects.toThrow(WeatherServiceError);
    expect(json).not.toHaveBeenCalled();
  });
});

describe('getWeather', () => {
  const city: City = {
    id: 3448439,
    name: 'São Paulo',
    country: 'Brasil',
    latitude: -23.5475,
    longitude: -46.63611,
    timezone: 'America/Sao_Paulo',
  };
  const payload = {
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
      temperature_2m: 26.4,
      relative_humidity_2m: 65,
      weather_code: 3,
      wind_speed_10m: 12.5,
      precipitation: 0.2,
      surface_pressure: 1015,
    },
    daily: {
      time: ['2026-01-10', '2026-01-11', '2026-01-12', '2026-01-13', '2026-01-14'],
      weather_code: [3, 61, 2, 1, 0],
      temperature_2m_min: [20, 19.8, 20.1, 21, 21.4],
      temperature_2m_max: [28, 27.1, 29.2, 30, 31.3],
      precipitation_probability_max: [40, 20, 60, 10, 0],
    },
  };

  it('consulta as coordenadas selecionadas e mapeia current e os arrays paralelos', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(payload)));
    vi.stubGlobal('fetch', fetchMock);

    const weather = await getWeather(city);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.origin + url.pathname).toBe('https://api.open-meteo.com/v1/forecast');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      latitude: '-23.5475',
      longitude: '-46.63611',
      current:
        'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation,surface_pressure',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
      timezone: 'auto',
      forecast_days: '5',
      temperature_unit: 'celsius',
      wind_speed_unit: 'kmh',
      timeformat: 'iso8601',
    });
    expect(weather.city).toBe(city);
    expect(weather.timezone).toBe(payload.timezone);
    expect(weather.current).toEqual({
      temperatureC: 26.4,
      relativeHumidity: 65,
      weatherCode: 3,
      windSpeedKmh: 12.5,
      precipitationMm: 0.2,
      pressureHpa: 1015,
      observedAtLocal: '2026-01-10T12:00',
    });
    expect(weather.forecast).toEqual([
      {
        date: '2026-01-10',
        weatherCode: 3,
        temperatureMinC: 20,
        temperatureMaxC: 28,
        precipitationProbability: 40,
      },
      {
        date: '2026-01-11',
        weatherCode: 61,
        temperatureMinC: 19.8,
        temperatureMaxC: 27.1,
        precipitationProbability: 20,
      },
      {
        date: '2026-01-12',
        weatherCode: 2,
        temperatureMinC: 20.1,
        temperatureMaxC: 29.2,
        precipitationProbability: 60,
      },
      {
        date: '2026-01-13',
        weatherCode: 1,
        temperatureMinC: 21,
        temperatureMaxC: 30,
        precipitationProbability: 10,
      },
      {
        date: '2026-01-14',
        weatherCode: 0,
        temperatureMinC: 21.4,
        temperatureMaxC: 31.3,
        precipitationProbability: 0,
      },
    ]);
  });

  it('aplica o timeout até a leitura do corpo da resposta', async () => {
    vi.useFakeTimers();
    let signal: AbortSignal | undefined;
    const fetchMock = vi.fn((_url: string, options: RequestInit) => {
      signal = options.signal ?? undefined;
      return Promise.resolve({
        ok: true,
        json: () => new Promise<never>(() => {}),
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const request = getWeather(city);
    const rejection = expect(request).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'timeout',
      message:
        'A consulta excedeu o limite de 10 segundos. Verifique sua conexão e tente novamente.',
    });

    await vi.advanceTimersByTimeAsync(9_999);
    expect(signal?.aborted).toBe(false);
    expect(vi.getTimerCount()).toBe(1);

    await vi.advanceTimersByTimeAsync(1);
    await rejection;
    expect(signal?.aborted).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('limita a previsão a cinco itens quando a API retorna datas extras', async () => {
    const daily = { ...payload.daily, time: [...payload.daily.time, '2026-01-15'] };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ ...payload, daily }))),
    );

    const weather = await getWeather(city);

    expect(weather.forecast).toHaveLength(5);
    expect(weather.forecast[4].date).toBe('2026-01-14');
  });

  it('preserva zero e campos ausentes ou nulos sem deslocar os índices', async () => {
    const partial = {
      ...payload,
      current: {
        temperature_2m: 0,
        relative_humidity_2m: null,
        precipitation: null,
        surface_pressure: null,
      },
      daily: {
        time: payload.daily.time,
        weather_code: [0, null, 61],
        temperature_2m_min: [0],
        precipitation_probability_max: null,
      },
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(partial))));

    const weather = await getWeather(city);

    expect(weather.current).toEqual({
      temperatureC: 0,
      relativeHumidity: null,
      weatherCode: null,
      windSpeedKmh: null,
      precipitationMm: null,
      pressureHpa: null,
      observedAtLocal: null,
    });
    expect(weather.forecast).toEqual([
      {
        date: '2026-01-10',
        weatherCode: 0,
        temperatureMinC: 0,
        temperatureMaxC: null,
        precipitationProbability: null,
      },
      {
        date: '2026-01-11',
        weatherCode: null,
        temperatureMinC: null,
        temperatureMaxC: null,
        precipitationProbability: null,
      },
      {
        date: '2026-01-12',
        weatherCode: 61,
        temperatureMinC: null,
        temperatureMaxC: null,
        precipitationProbability: null,
      },
      {
        date: '2026-01-13',
        weatherCode: null,
        temperatureMinC: null,
        temperatureMaxC: null,
        precipitationProbability: null,
      },
      {
        date: '2026-01-14',
        weatherCode: null,
        temperatureMinC: null,
        temperatureMaxC: null,
        precipitationProbability: null,
      },
    ]);
  });

  it.each([
    {},
    { daily: payload.daily },
    { current: payload.current },
    { current: null, daily: payload.daily },
    { current: payload.current, daily: null },
    null,
  ])('rejeita resposta sem current ou daily: %j', async (incomplete) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(incomplete))));

    await expect(getWeather(city)).rejects.toThrow(WeatherServiceError);
  });

  it.each([undefined, [], ['2026-01-10']])('rejeita datas insuficientes: %j', async (time) => {
    const incomplete = { ...payload, daily: { ...payload.daily, time } };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(incomplete))));

    await expect(getWeather(city)).rejects.toThrow(WeatherServiceError);
  });

  it('rejeita JSON inválido como erro do serviço', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockRejectedValue(new SyntaxError('JSON inválido')),
      }),
    );

    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it.each([
    undefined,
    null,
    '',
    'Mars/Olympus',
  ])('rejeita timezone inválido: %s', async (timezone) => {
    const invalid = { ...payload, timezone };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(invalid))));

    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it.each([
    { current: { ...payload.current, temperature_2m: '0' } },
    { daily: { ...payload.daily, temperature_2m_min: 'inválido' } },
    { daily: { ...payload.daily, time: [null, ...payload.daily.time.slice(1)] } },
    { current_units: { ...payload.current_units, temperature_2m: '°F' } },
    { daily_units: { ...payload.daily_units, temperature_2m_max: '°F' } },
  ])('rejeita tipos inconsistentes na resposta: %j', async (invalidFields) => {
    const invalid = { ...payload, ...invalidFields };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(invalid))));

    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it.each([429, 500])('rejeita HTTP %i com erro tipado sem ler o corpo', async (status) => {
    const json = vi.fn();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status, json }));

    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'api',
      status,
      message:
        status === 429
          ? 'A fonte de dados está recebendo muitas consultas. Aguarde um pouco e tente novamente.'
          : 'A fonte de dados está temporariamente indisponível. Tente novamente em instantes.',
    });
    expect(json).not.toHaveBeenCalled();
  });
});
