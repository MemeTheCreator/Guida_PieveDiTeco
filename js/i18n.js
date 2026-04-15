/**
 * UI strings — English only for now; add locales by extending LANGUAGES.
 */
export const DEFAULT_LANG = 'en';

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  // { code: 'it', label: 'Italiano' },
];

const STRINGS = {
  en: {
    appTitle: 'Pieve di Teco',
    searchPlaceholder: 'Search places…',
    searchNoResults: 'No matching places.',
    menuRoutes: 'Routes',
    menuWeather: 'Weather',
    menuPlaceholder2: 'Coming soon',
    menuPlaceholder3: 'Coming soon',
    routesTitle: 'Walking routes',
    routesBackAria: 'Back to map',
    routeWalkTime: 'Walk',
    routeDistance: 'Distance',
    routeExportGoogle: 'Google Maps',
    routeExportApple: 'Apple Maps',
    filterTitle: 'Map & language',
    gpsToggle: 'Enable GPS location',
    filterCategories: 'Categories',
    filterLanguage: 'Language',
    weatherTitle: 'Current conditions',
    weatherPageTitle: 'Weather forecast',
    weatherLoading: 'Loading weather...',
    weatherUnavailable: 'Weather data is unavailable at the moment.',
    weatherUpdatedPrefix: 'Updated',
    weatherToday: 'Today',
    weatherTomorrow: 'Tomorrow',
    weatherNextDays: 'Next days',
    weatherFeelsLike: 'Feels like',
    weatherWind: 'Wind',
    weatherHumidity: 'Humidity',
    storyTitle: 'The story of Pieve di Teco',
    storyBody:
      'Pieve di Teco has been a crossroads village of the Arroscia valley for centuries, shaped by merchants, pilgrims, and the long arcades that still define its streets today. This guide helps you walk the same paths, discover hidden corners, and enjoy local places with everything in one map.',
    storyButton: 'Add GPS',
    poiPopupPhotos: 'Photos',
    poiPopupDropPhotos: 'Photos will be added soon',
    notNearPievePrefix: 'Not near Pieve di Teco, location rivelata:',
    poiPopupGo: 'GO!',
    categoryLabels: {
      culture: 'Culture',
      restaurants: 'Restaurants',
      religious: 'Religious places',
      tabacchini_farmacie: 'Tabacchini & farmacie',
      water_fountains: 'Water fountains',
      misc: 'Miscellaneous',
    },
    poiPopupCategory: 'Category',
    minutesShort: 'min',
    kmShort: 'km',
  },
};

export function t(lang, key) {
  const table = STRINGS[lang] || STRINGS[DEFAULT_LANG];
  return table[key] ?? STRINGS.en[key] ?? key;
}

export function categoryLabel(lang, categoryKey) {
  const table = STRINGS[lang] || STRINGS[DEFAULT_LANG];
  const labels = table.categoryLabels || {};
  return labels[categoryKey] ?? categoryKey;
}
