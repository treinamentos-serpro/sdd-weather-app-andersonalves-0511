import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { MOCK_WEATHER } from '../../src/mocks/weather';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../src/services/weatherService')>();
  return { ...original, searchCities: vi.fn(), getWeather: vi.fn() };
});

describe('App com useWeather', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(searchCities).mockResolvedValue([MOCK_WEATHER.city]);
    vi.mocked(getWeather).mockResolvedValue(MOCK_WEATHER);
    render(<App />);
  });

  afterEach(cleanup);

  function search(city: string) {
    fireEvent.change(screen.getByRole('textbox', { name: 'Cidade' }), { target: { value: city } });
    fireEvent.submit(screen.getByRole('search'));
  }

  it('renderiza idle, busca, unidade e fonte sem consultar os serviços', () => {
    expect(
      within(screen.getByRole('banner')).getByRole('heading', { name: 'WeatherView' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '°C' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(screen.getByRole('main')).getByRole('status')).toHaveTextContent(
      'Consulte o clima',
    );
    expect(screen.getByRole('link', { name: 'Open-Meteo' })).toHaveAttribute(
      'href',
      'https://open-meteo.com/',
    );
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByText(/Demonstração|Dados fictícios/)).not.toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    expect(searchCities).not.toHaveBeenCalled();
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('mostra loading imediato e usa a unidade de UI em todos os componentes', async () => {
    fireEvent.click(screen.getByRole('button', { name: '°F' }));
    search('  São Paulo  ');
    expect(screen.getByRole('status')).toHaveTextContent('Carregando dados do clima');
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('textbox', { name: 'Cidade' })).toBeDisabled();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();

    const region = await screen.findByRole('region', { name: 'São Paulo' });

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'false');
    expect(screen.getByRole('textbox', { name: 'Cidade' })).toBeEnabled();
    expect(region).toHaveTextContent('79,5 °F');
    expect(screen.getAllByRole('article')).toHaveLength(5);
    expect(within(screen.getByRole('main')).getAllByText(/°F$/)).toHaveLength(11);
    expect(within(screen.getByRole('main')).queryByText(/°C$/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '°C' }));
    expect(region).toHaveTextContent('26,4 °C');
    expect(within(screen.getByRole('main')).getAllByText(/°C$/)).toHaveLength(11);
    expect(searchCities).toHaveBeenCalledExactlyOnceWith('São Paulo', expect.any(AbortSignal));
    expect(getWeather).toHaveBeenCalledExactlyOnceWith(MOCK_WEATHER.city, expect.any(AbortSignal));
  });

  it('permite trocar unidade durante loading sem reiniciar a consulta', async () => {
    let resolve!: (data: WeatherData) => void;
    vi.mocked(getWeather).mockReturnValueOnce(
      new Promise((done) => {
        resolve = done;
      }),
    );
    await act(async () => {
      search('São Paulo');
    });

    fireEvent.click(screen.getByRole('button', { name: '°F' }));
    await act(async () => {
      resolve(MOCK_WEATHER);
    });

    expect(screen.getByRole('region', { name: 'São Paulo' })).toHaveTextContent('79,5 °F');
    expect(getWeather).toHaveBeenCalledTimes(1);
  });

  it('mostra empty sem forecast e permite nova busca sem perder a unidade', async () => {
    vi.mocked(searchCities).mockResolvedValueOnce([]);
    fireEvent.click(screen.getByRole('button', { name: '°F' }));
    search('Inexistente');

    expect(await screen.findByText('Nenhuma cidade encontrada')).toBeInTheDocument();
    expect(getWeather).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox', { name: 'Cidade' })).toHaveValue('Inexistente');
    expect(screen.getByRole('textbox', { name: 'Cidade' })).toBeEnabled();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    search('São Paulo');

    expect(await screen.findByRole('region', { name: 'São Paulo' })).toHaveTextContent('79,5 °F');
  });

  it('renderiza os dados retornados em vez de uma cidade fixa do mock', async () => {
    const city = { ...MOCK_WEATHER.city, id: 2, name: 'Lisboa', country: 'Portugal' };
    vi.mocked(searchCities).mockResolvedValueOnce([city]);
    vi.mocked(getWeather).mockResolvedValueOnce({
      ...MOCK_WEATHER,
      city,
      current: { ...MOCK_WEATHER.current, temperatureC: 10 },
      forecast: MOCK_WEATHER.forecast.map((day) => ({ ...day, temperatureMaxC: 12 })),
    });

    search('Lisboa');

    expect(await screen.findByRole('region', { name: 'Lisboa' })).toHaveTextContent('10,0 °C');
    expect(within(screen.getByRole('main')).getAllByText('12,0 °C')).toHaveLength(5);
    expect(screen.queryByRole('region', { name: 'São Paulo' })).not.toBeInTheDocument();
  });

  it('mostra a mensagem do serviço e retry repete a busca original', async () => {
    const networkMessage =
      'Não foi possível conectar à fonte de dados. Verifique sua conexão e tente novamente.';
    vi.mocked(searchCities).mockRejectedValueOnce(
      new WeatherServiceError(networkMessage, 'network'),
    );
    search('São Paulo');

    expect(await screen.findByRole('alert')).toHaveTextContent(networkMessage);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox', { name: 'Cidade' }), {
      target: { value: 'Lisboa' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByRole('region', { name: 'São Paulo' })).toBeInTheDocument();
    expect(searchCities).toHaveBeenCalledTimes(2);
    expect(searchCities).toHaveBeenLastCalledWith('São Paulo', expect.any(AbortSignal));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('retry de erro no forecast repete apenas o clima e mantém a unidade', async () => {
    const timeoutMessage =
      'A consulta excedeu o limite de 10 segundos. Verifique sua conexão e tente novamente.';
    vi.mocked(getWeather).mockRejectedValueOnce(new WeatherServiceError(timeoutMessage, 'timeout'));
    fireEvent.click(screen.getByRole('button', { name: '°F' }));
    search('São Paulo');

    expect(await screen.findByRole('alert')).toHaveTextContent(timeoutMessage);
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByRole('region', { name: 'São Paulo' })).toHaveTextContent('79,5 °F');
    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(getWeather).toHaveBeenCalledTimes(2);
  });

  it.each(['', '   '])('não inicia loading nem chama serviços para %j', (query) => {
    search(query);
    expect(screen.getByRole('alert')).toHaveTextContent('Informe o nome de uma cidade.');
    expect(screen.getByRole('status')).toHaveTextContent('Consulte o clima');
    expect(searchCities).not.toHaveBeenCalled();
    expect(getWeather).not.toHaveBeenCalled();
  });
});
