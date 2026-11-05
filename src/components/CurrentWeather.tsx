import { useId } from 'react';
import { formatLocalDateTime } from '../lib/dateTime';
import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
  unit: Unit;
}

const numberFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

function formatMetric(value: number | null | undefined, suffix: string): string {
  return value == null || !Number.isFinite(value)
    ? 'Indisponível'
    : `${numberFormatter.format(value)} ${suffix}`;
}

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const headingId = useId();
  const condition = getWeatherCondition(current.weatherCode ?? null);
  const observedAt = formatLocalDateTime(current.observedAtLocal ?? null);
  const metrics = [
    { label: 'Umidade', value: formatMetric(current.relativeHumidity ?? null, '%') },
    { label: 'Vento', value: formatMetric(current.windSpeedKmh ?? null, 'km/h') },
    { label: 'Precipitação', value: formatMetric(current.precipitationMm ?? null, 'mm') },
    { label: 'Pressão', value: formatMetric(current.pressureHpa ?? null, 'hPa') },
  ];

  return (
    <section
      aria-labelledby={headingId}
      className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-5 font-sans text-white shadow-glass backdrop-blur-md sm:p-8"
    >
      <h2 id={headingId} className="break-words text-2xl font-semibold">
        {city.name}
      </h2>
      <p className="break-words text-slate-300">
        {[city.admin1, city.country].filter(Boolean).join(', ')}
      </p>
      <div className="my-6 flex flex-wrap items-center gap-4">
        <span aria-hidden="true" className="text-6xl">
          {condition.icon}
        </span>
        <div className="min-w-0">
          <p className="break-words text-5xl font-semibold tracking-tight text-sun sm:text-7xl">
            {formatTemperature(current.temperatureC ?? null, unit)}
          </p>
          <p className="mt-2 text-lg">{condition.label}</p>
        </div>
      </div>
      <p className="mb-6 text-sm text-slate-300">
        Atualizado em:{' '}
        {observedAt === 'Indisponível' ? (
          observedAt
        ) : (
          <time dateTime={current.observedAtLocal ?? undefined}>{observedAt}</time>
        )}
        {' (horário local)'}
      </p>
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(({ label, value }) => (
          <div key={label} className="min-w-0 rounded-xl border border-white/10 bg-white/5 p-4">
            <dt className="text-sm text-slate-300">{label}</dt>
            <dd className="mt-1 break-words text-lg font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
