import { useEffect, useRef, useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { useWeather } from './hooks/useWeather';
import type { Unit } from './types/weather';

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const { status, data, error, search, retry } = useWeather();
  const contentRef = useRef<HTMLElement>(null);
  const previousState = useRef(status);

  useEffect(() => {
    if (
      previousState.current === 'loading' &&
      status !== 'loading' &&
      document.activeElement === document.body
    ) {
      contentRef.current?.focus();
    }
    previousState.current = status;
  }, [status]);

  return (
    <div className="min-h-screen bg-night-900 font-sans text-white">
      <a
        href="#weather-content"
        className="sr-only rounded bg-accent-400 p-3 text-night-900 focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10"
      >
        Pular para o conteúdo
      </a>
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="break-words text-3xl font-bold text-accent-400">WeatherView</h1>
              <p className="mt-1 text-slate-300">O clima, de um jeito simples.</p>
            </div>
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>
          <SearchBar onSearch={search} disabled={status === 'loading'} />
        </header>
        <main
          ref={contentRef}
          id="weather-content"
          tabIndex={-1}
          aria-busy={status === 'loading'}
          className="min-w-0 space-y-6 rounded-2xl focus:outline focus:outline-2 focus:outline-offset-4 focus:outline-accent-400"
        >
          {status === 'idle' && (
            <EmptyState
              title="Consulte o clima"
              hint="Informe uma cidade para consultar o clima."
            />
          )}
          {status === 'loading' && <LoadingState />}
          {status === 'empty' && <EmptyState />}
          {status === 'error' && (
            <ErrorState
              message={error ?? 'Não foi possível obter os dados do clima.'}
              onRetry={retry}
            />
          )}
          {status === 'success' && data && (
            <>
              <CurrentWeather city={data.city} current={data.current} unit={unit} />
              <ForecastList forecast={data.forecast} unit={unit} />
            </>
          )}
        </main>
        <footer className="border-t border-white/10 pt-5 text-sm text-slate-300">
          Fonte dos dados:{' '}
          <a
            href="https://open-meteo.com/"
            className="inline-flex min-h-11 items-center rounded text-accent-400 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400"
          >
            Open-Meteo
          </a>
          .
        </footer>
      </div>
    </div>
  );
}
