/**
 * =============================================================================
 * PIEVEDI TECO TOUR GUIDE — EDITABLE DATA
 * =============================================================================
 * All POIs and walking routes live here. Coordinates use WGS84 (lat, lng).
 * Optional `icon` on a POI overrides the category default (emoji in the pin).
 * Optional `description` — short tagline under the name in the popup (omit if unused).
 * =============================================================================
 */

export const PIEVEDI_TECO_CENTER = {
  lat: 44.0464,
  lng: 7.9162,
};

/** @typedef {'culture'|'restaurants'|'religious'|'tabacchini_farmacie'|'water_fountains'|'misc'} PoiCategory */

export const POI_CATEGORY_ORDER = [
  'culture',
  'restaurants',
  'religious',
  'tabacchini_farmacie',
  'water_fountains',
  'misc',
];

/**
 * Pin ring + default emoji when a POI has no `icon` field.
 * Colors chosen for clear contrast on the map (iOS-inspired palette).
 */
export const CATEGORY_STYLES = {
  culture: { color: '#5E5CE6', emoji: '🏛️' },
  restaurants: { color: '#FF9F0A', emoji: '🍽️' },
  religious: { color: '#BF5AF2', emoji: '⛪' },
  tabacchini_farmacie: { color: '#34C759', emoji: '💊' },
  water_fountains: { color: '#0A84FF', emoji: '⛲' },
  misc: { color: '#8E8E93', emoji: '📍' },
};

/** @deprecated Use CATEGORY_STYLES[cat].emoji — kept for any external require */
export const CATEGORY_MARKER_EMOJI = Object.fromEntries(
  Object.entries(CATEGORY_STYLES).map(([k, v]) => [k, v.emoji]),
);

/**
 * Portici: coordinates not provided — approximate centro tratto via Mario Ponzoni (adjust freely).
 */
export const POIS = [
  /* ——— Cultura ——— */
  {
    id: 'poi-teatro-salvini',
    name: 'Teatro Salvini',
    category: 'culture',
    icon: '🎭',
    lat: 44.046312,
    lng: 7.916937,
    description: 'The best in the city.',
  },
  {
    id: 'poi-monumento-caduti',
    name: 'Monumento ai caduti di guerra',
    category: 'culture',
    icon: '🕊️',
    lat: 44.046813,
    lng: 7.916313,
  },
  {
    id: 'poi-portici-1400',
    name: 'Portici del 1400 (via Mario Ponzoni)',
    category: 'culture',
    icon: '🏛️',
    lat: 44.047,
    lng: 7.9161,
    shortNote:
      'Punto indicativo lungo i portici — coordinate approssimative (via estesa); affina sulla mappa se serve.',
  },
  {
    id: 'poi-panorama-ponte',
    name: 'Punto panoramico (ponte)',
    category: 'culture',
    icon: '🌄',
    lat: 44.047313,
    lng: 7.913937,
  },
  {
    id: 'poi-convento-agostiniani',
    name: 'Convento agostiniani',
    category: 'culture',
    icon: '🏛️',
    lat: 44.048063,
    lng: 7.912937,
  },
  {
    id: 'poi-piazza-centro-storico',
    name: 'Piazza (centro storico)',
    category: 'culture',
    icon: '🏙️',
    lat: 44.047062,
    lng: 7.916187,
  },

  /* ——— Religione ——— “Chiesa grande” solo come ⛪ (evitato duplicato sotto Cultura). */
  {
    id: 'poi-chiesa-grande',
    name: 'Chiesa grande',
    category: 'religious',
    icon: '⛪',
    lat: 44.047687,
    lng: 7.915812,
  },
  {
    id: 'poi-chiesa-bella',
    name: 'Chiesa bella',
    category: 'religious',
    icon: '⛪',
    lat: 44.046312,
    lng: 7.915313,
  },
  {
    id: 'poi-chiesa-900',
    name: 'Chiesa 900',
    category: 'religious',
    icon: '⛪',
    lat: 44.045313,
    lng: 7.917687,
  },
  {
    id: 'poi-convento',
    name: 'Convento',
    category: 'religious',
    icon: '⛪',
    lat: 44.048437,
    lng: 7.916688,
  },

  /* ——— Ristoranti & locali ——— */
  {
    id: 'poi-forno-900',
    name: 'Forno 900',
    category: 'restaurants',
    icon: '🥖',
    lat: 44.045263,
    lng: 7.917797,
  },
  {
    id: 'poi-panificio-ferrari',
    name: 'Panificio Ferrari',
    category: 'restaurants',
    icon: '🥖',
    lat: 44.046338,
    lng: 7.915516,
  },
  {
    id: 'poi-pizzeria-maniscalco',
    name: 'Pizzeria Maniscalco',
    category: 'restaurants',
    icon: '🍕',
    lat: 44.045687,
    lng: 7.917687,
  },
  {
    id: 'poi-roba-da-matti',
    name: 'Roba da matti',
    category: 'restaurants',
    icon: '🍽️',
    lat: 44.045812,
    lng: 7.916688,
  },
  {
    id: 'poi-parchetto-picnic',
    name: 'Parchetto pic-nic',
    category: 'restaurants',
    icon: '🧺',
    lat: 44.047187,
    lng: 7.913687,
  },

  /* ——— Tabacchini & farmacie ——— */
  {
    id: 'poi-farmacia-ceppi',
    name: 'Farmacia Ceppi',
    category: 'tabacchini_farmacie',
    icon: '💊',
    lat: 44.046213,
    lng: 7.916547,
  },
  {
    id: 'poi-tabaccheria-corrado',
    name: 'Tabaccheria Corrado',
    category: 'tabacchini_farmacie',
    icon: '🏪',
    lat: 44.047163,
    lng: 7.915453,
  },
  {
    id: 'poi-tabaccheria-caprile',
    name: 'Tabaccheria Caprile',
    category: 'tabacchini_farmacie',
    icon: '🏪',
    lat: 44.045713,
    lng: 7.917266,
  },

  /* ——— Fontanelle ——— */
  {
    id: 'poi-fontana-portici',
    name: 'Fontana (portici)',
    category: 'water_fountains',
    icon: '⛲',
    lat: 44.045812,
    lng: 7.916688,
  },
  {
    id: 'poi-fontana-scuola',
    name: 'Fontana (scuola)',
    category: 'water_fountains',
    icon: '⛲',
    lat: 44.047287,
    lng: 7.916828,
  },
  {
    id: 'poi-fontana-piazza-angelo',
    name: 'Fontana (piazza Angelo)',
    category: 'water_fountains',
    icon: '⛲',
    lat: 44.047663,
    lng: 7.914922,
  },

  /* ——— Miscellaneous ——— */
  {
    id: 'poi-bus-centro',
    name: 'Fermata autobus (centro)',
    category: 'misc',
    icon: '🚏',
    lat: 44.046813,
    lng: 7.914734,
  },
  {
    id: 'poi-bus-albenga',
    name: 'Fermata autobus (Albenga)',
    category: 'misc',
    icon: '🚌',
    lat: 44.042687,
    lng: 7.920063,
  },
  {
    id: 'poi-benzinaio-ip',
    name: 'Benzinaio IP',
    category: 'misc',
    icon: '⛽',
    lat: 44.042313,
    lng: 7.920312,
  },
  {
    id: 'poi-benzinaio-esso',
    name: 'Benzinaio Esso',
    category: 'misc',
    icon: '⛽',
    lat: 44.044062,
    lng: 7.918312,
  },
  {
    id: 'poi-carabinieri',
    name: 'Carabinieri — Stazione Pieve di Teco',
    category: 'misc',
    icon: '🛡️',
    lat: 44.047562,
    lng: 7.913187,
  },
  {
    id: 'poi-croce-rossa',
    name: 'Croce Rossa — comitato Pieve di Teco',
    category: 'misc',
    icon: '⛑️',
    lat: 44.046588,
    lng: 7.917109,
  },
  {
    id: 'poi-poste',
    name: 'Poste Italiane',
    category: 'misc',
    icon: '📮',
    lat: 44.046963,
    lng: 7.915078,
  },
  {
    id: 'poi-banco-azzoaglio',
    name: 'Banco di credito P. Azzoaglio',
    category: 'misc',
    icon: '🏦',
    lat: 44.044812,
    lng: 7.917188,
  },
  {
    id: 'poi-banca-carige',
    name: 'Banca Carige',
    category: 'misc',
    icon: '🏦',
    lat: 44.045313,
    lng: 7.916453,
  },
];

export const ROUTES = [
  {
    id: 'route-centro-storico-to-teatro',
    name: 'Dal centro storico al Teatro Salvini',
    description:
      'Passaggio breve tra piazza del centro storico e il Teatro Salvini — comodo per provare l’export verso Mappe.',
    walkingTimeMinutes: 3,
    distanceKm: 0.2,
    waypointPoiIds: ['poi-piazza-centro-storico', 'poi-teatro-salvini'],
  },
];
