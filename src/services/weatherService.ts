import type { City } from '../types/weather';

export class WeatherServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

interface GeocodingResponse {
  results?: City[];
}

export async function searchCities(name: string): Promise<City[]> {
  const query = name.trim();

  if (!query) {
    return [];
  }

  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=pt&format=json`,
  );

  if (!response.ok) {
    throw new WeatherServiceError(`Erro ao buscar cidades (HTTP ${response.status}).`);
  }

  const data: GeocodingResponse = await response.json();

  return (data.results ?? []).map((city) => ({
    id: city.id,
    name: city.name,
    country: city.country,
    admin1: city.admin1,
    latitude: city.latitude,
    longitude: city.longitude,
    timezone: city.timezone,
  }));
}
