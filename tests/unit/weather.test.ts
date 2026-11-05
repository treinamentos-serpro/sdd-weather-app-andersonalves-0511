import { describe, expect, expectTypeOf, it } from 'vitest';
import { MOCK_WEATHER } from '../../src/mocks/weather';
import type { City, CurrentWeather, ForecastDay, Unit, WeatherData } from '../../src/types/weather';

describe('contratos de clima', () => {
  it('representa unidades, campos opcionais e dados indisponíveis conforme o plano', () => {
    expectTypeOf<Unit>().toEqualTypeOf<'celsius' | 'fahrenheit'>();
    expectTypeOf<City['admin1']>().toEqualTypeOf<string | undefined>();
    expectTypeOf<City['timezone']>().toEqualTypeOf<string | undefined>();
    expectTypeOf<CurrentWeather>().toEqualTypeOf<{
      temperatureC: number | null;
      weatherCode: number | null;
      relativeHumidity: number | null;
      windSpeedKmh: number | null;
      precipitationMm?: number | null;
      pressureHpa?: number | null;
      observedAtLocal: string | null;
    }>();
    expectTypeOf<ForecastDay>().toEqualTypeOf<{
      date: string;
      weatherCode: number | null;
      temperatureMinC: number | null;
      temperatureMaxC: number | null;
    }>();
    expectTypeOf(MOCK_WEATHER).toEqualTypeOf<WeatherData>();
  });
});

describe('MOCK_WEATHER', () => {
  it('fornece cidade, fuso e clima atual completos sem consultar a API', () => {
    expect(MOCK_WEATHER.city.name).toBe('São Paulo');
    expect(MOCK_WEATHER.timezone).toBe(MOCK_WEATHER.city.timezone);
    expect(
      () => new Intl.DateTimeFormat('pt-BR', { timeZone: MOCK_WEATHER.timezone }),
    ).not.toThrow();
    expect(MOCK_WEATHER.current).toEqual({
      temperatureC: 26.4,
      weatherCode: 2,
      relativeHumidity: 65,
      windSpeedKmh: 12.6,
      precipitationMm: 0,
      pressureHpa: 1015,
      observedAtLocal: '2026-01-10T12:00',
    });
  });

  it('inclui exatamente cinco datas locais consecutivas a partir do dia da observação', () => {
    const dates = MOCK_WEATHER.forecast.map((day) => day.date);

    expect(MOCK_WEATHER.forecast).toHaveLength(5);
    expect(dates).toEqual(['2026-01-10', '2026-01-11', '2026-01-12', '2026-01-13', '2026-01-14']);
    expect(dates[0]).toBe(MOCK_WEATHER.current.observedAtLocal?.split('T')[0]);
  });

  it('fornece mínimas, máximas e códigos WMO variados para desenvolver a UI', () => {
    for (const day of MOCK_WEATHER.forecast) {
      expect(day.temperatureMinC).toEqual(expect.any(Number));
      expect(day.temperatureMaxC).toEqual(expect.any(Number));
      expect(
        day.temperatureMinC !== null &&
          day.temperatureMaxC !== null &&
          day.temperatureMinC <= day.temperatureMaxC,
      ).toBe(true);
      expect([0, 1, 2, 3, 61]).toContain(day.weatherCode);
    }

    expect(new Set(MOCK_WEATHER.forecast.map((day) => day.weatherCode)).size).toBe(5);
  });
});
