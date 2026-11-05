import { afterEach, describe, expect, it, vi } from 'vitest';
import { searchCities, WeatherServiceError } from '../../src/services/weatherService';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('searchCities', () => {
  it.each(['', '   ', '\t\n'])('retorna vazio sem consultar a rede para %j', async (name) => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities(name)).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('codifica o nome aparado e mapeia somente os campos de City', async () => {
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

    await expect(searchCities('  São Paulo & região  ')).resolves.toEqual([city]);
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      'https://geocoding-api.open-meteo.com/v1/search?name=S%C3%A3o%20Paulo%20%26%20regi%C3%A3o&count=10&language=pt&format=json',
    );
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

  it.each([{}, { results: [] }])('retorna vazio quando não há resultados: %j', async (payload) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(payload))));

    await expect(searchCities('Inexistente')).resolves.toEqual([]);
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
