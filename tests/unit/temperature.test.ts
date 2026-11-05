import { describe, expect, it } from 'vitest';
import { celsiusToFahrenheit, formatTemperature } from '../../src/lib/temperature';

describe('temperatura', () => {
  it.each([
    [0, 32, '32,0 °F'],
    [100, 212, '212,0 °F'],
    [-40, -40, '-40,0 °F'],
    [-1.26, 29.732, '29,7 °F'],
  ])('converte %s °C sem arredondar antes da apresentação', (celsius, fahrenheit, formatted) => {
    expect(celsiusToFahrenheit(celsius)).toBeCloseTo(fahrenheit, 10);
    expect(formatTemperature(celsius, 'fahrenheit')).toBe(formatted);
  });

  it('formata Celsius com uma casa decimal em pt-BR', () => {
    expect(formatTemperature(0, 'celsius')).toBe('0,0 °C');
    expect(formatTemperature(26.46, 'celsius')).toBe('26,5 °C');
  });

  it.each([
    null,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('representa %s como indisponível em ambas as unidades', (value) => {
    expect(formatTemperature(value, 'celsius')).toBe('Indisponível');
    expect(formatTemperature(value, 'fahrenheit')).toBe('Indisponível');
  });
});
