import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import CurrentWeather from '../../src/components/CurrentWeather';
import UnitToggle from '../../src/components/UnitToggle';
import { getWeatherCondition } from '../../src/lib/weatherCodes';
import { MOCK_WEATHER } from '../../src/mocks/weather';
import type { CurrentWeather as CurrentWeatherData } from '../../src/types/weather';
import type { Unit } from '../../src/types/weather';

const { city, current } = MOCK_WEATHER;

describe('CurrentWeather', () => {
  it('apresenta cidade, condição, ícone decorativo e todas as métricas', () => {
    render(<CurrentWeather city={city} current={current} unit="celsius" />);

    expect(screen.getByRole('region', { name: 'São Paulo' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'São Paulo' })).toBeInTheDocument();
    expect(screen.getByText('São Paulo, Brasil')).toBeInTheDocument();
    expect(screen.getByText('26,4 °C')).toBeInTheDocument();
    expect(screen.getByText('Parcialmente nublado')).toBeInTheDocument();
    expect(screen.getByText(getWeatherCondition(2).icon)).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Umidade').parentElement).toHaveTextContent('65 %');
    expect(screen.getByText('Vento').parentElement).toHaveTextContent('12,6 km/h');
    expect(screen.getByText('Precipitação').parentElement).toHaveTextContent('0 mm');
    expect(screen.getByText('Pressão').parentElement).toHaveTextContent('1.015 hPa');
    expect(screen.getByText('10/01/2026 às 12:00')).toHaveAttribute('datetime', '2026-01-10T12:00');
    expect(screen.getByText(/horário local/)).toBeInTheDocument();
  });

  it('deriva a temperatura das props ao alternar a unidade, sem alterar os dados', () => {
    const data = Object.freeze({ ...current, temperatureC: 0 });
    const { rerender } = render(<CurrentWeather city={city} current={data} unit="celsius" />);
    expect(screen.getByText('0,0 °C')).toBeInTheDocument();

    rerender(<CurrentWeather city={city} current={data} unit="fahrenheit" />);
    expect(screen.getByText('32,0 °F')).toBeInTheDocument();
    expect(screen.getByText('Vento').parentElement).toHaveTextContent('12,6 km/h');

    rerender(<CurrentWeather city={city} current={data} unit="celsius" />);
    expect(screen.getByText('0,0 °C')).toBeInTheDocument();
    expect(data.temperatureC).toBe(0);
  });

  it('converte 0 °C para Fahrenheit ao selecionar °F', async () => {
    const user = userEvent.setup();

    function WeatherWithUnitToggle() {
      const [unit, setUnit] = useState<Unit>('celsius');

      return (
        <>
          <UnitToggle unit={unit} onChange={setUnit} />
          <CurrentWeather city={city} current={{ ...current, temperatureC: 0 }} unit={unit} />
        </>
      );
    }

    render(<WeatherWithUnitToggle />);
    expect(screen.getByText('0,0 °C')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '°F' }));

    expect(screen.getByText('32,0 °F')).toBeInTheDocument();
  });

  it.each<keyof CurrentWeatherData>([
    'temperatureC',
    'weatherCode',
    'relativeHumidity',
    'windSpeedKmh',
    'precipitationMm',
    'pressureHpa',
    'observedAtLocal',
  ])('representa %s nulo sem esconder os outros dados', (field) => {
    render(<CurrentWeather city={city} current={{ ...current, [field]: null }} unit="celsius" />);
    expect(screen.getAllByText(/Indisponível/)).toHaveLength(1);
    expect(screen.getByRole('heading', { name: 'São Paulo' })).toBeInTheDocument();
    if (field !== 'temperatureC') expect(screen.getByText('26,4 °C')).toBeInTheDocument();
    if (field !== 'relativeHumidity') expect(screen.getByText('65 %')).toBeInTheDocument();
    if (field !== 'weatherCode')
      expect(screen.getByText('Parcialmente nublado')).toBeInTheDocument();
  });

  it.each([
    {},
    { precipitationMm: undefined, pressureHpa: undefined },
  ])('usa fallback para campos de precipitação e pressão ausentes: %j', (extraFields) => {
    render(
      <CurrentWeather
        city={{ id: 1, name: 'Lisboa', country: 'Portugal', latitude: 38.72, longitude: -9.14 }}
        current={{
          ...extraFields,
          temperatureC: 20,
          weatherCode: 0,
          relativeHumidity: 0,
          windSpeedKmh: 0,
          observedAtLocal: null,
        }}
        unit="fahrenheit"
      />,
    );
    expect(screen.getByText('Portugal')).toBeInTheDocument();
    expect(screen.getByText('68,0 °F')).toBeInTheDocument();
    expect(screen.getByText('0 %')).toBeInTheDocument();
    expect(screen.getByText('0 km/h')).toBeInTheDocument();
    expect(screen.getByText('Precipitação').parentElement).toHaveTextContent('Indisponível');
    expect(screen.getByText('Pressão').parentElement).toHaveTextContent('Indisponível');
    expect(screen.queryByText(/undefined|NaN/i)).not.toBeInTheDocument();
  });

  it('trata todos os dados ausentes ou inválidos sem inventar zeros', () => {
    render(
      <CurrentWeather
        city={city}
        current={{
          temperatureC: null,
          weatherCode: 999,
          relativeHumidity: Number.NaN,
          windSpeedKmh: Number.POSITIVE_INFINITY,
          precipitationMm: null,
          pressureHpa: null,
          observedAtLocal: 'inválido',
        }}
        unit="fahrenheit"
      />,
    );
    expect(screen.getAllByText(/Indisponível/)).toHaveLength(7);
    expect(screen.queryByText(/NaN|Infinity|0,0 °F/)).not.toBeInTheDocument();
  });

  it('renderiza nomes externos como texto, sem interpretar HTML', () => {
    render(
      <CurrentWeather
        city={{ ...city, name: '<img src=x onerror=alert(1)>' }}
        current={current}
        unit="celsius"
      />,
    );
    expect(
      screen.getByRole('heading', { name: '<img src=x onerror=alert(1)>' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
