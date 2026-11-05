import { describe, expect, it } from 'vitest';
import {
  formatDay,
  formatPrecipitationProbability,
  getDayLabel,
  getShortDate,
} from '../../src/lib/format';

describe('formatDay', () => {
  it.each([
    ['2026-01-10', 'sáb., 10/01/2026'],
    ['2026-01-11', 'dom., 11/01/2026'],
    ['2026-01-01', 'qui., 01/01/2026'],
    ['2025-12-31', 'qua., 31/12/2025'],
    ['2024-02-29', 'qui., 29/02/2024'],
    ['2026-03-08', 'dom., 08/03/2026'],
    ['2026-11-01', 'dom., 01/11/2026'],
  ])('formata %s sem deslocar o dia no fuso do dispositivo', (date, label) => {
    expect(formatDay(date)).toBe(label);
  });

  it.each([
    '',
    'inválido',
    '2026-02-29',
    '2026-04-31',
    '2026-13-01',
    '2026-00-01',
    '2026-01-00',
    '2026-1-10',
    '2026-01-10T00:00:00Z',
  ])('sinaliza indisponibilidade para a data %s', (date) => {
    expect(formatDay(date)).toBe('Indisponível');
  });
});

describe('getDayLabel', () => {
  it.each([
    [0, '2026-01-10', 'Hoje'],
    [1, '2026-01-11', 'Amanhã'],
    [2, '2026-01-12', 'seg.'],
    [4, '2026-01-14', 'qua.'],
  ])('formata o índice %i da data %s', (index, date, label) => {
    expect(getDayLabel(index, date)).toBe(label);
  });

  it('sinaliza uma data inválida para os dias após amanhã', () => {
    expect(getDayLabel(2, '2026-02-29')).toBe('Indisponível');
  });
});

describe('getShortDate', () => {
  it.each([
    ['2026-01-10', '10/01'],
    ['2025-12-31', '31/12'],
    ['2024-02-29', '29/02'],
  ])('formata %s como dia e mês', (date, label) => {
    expect(getShortDate(date)).toBe(label);
  });

  it.each(['2026-02-29', 'invalid', '2026-01-10T00:00:00Z'])(
    'sinaliza a data inválida %s',
    (date) => {
      expect(getShortDate(date)).toBe('Indisponível');
    },
  );
});

describe('formatPrecipitationProbability', () => {
  it.each([
    [0, '0 %'],
    [100, '100 %'],
    [40, '40 %'],
    [12.5, '12,5 %'],
  ])('formata %s em porcentagem pt-BR', (value, label) => {
    expect(formatPrecipitationProbability(value)).toBe(label);
  });

  it.each([
    undefined,
    null,
    -1,
    101,
    Number.NaN,
    Number.POSITIVE_INFINITY,
  ])('não inventa probabilidade para %s', (value) => {
    expect(formatPrecipitationProbability(value)).toBe('Indisponível');
  });
});
