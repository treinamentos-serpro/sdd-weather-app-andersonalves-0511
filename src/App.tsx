import { useEffect, useId, useRef, useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { type MockWeatherState, useMockWeather } from './hooks/useMockWeather';
import { MOCK_WEATHER } from './mocks/weather';
import type { Unit } from './types/weather';

const previews: { value: MockWeatherState; label: string }[] = [
  { value: 'idle', label: 'Inicial' },
  { value: 'loading', label: 'Carregando' },
  { value: 'empty', label: 'Vazio' },
  { value: 'error', label: 'Erro' },
  { value: 'success', label: 'Sucesso' },
];

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const { state, search, preview, retry } = useMockWeather();
  const previewId = useId();
  const contentRef = useRef<HTMLElement>(null);
  const previousState = useRef(state);

  useEffect(() => {
    if (
      previousState.current === 'loading' &&
      state !== 'loading' &&
      document.activeElement === document.body
    ) {
      contentRef.current?.focus();
    }
    previousState.current = state;
  }, [state]);

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
          <SearchBar onSearch={search} disabled={state === 'loading'} />
          <p className="text-sm text-slate-300">
            Demonstração sem API: dados fictícios e fixos de São Paulo, de 10 a 14/01/2026. Busque
            São Paulo para visualizar o exemplo; outras cidades não têm dados neste mock.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor={previewId} className="text-sm text-slate-300">
              Prévia do estado (demonstração)
            </label>
            <select
              id={previewId}
              value={state}
              onChange={(event) => {
                const option = previews.find(({ value }) => value === event.target.value);
                if (option) preview(option.value);
              }}
              className="min-h-11 max-w-full rounded-xl border border-slate-400 bg-night-800 px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400"
            >
              {previews.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </header>
        <main
          ref={contentRef}
          id="weather-content"
          tabIndex={-1}
          className="min-w-0 space-y-6 rounded-2xl focus:outline focus:outline-2 focus:outline-offset-4 focus:outline-accent-400"
        >
          {state === 'idle' && (
            <EmptyState
              title="Consulte o clima"
              hint="Busque São Paulo para começar a demonstração."
            />
          )}
          {state === 'loading' && <LoadingState />}
          {state === 'empty' && (
            <EmptyState hint="Este mock contém apenas São Paulo. Tente buscar essa cidade." />
          )}
          {state === 'error' && (
            <ErrorState
              message="Erro simulado: não foi possível obter os dados do clima."
              onRetry={retry}
            />
          )}
          {state === 'success' && (
            <>
              <CurrentWeather city={MOCK_WEATHER.city} current={MOCK_WEATHER.current} unit={unit} />
              <ForecastList forecast={MOCK_WEATHER.forecast} unit={unit} />
            </>
          )}
        </main>
        <footer className="border-t border-white/10 pt-5 text-sm text-slate-300">
          Dados fictícios para desenvolvimento. Fonte prevista na integração:{' '}
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
