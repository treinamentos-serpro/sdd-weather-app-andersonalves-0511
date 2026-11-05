import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useWeather } from '../../src/hooks/useWeather';
import { MOCK_WEATHER } from '../../src/mocks/weather';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City, WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../src/services/weatherService')>();
  return { ...original, searchCities: vi.fn(), getWeather: vi.fn() };
});

function deferred<Value>() {
  let resolve!: (value: Value) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<Value>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

const city = MOCK_WEATHER.city;
const otherCity: City = { ...city, id: 2, name: 'Outra cidade', latitude: 38, longitude: -9 };
const otherWeather: WeatherData = { ...MOCK_WEATHER, city: otherCity };

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(searchCities).mockResolvedValue([city, otherCity]);
  vi.mocked(getWeather).mockResolvedValue(MOCK_WEATHER);
});

afterEach(cleanup);

describe('useWeather', () => {
  it('inicia idle sem dados, erro ou chamadas de serviço e retry não faz nada', async () => {
    const { result } = renderHook(() => useWeather());

    expect(result.current).toMatchObject({
      status: 'idle',
      data: null,
      cities: [],
      error: null,
      query: '',
    });
    await act(() => result.current.retry());
    expect(searchCities).not.toHaveBeenCalled();
    expect(getWeather).not.toHaveBeenCalled();
  });

  it.each(['', '  ', '\t\n'])('ignora busca vazia %j sem chamar serviços', async (name) => {
    const { result } = renderHook(() => useWeather());

    await act(() => result.current.search(name));

    expect(result.current.status).toBe('idle');
    expect(searchCities).not.toHaveBeenCalled();
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('inicia loading, apara o termo e carrega automaticamente a primeira cidade', async () => {
    const pending = deferred<City[]>();
    vi.mocked(searchCities).mockReturnValueOnce(pending.promise);
    const { result } = renderHook(() => useWeather());
    let request!: Promise<void>;

    act(() => {
      request = result.current.search('  São Paulo  ');
    });

    expect(result.current.status).toBe('loading');
    expect(result.current.query).toBe('São Paulo');
    expect(searchCities).toHaveBeenCalledExactlyOnceWith('São Paulo');
    expect(getWeather).not.toHaveBeenCalled();

    await act(async () => {
      pending.resolve([city, otherCity]);
      await request;
    });

    expect(getWeather).toHaveBeenCalledExactlyOnceWith(city);
    expect(result.current).toMatchObject({
      status: 'success',
      data: MOCK_WEATHER,
      cities: [city, otherCity],
      error: null,
    });
  });

  it('mantém loading entre os resultados e a conclusão do forecast', async () => {
    const pending = deferred<WeatherData>();
    vi.mocked(getWeather).mockReturnValueOnce(pending.promise);
    const { result } = renderHook(() => useWeather());
    let request!: Promise<void>;

    await act(async () => {
      request = result.current.search('São Paulo');
    });

    expect(result.current).toMatchObject({
      status: 'loading',
      cities: [city, otherCity],
      data: null,
    });

    await act(async () => {
      pending.resolve(MOCK_WEATHER);
      await request;
    });
    expect(result.current.status).toBe('success');
  });

  it('retorna empty sem consultar forecast e limpa dados da busca anterior', async () => {
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search('São Paulo'));
    vi.mocked(searchCities).mockResolvedValueOnce([]);
    vi.mocked(getWeather).mockClear();

    await act(() => result.current.search('Inexistente'));

    expect(result.current).toMatchObject({
      status: 'empty',
      data: null,
      cities: [],
      error: null,
      query: 'Inexistente',
    });
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('seleciona outra cidade sem repetir geocodificação e preserva as opções', async () => {
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search('São Paulo'));
    vi.mocked(getWeather).mockResolvedValueOnce(otherWeather);

    await act(() => result.current.selectCity(otherCity));

    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(getWeather).toHaveBeenLastCalledWith(otherCity);
    expect(result.current).toMatchObject({
      status: 'success',
      data: otherWeather,
      cities: [city, otherCity],
      query: 'São Paulo',
    });
  });

  it('expõe erro de busca e retry repete o termo uma vez sem tentativa automática', async () => {
    vi.mocked(searchCities).mockRejectedValueOnce(new WeatherServiceError('Falha de rede.'));
    const { result } = renderHook(() => useWeather());

    await act(() => result.current.search('  São Paulo  '));

    expect(result.current).toMatchObject({ status: 'error', error: 'Falha de rede.', data: null });
    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(getWeather).not.toHaveBeenCalled();

    await act(() => result.current.retry());

    expect(searchCities).toHaveBeenCalledTimes(2);
    expect(searchCities).toHaveBeenLastCalledWith('São Paulo');
    expect(result.current).toMatchObject({ status: 'success', error: null });
  });

  it('retry de forecast automático repete apenas o clima e mantém as cidades', async () => {
    vi.mocked(getWeather).mockRejectedValueOnce(
      new WeatherServiceError('A requisição demorou demais.'),
    );
    const { result } = renderHook(() => useWeather());

    await act(() => result.current.search('São Paulo'));

    expect(result.current).toMatchObject({
      status: 'error',
      cities: [city, otherCity],
      error: 'A requisição demorou demais.',
      data: null,
    });
    expect(getWeather).toHaveBeenCalledTimes(1);

    await act(() => result.current.retry());

    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(getWeather).toHaveBeenCalledTimes(2);
    expect(getWeather).toHaveBeenLastCalledWith(city);
    expect(result.current).toMatchObject({ status: 'success', error: null });
  });

  it('retry repete a cidade selecionada que falhou', async () => {
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search('São Paulo'));
    vi.mocked(getWeather).mockRejectedValueOnce(new Error('Erro HTTP'));
    await act(() => result.current.selectCity(otherCity));
    vi.mocked(getWeather).mockResolvedValueOnce(otherWeather);

    await act(() => result.current.retry());

    expect(getWeather).toHaveBeenLastCalledWith(otherCity);
    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(result.current.data).toBe(otherWeather);
  });

  it('ignora resultado de busca obsoleta sem iniciar seu forecast', async () => {
    const pending = deferred<City[]>();
    vi.mocked(searchCities).mockReturnValueOnce(pending.promise);
    const { result } = renderHook(() => useWeather());
    let oldRequest!: Promise<void>;
    act(() => {
      oldRequest = result.current.search('Antiga');
    });
    await act(() => result.current.search('Nova'));

    await act(async () => {
      pending.resolve([otherCity]);
      await oldRequest;
    });

    expect(result.current).toMatchObject({ status: 'success', query: 'Nova', data: MOCK_WEATHER });
    expect(getWeather).toHaveBeenCalledExactlyOnceWith(city);
  });

  it.each(['success', 'error'])('ignora forecast obsoleto que termina em %s', async (outcome) => {
    const pending = deferred<WeatherData>();
    vi.mocked(getWeather).mockReturnValueOnce(pending.promise).mockResolvedValueOnce(otherWeather);
    const { result } = renderHook(() => useWeather());
    let oldRequest!: Promise<void>;
    act(() => {
      oldRequest = result.current.selectCity(city);
    });
    await act(() => result.current.selectCity(otherCity));

    await act(async () => {
      if (outcome === 'success') pending.resolve(MOCK_WEATHER);
      else pending.reject(new Error('Erro antigo'));
      await oldRequest;
    });

    expect(result.current).toMatchObject({ status: 'success', data: otherWeather, error: null });
  });

  it('não inicia forecast se a busca terminar após desmontagem', async () => {
    const pending = deferred<City[]>();
    vi.mocked(searchCities).mockReturnValueOnce(pending.promise);
    const { result, unmount } = renderHook(() => useWeather());
    let request!: Promise<void>;
    act(() => {
      request = result.current.search('São Paulo');
    });
    unmount();

    pending.resolve([city]);
    await request;

    expect(getWeather).not.toHaveBeenCalled();
  });
});
