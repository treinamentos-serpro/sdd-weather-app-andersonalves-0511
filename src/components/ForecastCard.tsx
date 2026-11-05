import { useId } from 'react';
import { formatDay, formatPrecipitationProbability } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  unit: Unit;
}

export default function ForecastCard({ day, unit }: ForecastCardProps) {
  const headingId = useId();
  const label = formatDay(day.date ?? '');
  const condition = getWeatherCondition(day.weatherCode ?? null);

  return (
    <article
      aria-labelledby={headingId}
      className="h-full min-w-0 rounded-2xl border border-white/10 bg-white/5 p-3 font-sans text-white shadow-glass backdrop-blur-md sm:p-4"
    >
      <h3 id={headingId} className="break-words font-semibold">
        {label === 'Indisponível' ? label : <time dateTime={day.date}>{label}</time>}
      </h3>
      <span aria-hidden="true" className="my-3 block text-4xl">
        {condition.icon}
      </span>
      <p className="break-words text-sm text-slate-300">{condition.label}</p>
      <dl className="mt-4 space-y-3">
        <div>
          <dt className="text-sm text-slate-300">Máxima</dt>
          <dd className="break-words text-lg font-semibold text-sun">
            {formatTemperature(day.temperatureMaxC ?? null, unit)}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-slate-300">Mínima</dt>
          <dd className="break-words text-lg font-semibold">
            {formatTemperature(day.temperatureMinC ?? null, unit)}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-slate-300">Probabilidade de chuva</dt>
          <dd className="break-words font-semibold">
            {formatPrecipitationProbability(day.precipitationProbability ?? null)}
          </dd>
        </div>
      </dl>
    </article>
  );
}
