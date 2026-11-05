export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface CurrentWeather {
  temperatureC: number | null;
  weatherCode: number | null;
  relativeHumidity: number | null;
  windSpeedKmh: number | null;
  precipitationMm?: number | null;
  pressureHpa?: number | null;
  observedAtLocal: string | null;
}

export interface ForecastDay {
  date: string; // Data local ISO yyyy-MM-dd.
  weatherCode: number | null;
  temperatureMinC: number | null;
  temperatureMaxC: number | null;
  precipitationProbability?: number | null;
}

export interface WeatherData {
  city: City;
  timezone: string;
  current: CurrentWeather;
  forecast: ForecastDay[]; // Exatamente cinco datas locais, em ordem.
}
