const dayFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
});

const probabilityFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

export function formatDay(date: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return 'Indisponível';

  // UTC preserva a data de calendário, sem interpretá-la no fuso do dispositivo.
  const parsed = new Date(`${date}T00:00:00Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    return 'Indisponível';
  }

  return dayFormatter.format(parsed);
}

export function formatPrecipitationProbability(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value) || value < 0 || value > 100) {
    return 'Indisponível';
  }

  return `${probabilityFormatter.format(value)} %`;
}
