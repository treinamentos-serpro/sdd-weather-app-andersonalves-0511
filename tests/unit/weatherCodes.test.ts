import { describe, expect, it } from 'vitest';
import { getWeatherCondition } from '../../src/lib/weatherCodes';

describe('códigos WMO', () => {
  it.each([
    0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86,
    95, 96, 99,
  ])('fornece condição e ícone para o código %s da Open-Meteo', (code) => {
    const condition = getWeatherCondition(code);
    expect(condition.label).not.toBe('Indisponível');
    expect(condition.label.length).toBeGreaterThan(0);
    expect(condition.icon).not.toBe('?');
    expect(condition.icon.length).toBeGreaterThan(0);
  });

  it.each([
    [0, 'Céu limpo'],
    [2, 'Parcialmente nublado'],
    [61, 'Chuva leve'],
    [95, 'Trovoadas'],
  ])('traduz o código %s para %s', (code, label) => {
    expect(getWeatherCondition(code).label).toBe(label);
  });

  it.each([
    undefined,
    null,
    -1,
    4,
    100,
    1.5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
  ])('sinaliza indisponibilidade para o código %s', (code) => {
    expect(getWeatherCondition(code)).toEqual({ label: 'Indisponível', icon: '?' });
  });
});
