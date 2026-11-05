const dayFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
});

const weekdayFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  timeZone: 'UTC',
});

const shortDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  timeZone: 'UTC',
});

const probabilityFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

function parseDate(date: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

  // UTC preserva a data de calendário, sem interpretá-la no fuso do dispositivo.
  const parsed = new Date(`${date}T00:00:00Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    return null;
  }

  return parsed;
}

export function formatDay(date: string): string {
  const parsed = parseDate(date);
  if (!parsed) return 'Indisponível';

  return dayFormatter.format(parsed);
}

export function getDayLabel(index: number, date: string): string {
  if (index === 0) return 'Hoje';
  if (index === 1) return 'Amanhã';

  const parsed = parseDate(date);
  if (!parsed) return 'Indisponível';

  return weekdayFormatter.format(parsed);
}

export function getShortDate(date: string): string {
  const parsed = parseDate(date);
  if (!parsed) return 'Indisponível';

  return shortDateFormatter.format(parsed);
}

export function formatPrecipitationProbability(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value) || value < 0 || value > 100) {
    return 'Indisponível';
  }

  return `${probabilityFormatter.format(value)} %`;
}
