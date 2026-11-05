import { describe, expect, it } from 'vitest';
import { formatLocalDateTime } from '../../src/lib/dateTime';

describe('horário local da observação', () => {
  it.each([
    ['2026-01-10T12:00', '10/01/2026 às 12:00'],
    ['2026-01-01T00:05', '01/01/2026 às 00:05'],
    ['2025-12-31T23:59:30', '31/12/2025 às 23:59'],
    ['2024-02-29T08:30', '29/02/2024 às 08:30'],
    ['2026-03-08T01:30', '08/03/2026 às 01:30'],
    ['2026-11-01T01:30', '01/11/2026 às 01:30'],
  ])('formata %s sem deslocar o horário para o fuso do dispositivo', (local, formatted) => {
    expect(formatLocalDateTime(local)).toBe(formatted);
  });

  it.each([
    null,
    '',
    'inválido',
    '2026-02-29T12:00',
    '2026-04-31T12:00',
    '2026-13-01T12:00',
    '2026-01-10T25:00',
    '2026-01-10T24:00',
    '2026-01-10T12:00Z',
    '2026-01-10T12:00-03:00',
  ])('sinaliza indisponibilidade para %s fora do contrato ISO local', (value) => {
    expect(formatLocalDateTime(value)).toBe('Indisponível');
  });
});
