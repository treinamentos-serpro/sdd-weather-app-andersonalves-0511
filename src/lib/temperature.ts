import type { Unit } from '../types/weather';

const formatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

export function formatTemperature(celsius: number | null | undefined, unit: Unit): string {
  if (celsius == null || !Number.isFinite(celsius)) return 'Indisponível';

  const temperature = unit === 'fahrenheit' ? celsiusToFahrenheit(celsius) : celsius;
  return `${formatter.format(temperature)} ${unit === 'fahrenheit' ? '°F' : '°C'}`;
}
