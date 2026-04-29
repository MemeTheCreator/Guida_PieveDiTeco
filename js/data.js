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
    description: 'Autoproclamato teatro più piccolo d’Europa: the best in the city.',
    photos: ['assets/poi-photos/poi-teatro-salvini.jpg'],
  },
  {
    id: 'poi-monumento-caduti',
    name: 'Monumento ai caduti di guerra',
    category: 'culture',
    icon: '🪖',
    lat: 44.046813,
    lng: 7.916313,
    description: 'In ricordo di tutti i morti per la patria.',
    photos: [
      'assets/poi-photos/poi-monumento-caduti-guerra.jpg',
      'assets/poi-photos/poi-monumento-caduti-guerra2.jpg',
      'assets/poi-photos/poi-monumento-caduti-guerra3.jpg',
    ],
  },
  {
    id: 'poi-portici-1400',
    name: 'Portici del 1400 (via Mario Ponzoni)',
    category: 'culture',
    icon: '🏛️',
    lat: 44.047,
    lng: 7.9161,
    description: 'Il pieno centro di pieve, ricco di storia e di negozi.',
    shortNote:
      'Punto indicativo lungo i portici — coordinate approssimative (via estesa); affina sulla mappa se serve.',
  },
  {
    id: 'poi-panorama-ponte',
    name: 'Punto panoramico (ponte)',
    category: 'culture',
    icon: '🏞️',
    lat: 44.047313,
    lng: 7.913937,
    description: 'Un bellissimo ponte dove si scorge il fiume Arroscia e le montagne sopra Pieve.',
    photos: [
      'assets/poi-photos/poi-punto-panoramico.jpg',
      'assets/poi-photos/poi-punto-panoramico2.jpg',
    ],
  },
  {
    id: 'poi-convento-agostiniani',
    name: 'Convento agostiniani',
    category: 'culture',
    icon: '✝️',
    lat: 44.048063,
    lng: 7.912937,
    description: 'Luogo sacro dove un tempo erano presenti i monaci devoti a sant’agostino.',
  },
  {
    id: 'poi-piazza-centro-storico',
    name: 'Piazza (centro storico)',
    category: 'culture',
    icon: '🌆',
    lat: 44.047062,
    lng: 7.916187,
    description: 'Elegante piazza ricca di fiori, monumenti e fontane.',
  },
  {
    id: 'poi-panchina-gay-pride',
    name: 'Panchina Gay Pride',
    category: 'culture',
    icon: '🏳️‍🌈',
    lat: 44.046813,
    lng: 7.914891,
    description:'Pieve Di Teco si afferma come capitale del Pride in tutta la valle Arroscia, promuovendo inclusione e disapprovando di ogni tipo di discriminazione',
    photos: ['assets/poi-photos/poi-panchina-gay-pride.jpeg'],
  },

  /* ——— Religione ——— “Chiesa grande” solo come ⛪ (evitato duplicato sotto Cultura). */
  {
    id: 'poi-chiesa-grande',
    name: 'Chiesa grande',
    category: 'religious',
    icon: '⛪',
    lat: 44.047687,
    lng: 7.915812,
    description: 'Chiesa principale,utilizzata per le funzioni domenicali situata sulla piazza.',
    photos: ['assets/poi-photos/poi-chiesa-grande.jpg'],
  },
  {
    id: 'poi-chiesa-bella',
    name: 'Chiesa bella',
    category: 'religious',
    icon: '⛪',
    lat: 44.046312,
    lng: 7.915313,
    description: 'Chiesa più ricca d’arte, essendo la più antica possiede un gran numero di opere come quadri e statue.',
  },
  {
    id: 'poi-chiesa-900',
    name: 'Chiesa 900',
    category: 'religious',
    icon: '⛪',
    lat: 44.045313,
    lng: 7.917687,
    description: 'Piccola chiesetta situata in fondo ai portici.',
  },
  {
    id: 'poi-convento',
    name: 'Convento',
    category: 'religious',
    icon: '✝️',
    lat: 44.048437,
    lng: 7.916688,
    description: 'Convento di frati Cappuccini situato in fondo al paese.',
  },

  /* ——— Ristoranti & locali ——— */
  {
    id: 'poi-forno-900',
    name: 'Forno 900',
    category: 'restaurants',
    icon: '🥖',
    lat: 44.045263,
    lng: 7.917797,
    description: 'Punto di riferimento per chi ama i prodotti da forno tradizionali liguri.',
  },
  {
    id: 'poi-panificio-ferrari',
    name: 'Panificio Ferrari',
    category: 'restaurants',
    icon: '🥖',
    lat: 44.046338,
    lng: 7.915516,
    description: 'Panificio pricipale, essendo situato in parte sulla strada è più frequentato.',
  },
  {
    id: 'poi-pizzeria-maniscalco',
    name: 'Pizzeria Maniscalco',
    category: 'restaurants',
    icon: '🍕',
    lat: 44.045687,
    lng: 7.917687,
    description: 'Pizzeria molto apprezzata con personale molto gentile.',
  },
  {
    id: 'poi-roba-da-matti',
    name: 'Roba da matti',
    category: 'restaurants',
    icon: '🍕',
    lat: 44.045812,
    lng: 7.916688,
    description: 'Anche questa pizzeria molto buona, con ingredienti a km 0, e stagionali.',
  },
  {
    id: 'poi-parchetto-picnic',
    name: 'Parchetto pic-nic',
    category: 'restaurants',
    icon: '🧺',
    lat: 44.047187,
    lng: 7.913687,
    description: 'Area da pic nic affiancata al fiume, con parco giochi e campo da bocce.',
    photos: ['assets/poi-photos/poi-area-pic-nic.jpg'],
  },

  /* ——— Tabacchini & farmacie ——— */
  {
    id: 'poi-farmacia-ceppi',
    name: 'Farmacia Ceppi',
    category: 'tabacchini_farmacie',
    icon: '💊',
    lat: 44.046213,
    lng: 7.916547,
    description: 'Ha la caratteristica di essere aperta tutti i giorni dell’anno, negli orari prestabiliti, salvo il 1° gennaio.',
  },
  {
    id: 'poi-tabaccheria-corrado',
    name: 'Tabaccheria Corrado',
    category: 'tabacchini_farmacie',
    icon: '🏪',
    lat: 44.047163,
    lng: 7.915453,
    description: 'Fornito di ogni necessità, non solo tabacchi, ma anche gratta e vinci e ricariche telefoniche.',
  },
  {
    id: 'poi-tabaccheria-caprile',
    name: 'Tabaccheria Caprile',
    category: 'tabacchini_farmacie',
    icon: '🏪',
    lat: 44.045713,
    lng: 7.917266,
    description: 'Fornito di ogni necessità, non solo tabacchi, ma anche gratta e vinci e ricariche telefoniche.',
  },

  /* ——— Fontanelle ——— */
  {
    id: 'poi-fontana-portici',
    name: 'Fontana (portici)',
    category: 'water_fountains',
    icon: '⛲',
    lat: 44.045812,
    lng: 7.916688,
    description: 'Fontana con acqua potabile per dissetare.',
  },
  {
    id: 'poi-fontana-scuola',
    name: 'Fontana (scuola)',
    category: 'water_fountains',
    icon: '⛲',
    lat: 44.047287,
    lng: 7.916828,
    description: 'Fontana con acqua potabile per dissetare.',
  },
  {
    id: 'poi-fontana-piazza-angelo',
    name: 'Fontana (piazza Angelo)',
    category: 'water_fountains',
    icon: '⛲',
    lat: 44.047663,
    lng: 7.914922,
    description: 'Fontana con acqua potabile per dissetare.',
  },
  {
    id: 'poi-vicolo-scarpa',
    name: 'Fontana (Vicolo scarpa)',
    category: 'water_fountains',
    icon: '⛲',
    lat: 44.045563,
    lng: 7.916828,
    description: 'Fontana con acqua.',
  },
  {
    id: 'poi-sferisterio',
    name: 'Fontana (Sferisterio)',
    category: 'water_fountains',
    icon: '⛲',
    lat: 44.044562,
    lng: 7.918437,
    description: 'Fontana con acqua potabile per dissetare.',
    photos: ['assets/poi-photos/poi-fontana-sferisterio.jpeg'],
  },
  {
    id: 'poi-pic-nic',
    name: 'Fontana (Pic-nic)',
    category: 'water_fountains',
    icon: '⛲',
    lat: 44.047187,
    lng: 7.913937,
    description: 'Fontana con acqua potabile per dissetare.',
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
    icon: '🚏',
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
    description: 'Centro di assistenza immediata per tutti i cittadini di Pieve, un ringraziamento a Davide Campagna soccorritore CRI con qualifica di operatore soccorso in Ambulanza in sede di Diano Marina ed esteso ad Imperia.',
    photos: ['assets/poi-photos/poi-croce-rossa.jpeg'],
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
    id: 'route-heritage-loop',
    name: 'Historic center heritage loop',
    description:
      'A compact route through arcades, churches and symbolic points of the old village center.',
    walkingTimeMinutes: 24,
    distanceKm: 1.6,
    waypointPoiIds: [
      'poi-piazza-centro-storico',
      'poi-portici-1400',
      'poi-monumento-caduti',
      'poi-chiesa-grande',
      'poi-teatro-salvini',
    ],
  },
  {
    id: 'route-flavors-water',
    name: 'Flavors and fountains walk',
    description:
      'A food-friendly route connecting bakeries, local stops, and fresh water points in town.',
    walkingTimeMinutes: 31,
    distanceKm: 2.2,
    waypointPoiIds: [
      'poi-forno-900',
      'poi-panificio-ferrari',
      'poi-fontana-portici',
      'poi-fontana-scuola',
      'poi-parchetto-picnic',
    ],
  },
  {
    id: 'route-services-essentials',
    name: 'Services and essentials route',
    description:
      'Useful itinerary for visitors that want to quickly locate pharmacy, post office, bank and transport.',
    walkingTimeMinutes: 20,
    distanceKm: 1.3,
    waypointPoiIds: [
      'poi-farmacia-ceppi',
      'poi-poste',
      'poi-banco-azzoaglio',
      'poi-tabaccheria-corrado',
      'poi-bus-centro',
    ],
  },
  {
    id: 'route-hill-panorama-circuit',
    name: 'Hill and panorama circuit',
    description:
      'A scenic route mixing viewpoints, convent areas, and quieter streets around the historic center.',
    walkingTimeMinutes: 37,
    distanceKm: 2.8,
    waypointPoiIds: [
      'poi-piazza-centro-storico',
      'poi-convento-agostiniani',
      'poi-panorama-ponte',
      'poi-carabinieri',
      'poi-teatro-salvini',
    ],
  },
  {
    id: 'route-essentials-plus-food',
    name: 'Essentials plus food stop',
    description:
      'A practical route for essentials with a comfortable local food stop before returning to central points.',
    walkingTimeMinutes: 29,
    distanceKm: 2.1,
    waypointPoiIds: [
      'poi-farmacia-ceppi',
      'poi-tabaccheria-caprile',
      'poi-bus-albenga',
      'poi-roba-da-matti',
      'poi-piazza-centro-storico',
    ],
  },
];
