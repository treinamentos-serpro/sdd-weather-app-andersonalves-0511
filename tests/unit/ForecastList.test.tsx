import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ForecastList from '../../src/components/ForecastList';
import { MOCK_WEATHER } from '../../src/mocks/weather';

const { forecast } = MOCK_WEATHER;

describe('ForecastList', () => {
  it('renderiza cinco cards em ordem com o grid responsivo solicitado', () => {
    render(<ForecastList forecast={forecast} unit="celsius" />);
    const region = screen.getByRole('region', { name: 'Previsão de 5 dias' });
    const list = within(region).getByRole('list');
    const cards = within(list).getAllByRole('listitem');

    expect(list).toHaveClass('grid', 'grid-cols-2', 'sm:grid-cols-3', 'lg:grid-cols-5');
    expect(cards).toHaveLength(5);
    expect(cards.map((card) => within(card).getByRole('heading').textContent)).toEqual([
      'sáb., 10/01/2026',
      'dom., 11/01/2026',
      'seg., 12/01/2026',
      'ter., 13/01/2026',
      'qua., 14/01/2026',
    ]);
    expect(within(region).getAllByText('Máxima')).toHaveLength(5);
    expect(within(region).getAllByText('Mínima')).toHaveLength(5);
    expect(within(region).getAllByText('Probabilidade de chuva')).toHaveLength(5);
  });

  it('atualiza as duas temperaturas de todos os cards para Fahrenheit', () => {
    const { rerender } = render(<ForecastList forecast={forecast} unit="celsius" />);
    expect(screen.getAllByText(/°C$/)).toHaveLength(10);
    rerender(<ForecastList forecast={forecast} unit="fahrenheit" />);
    const cards = screen.getAllByRole('article');
    const maximums = ['82,4 °F', '80,8 °F', '84,6 °F', '86,0 °F', '88,3 °F'];
    const minimums = ['68,0 °F', '67,6 °F', '68,2 °F', '69,8 °F', '70,5 °F'];

    cards.forEach((card, index) => {
      expect(within(card).getByText('Máxima').parentElement).toHaveTextContent(maximums[index]);
      expect(within(card).getByText('Mínima').parentElement).toHaveTextContent(minimums[index]);
    });
    expect(screen.queryByText(/°C$/)).not.toBeInTheDocument();
  });

  it('preserva as cinco datas e valores válidos quando um dia está indisponível', () => {
    const partial = forecast.map((day, index) =>
      index === 1
        ? {
            ...day,
            weatherCode: null,
            temperatureMinC: null,
            temperatureMaxC: null,
            precipitationProbability: null,
          }
        : day,
    );
    render(<ForecastList forecast={partial} unit="celsius" />);

    expect(screen.getAllByRole('listitem')).toHaveLength(5);
    const unavailable = screen.getByRole('article', { name: 'dom., 11/01/2026' });
    expect(within(unavailable).getAllByText('Indisponível')).toHaveLength(4);
    expect(screen.getByRole('article', { name: 'seg., 12/01/2026' })).toHaveTextContent('29,2 °C');
    expect(screen.getByRole('article', { name: 'qua., 14/01/2026' })).toHaveTextContent('31,3 °C');
  });

  it('mostra um estado vazio explícito sem fabricar previsões', () => {
    render(<ForecastList forecast={[]} unit="celsius" />);
    expect(screen.getByRole('status')).toHaveTextContent('Previsão indisponível.');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });
});
