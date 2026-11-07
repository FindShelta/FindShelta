export const AVAILABLE_CITIES = ['Lagos', 'Abuja', 'Enugu'] as const;

export const AVAILABLE_CITY_KEYS = AVAILABLE_CITIES.map((city) => city.toLowerCase());

export const CITY_STATES: Record<(typeof AVAILABLE_CITIES)[number], string> = {
  Lagos: 'Lagos',
  Abuja: 'Federal Capital Territory',
  Enugu: 'Enugu',
};
