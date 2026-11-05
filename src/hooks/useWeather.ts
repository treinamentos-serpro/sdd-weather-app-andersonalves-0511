import { useEffect, useRef, useState } from 'react';
import { getWeather, searchCities, WeatherServiceError } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

interface WeatherState {
  status: WeatherStatus;
  data: WeatherData | null;
  cities: City[];
  error: string | null;
  query: string;
}

type Operation = { type: 'search'; name: string } | { type: 'select'; city: City };

export function useWeather() {
  const [state, setState] = useState<WeatherState>({
    status: 'idle',
    data: null,
    cities: [],
    error: null,
    query: '',
  });
  const operationId = useRef(0);
  const lastOperation = useRef<Operation | null>(null);
  const abortController = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      operationId.current += 1;
      abortController.current?.abort();
      abortController.current = null;
    };
  }, []);

  async function execute(operation: Operation): Promise<void> {
    abortController.current?.abort();
    const id = ++operationId.current;
    const controller = new AbortController();
    abortController.current = controller;
    lastOperation.current = operation;
    setState((previous) => ({
      ...previous,
      status: 'loading',
      data: null,
      error: null,
      cities: operation.type === 'search' ? [] : previous.cities,
      query: operation.type === 'search' ? operation.name : previous.query,
    }));

    try {
      let city: City;

      if (operation.type === 'search') {
        const cities = await searchCities(operation.name, controller.signal);
        if (id !== operationId.current) return;

        const firstCity = cities[0];
        setState((previous) => ({
          ...previous,
          cities,
          status: firstCity ? 'loading' : 'empty',
        }));
        if (!firstCity) return;

        city = firstCity;
        lastOperation.current = { type: 'select', city };
      } else {
        city = operation.city;
      }

      const data = await getWeather(city, controller.signal);
      if (id !== operationId.current) return;

      setState((previous) => ({ ...previous, status: 'success', data }));
    } catch (error) {
      if (
        id !== operationId.current ||
        (error instanceof WeatherServiceError && error.kind === 'cancelled')
      ) {
        return;
      }

      setState((previous) => ({
        ...previous,
        status: 'error',
        error:
          error instanceof WeatherServiceError
            ? error.message
            : 'Não foi possível obter os dados do clima. Tente novamente.',
      }));
    } finally {
      if (abortController.current === controller) {
        abortController.current = null;
      }
    }
  }

  async function search(name: string): Promise<void> {
    const query = name.trim();
    if (!query) return;

    await execute({ type: 'search', name: query });
  }

  async function selectCity(city: City): Promise<void> {
    await execute({ type: 'select', city });
  }

  async function retry(): Promise<void> {
    if (lastOperation.current) {
      await execute(lastOperation.current);
    }
  }

  return { ...state, search, selectCity, retry };
}
