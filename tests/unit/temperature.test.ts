import { describe, expect, it } from 'vitest';
import { celsiusToFahrenheit, formatTemperature } from '../../src/lib/temperature';

describe('celsiusToFahrenheit', () => {
  it.each([
    [0, 32],
    [100, 212],
    [-40, -40],
  ])('converte %s °C para %s °F', (celsius, fahrenheit) => {
    expect(celsiusToFahrenheit(celsius)).toBe(fahrenheit);
  });
});

describe('formatTemperature', () => {
  it.each([
    [0, 'celsius', '0,0 °C'],
    [0, 'fahrenheit', '32,0 °F'],
    [100, 'fahrenheit', '212,0 °F'],
    [-40, 'fahrenheit', '-40,0 °F'],
    [26.46, 'celsius', '26,5 °C'],
    [-1.26, 'fahrenheit', '29,7 °F'],
  ] as const)('formata %s °C na unidade %s com arredondamento e símbolo', (celsius, unit, formatted) => {
    expect(formatTemperature(celsius, unit)).toBe(formatted);
  });

  it.each([
    undefined,
    null,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('representa %s como indisponível em ambas as unidades', (value) => {
    expect(formatTemperature(value, 'celsius')).toBe('Indisponível');
    expect(formatTemperature(value, 'fahrenheit')).toBe('Indisponível');
  });
});
