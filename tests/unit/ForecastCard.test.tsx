import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ForecastCard from '../../src/components/ForecastCard';
import { getWeatherCondition } from '../../src/lib/weatherCodes';
import type { ForecastDay } from '../../src/types/weather';

const day: ForecastDay = {
  date: '2026-01-10',
  weatherCode: 2,
  temperatureMinC: 0,
  temperatureMaxC: 20,
  precipitationProbability: 40,
};

describe('ForecastCard', () => {
  it('apresenta data, condição, ícone decorativo e métricas com nomes distintos', () => {
    render(<ForecastCard day={day} unit="celsius" />);

    expect(screen.getByRole('article', { name: 'sáb., 10/01/2026' })).toBeInTheDocument();
    expect(screen.getByText('sáb., 10/01/2026')).toHaveAttribute('datetime', day.date);
    expect(screen.getByText('Parcialmente nublado')).toBeInTheDocument();
    expect(screen.getByText(getWeatherCondition(2).icon)).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Máxima').parentElement).toHaveTextContent('20,0 °C');
    expect(screen.getByText('Mínima').parentElement).toHaveTextContent('0,0 °C');
    expect(screen.getByText('Probabilidade de chuva').parentElement).toHaveTextContent('40 %');
  });

  it('deriva máximas e mínimas da unidade sem modificar os dados', () => {
    const data = Object.freeze({ ...day });
    const { rerender } = render(<ForecastCard day={data} unit="celsius" />);
    rerender(<ForecastCard day={data} unit="fahrenheit" />);

    expect(screen.getByText('Máxima').parentElement).toHaveTextContent('68,0 °F');
    expect(screen.getByText('Mínima').parentElement).toHaveTextContent('32,0 °F');
    expect(screen.getByText('40 %')).toBeInTheDocument();
    expect(data).toEqual(day);

    rerender(<ForecastCard day={data} unit="celsius" />);
    expect(screen.getByText('20,0 °C')).toBeInTheDocument();
    expect(screen.getByText('0,0 °C')).toBeInTheDocument();
  });

  it.each<keyof Omit<ForecastDay, 'date'>>([
    'weatherCode',
    'temperatureMinC',
    'temperatureMaxC',
    'precipitationProbability',
  ])('marca %s nulo sem remover os outros campos', (field) => {
    render(<ForecastCard day={{ ...day, [field]: null }} unit="celsius" />);

    expect(screen.getAllByText('Indisponível')).toHaveLength(1);
    expect(screen.getByRole('heading', { name: 'sáb., 10/01/2026' })).toBeInTheDocument();
    if (field !== 'temperatureMinC') expect(screen.getByText('0,0 °C')).toBeInTheDocument();
    if (field !== 'precipitationProbability') expect(screen.getByText('40 %')).toBeInTheDocument();
  });

  it('aceita previsões antigas sem probabilidade de chuva', () => {
    render(
      <ForecastCard
        day={{ date: day.date, weatherCode: 0, temperatureMinC: 0, temperatureMaxC: 20 }}
        unit="celsius"
      />,
    );
    expect(screen.getByText('Probabilidade de chuva').parentElement).toHaveTextContent(
      'Indisponível',
    );
    expect(screen.getByText('Céu limpo')).toBeInTheDocument();
    expect(screen.queryByText(/undefined|NaN/i)).not.toBeInTheDocument();
  });

  it.each([0, 100])('preserva o limite de probabilidade %s%%', (probability) => {
    render(<ForecastCard day={{ ...day, precipitationProbability: probability }} unit="celsius" />);
    expect(screen.getByText('Probabilidade de chuva').parentElement).toHaveTextContent(
      `${probability} %`,
    );
  });

  it('torna explícitos data inválida, código desconhecido e números inválidos', () => {
    render(
      <ForecastCard
        day={{
          date: '2026-02-30',
          weatherCode: 999,
          temperatureMinC: Number.NaN,
          temperatureMaxC: Number.POSITIVE_INFINITY,
          precipitationProbability: 101,
        }}
        unit="fahrenheit"
      />,
    );
    expect(screen.getAllByText('Indisponível')).toHaveLength(5);
    expect(screen.queryByText(/NaN|Infinity|0,0/)).not.toBeInTheDocument();
  });
});
