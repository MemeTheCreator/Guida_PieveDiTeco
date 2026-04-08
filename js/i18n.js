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
    menuPlaceholder2: 'Coming soon',
    menuPlaceholder3: 'Coming soon',
    routesTitle: 'Walking routes',
    routesBackAria: 'Back to map',
    routeWalkTime: 'Walk',
    routeDistance: 'Distance',
    routeExportGoogle: 'Google Maps',
    routeExportApple: 'Apple Maps',
    filterTitle: 'Map & language',
    filterCategories: 'Categories',
    filterLanguage: 'Language',
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
