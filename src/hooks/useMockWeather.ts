import { useEffect, useRef, useState } from 'react';
import { MOCK_WEATHER } from '../mocks/weather';

export type MockWeatherState = 'idle' | 'loading' | 'empty' | 'error' | 'success';

function normalizeCity(city: string): string {
  return city.trim().normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('pt-BR');
}

export function useMockWeather() {
  const [state, setState] = useState<MockWeatherState>('idle');
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);
  const lastQuery = useRef(MOCK_WEATHER.city.name);

  useEffect(() => {
    if (pendingQuery === null) return;

    const timer = window.setTimeout(() => {
      setState(
        normalizeCity(pendingQuery) === normalizeCity(MOCK_WEATHER.city.name) ? 'success' : 'empty',
      );
      setPendingQuery(null);
    }, 600);

    return () => window.clearTimeout(timer);
  }, [pendingQuery]);

  function search(city: string) {
    lastQuery.current = city;
    setState('loading');
    setPendingQuery(city);
  }

  function preview(nextState: MockWeatherState) {
    setPendingQuery(null);
    setState(nextState);
  }

  return { state, search, preview, retry: () => search(lastQuery.current) };
}
