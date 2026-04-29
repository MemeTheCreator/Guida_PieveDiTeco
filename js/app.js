import {
  PIEVEDI_TECO_CENTER,
  POIS,
  ROUTES,
  POI_CATEGORY_ORDER,
  CATEGORY_STYLES,
} from './data.js';
import { DEFAULT_LANG, LANGUAGES, t, categoryLabel } from './i18n.js';
import { googleMapsDirectionsUrl, appleMapsDirectionsUrl } from './map-links.js';

/** Carto Voyager (OSM data) — credits in index.html (.map-attribution) */
const CARTO_VOYAGER =
  'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png';

/** @type {string} */
let currentLang = DEFAULT_LANG;

/** @type {Record<string, boolean>} */
const categoryVisible = Object.fromEntries(POI_CATEGORY_ORDER.map((k) => [k, true]));

const els = {
  map: /** @type {HTMLElement} */ (document.getElementById('map')),
  search: /** @type {HTMLInputElement} */ (document.getElementById('searchInput')),
  searchWrap: document.getElementById('searchWrap'),
  searchResults: /** @type {HTMLUListElement} */ (document.getElementById('searchResults')),
  menuBtn: document.getElementById('menuBtn'),
  menuBackdrop: document.getElementById('menuBackdrop'),
  menuPanel: document.getElementById('menuPanel'),
  menuRoutes: document.getElementById('menuRoutes'),
  menuWeather: document.getElementById('menuWeather'),
  menuMeetTeam: document.getElementById('menuMeetTeam'),
  menuStory: document.getElementById('menuStory'),
  routesView: document.getElementById('routesView'),
  routesList: document.getElementById('routesList'),
  routesTitle: document.getElementById('routesTitle'),
  weatherView: document.getElementById('weatherView'),
  weatherBackBtn: document.getElementById('weatherBackBtn'),
  weatherPageTitle: document.getElementById('weatherPageTitle'),
  weatherPullHint: document.getElementById('weatherPullHint'),
  weatherChart: document.getElementById('weatherChart'),
  meetTeamView: document.getElementById('meetTeamView'),
  meetTeamBackBtn: document.getElementById('meetTeamBackBtn'),
  meetTeamPageTitle: document.getElementById('meetTeamPageTitle'),
  meetTeamBody: document.getElementById('meetTeamBody'),
  meetTeamGrid: document.getElementById('meetTeamGrid'),
  showAllPhotosBtn: document.getElementById('showAllPhotosBtn'),
  storyView: document.getElementById('storyView'),
  storyBackBtn: document.getElementById('storyBackBtn'),
  storyPageTitle: document.getElementById('storyPageTitle'),
  storyArticle: document.getElementById('storyArticle'),
  galleryView: document.getElementById('galleryView'),
  galleryBackBtn: document.getElementById('galleryBackBtn'),
  galleryTitle: document.getElementById('galleryTitle'),
  galleryPoiTitle: document.getElementById('galleryPoiTitle'),
  galleryStoryTitle: document.getElementById('galleryStoryTitle'),
  galleryTeamTitle: document.getElementById('galleryTeamTitle'),
  galleryPoiGrid: document.getElementById('galleryPoiGrid'),
  galleryStoryGrid: document.getElementById('galleryStoryGrid'),
  galleryTeamGrid: document.getElementById('galleryTeamGrid'),
  fabFilter: document.getElementById('fabFilter'),
  sheetBackdrop: document.getElementById('sheetBackdrop'),
  sheet: document.getElementById('filterSheet'),
  sheetDragZone: document.getElementById('sheetDragZone'),
  sheetCategoryList: document.getElementById('sheetCategoryList'),
  sheetFilterTitle: document.getElementById('sheetFilterTitle'),
  sheetCatHeading: document.getElementById('sheetCatHeading'),
  sheetLangHeading: document.getElementById('sheetLangHeading'),
  langSelect: /** @type {HTMLSelectElement} */ (document.getElementById('langSelect')),
  gpsToggle: /** @type {HTMLInputElement} */ (document.getElementById('gpsToggle')),
  gpsToggleLabel: document.getElementById('gpsToggleLabel'),
  weatherTitle: document.getElementById('weatherTitle'),
  weatherCurrent: document.getElementById('weatherCurrent'),
  weatherUpdated: document.getElementById('weatherUpdated'),
  weatherForecast: document.getElementById('weatherForecast'),
  locationAlert: document.getElementById('locationAlert'),
  storyBackdrop: document.getElementById('storyBackdrop'),
  storyModal: document.getElementById('storyModal'),
  storyTitle: document.getElementById('storyTitle'),
  storyBody: document.getElementById('storyBody'),
  storyCloseBtn: document.getElementById('storyCloseBtn'),
};

/** @type {any} */
let map = null;

/** @type {any[]} */
const markers = [];
const WEATHER_URL = `https://api.open-meteo.com/v1/forecast?latitude=${PIEVEDI_TECO_CENTER.lat}&longitude=${PIEVEDI_TECO_CENTER.lng}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`;
const STORY_COOKIE_NAME = 'pieve_story_seen';
const PIEVE_NEAR_RADIUS_KM = 12;
let weatherCache = null;
let weatherLoadedAtMs = 0;
const WEATHER_TTL_MS = 1000 * 60 * 15;
let gpsEnabled = false;
let gpsWatchId = null;
let userLocationMarker = null;
let locationAlertRequestId = 0;
const VIEW_CLOSE_MS = 420;
const TEAM_PHOTOS = [
  'assets/meet-the-team/meet-the-team-uso-web.jpeg',
  'assets/meet-the-team/meet-the-team-berga-marco.jpg',
];
const STORY_PHOTOS = [
  'assets/storia/storia-vista-paese.jpg',
  'assets/storia/storia-piazza-castagne.jpg',
  'assets/storia/storia-punto-panoramico.jpg',
  'assets/storia/storia-punto-panoramico2.jpg',
];
const STORY_PARAGRAPHS = [
  "Introduzione: Benvenuti nel sito di Pieve di Teco gemellata con la città Francese Bagnols-en-Forêt. Questa cittadina situata in Liguria, in provincia di Imperia si trova in un punto strategico, poiché è sia vicino alla città di Albenga sia a quella di Imperia.",
  "Le Origini del paese: dominio feudale dei marchesi di Clavesana, che eressero presso il monte Teco un castello e un piccolo fortilizio per il controllo dei traffici.",
  "Le Origini e il Dominio Genovese: l'attuale borgo di Pieve di Teco vide la nascita nel 1233 per volontà del marchese Antonio di Clavesana.",
  'Tra il XIV e il XV secolo il borgo vede la costruzione delle principali strutture religiose e dal 1386 entra nell’orbita della Repubblica di Genova.',
  "Secoli di conflitti e passaggi di potere: tra XV e XVIII secolo il borgo attraversa guerre, danni e cambi di sovranità, fino al periodo napoleonico.",
  "Dall'Epoca Napoleonica all'Unità d'Italia e oltre: nel 1815 passa al Regno di Sardegna, dal 1861 al Regno d'Italia, e nel XX secolo raggiunge l'assetto territoriale definitivo.",
];

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function escapeCssIdentColor(hex) {
  return /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : '#8E8E93';
}

function poiMarkerIcon(poi) {
  return poi.icon ?? CATEGORY_STYLES[poi.category]?.emoji ?? '📍';
}

function poiMarkerColor(poi) {
  return escapeCssIdentColor(CATEGORY_STYLES[poi.category]?.color ?? '#8E8E93');
}

function poiById(id) {
  return POIS.find((p) => p.id === id);
}

function isApplePlatform() {
  const ua = navigator.userAgent || '';
  const p = navigator.platform || '';
  return /iPad|iPhone|iPod|Mac/i.test(ua) || /Mac/i.test(p);
}

function poiNavigatorUrl(poi) {
  const waypoints = [{ lat: poi.lat, lng: poi.lng }];
  return isApplePlatform() ? appleMapsDirectionsUrl(waypoints) : googleMapsDirectionsUrl(waypoints);
}

function weatherCodeLabel(code) {
  const labels = {
    0: 'Clear',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog 🌫️',
    48: 'Rime fog 🌫️',
    51: 'Light drizzle',
    53: 'Drizzle',
    55: 'Heavy drizzle',
    61: 'Light rain',
    63: 'Rain',
    65: 'Heavy rain',
    71: 'Light snow',
    73: 'Snow',
    75: 'Heavy snow',
    80: 'Rain showers 🌦️',
    81: 'Rain showers 🌦️',
    82: 'Strong showers 🌧️',
    95: 'Thunderstorm ⛈️',
  };
  return labels[code] ?? 'Variable';
}

function weatherDayLabel(index) {
  if (index === 0) return t(currentLang, 'weatherToday');
  if (index === 1) return t(currentLang, 'weatherTomorrow');
  return t(currentLang, 'weatherNextDays');
}

function getPoiPhotos(poi) {
  return Array.isArray(poi.photos) ? poi.photos : [];
}

function kmBetween(aLat, aLng, bLat, bLng) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const aa =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * (2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa)));
}

async function reverseGeocodePlace(lat, lng) {
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=10`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('Reverse geocode failed');
    const data = await res.json();
    const addr = data?.address || {};
    return addr.city || addr.town || addr.village || addr.county || data?.display_name || 'Unknown place';
  } catch {
    return 'Unknown place';
  }
}

function routeWaypoints(route) {
  return route.waypointPoiIds.map((id) => {
    const p = poiById(id);
    if (!p) throw new Error(`Missing POI ${id} for route ${route.id}`);
    return { lat: p.lat, lng: p.lng };
  });
}

function filterMatchesSearch(poi, q) {
  if (!q) return true;
  const cat = categoryLabel(currentLang, poi.category).toLowerCase();
  const desc = (poi.description && String(poi.description).toLowerCase()) || '';
  return (
    poi.name.toLowerCase().includes(q) ||
    cat.includes(q) ||
    poi.category.toLowerCase().includes(q) ||
    desc.includes(q)
  );
}

function isPoiVisible(poi) {
  return categoryVisible[poi.category] !== false;
}

/** Map pins: category toggles only (search does not hide markers). */
function refreshMarkers() {
  markers.forEach((m, i) => {
    const poi = POIS[i];
    const show = isPoiVisible(poi);
    const el = m.getElement();
    if (el) el.style.display = show ? '' : 'none';
    if (show) m.addTo(map);
    else map.removeLayer(m);
  });
}

function buildPopupContent(poi) {
  const cat = categoryLabel(currentLang, poi.category);
  const desc =
    poi.description && String(poi.description).trim()
      ? `<p class="poi-popup__description">${escapeHtml(poi.description.trim())}</p>`
      : '';
  const note = poi.shortNote
    ? `<p class="poi-popup__note">${escapeHtml(poi.shortNote)}</p>`
    : '';
  const photos = getPoiPhotos(poi);
  const photosHtml = photos.length
    ? `<img src="${escapeHtml(photos[0])}" alt="${escapeHtml(poi.name)}" loading="lazy" data-carousel-image />
       ${photos.length > 1 ? `<button type="button" class="poi-popup__carousel-btn prev" data-action="prev" aria-label="${escapeHtml(t(currentLang, 'poiPopupPrevPhoto'))}">‹</button>
       <button type="button" class="poi-popup__carousel-btn next" data-action="next" aria-label="${escapeHtml(t(currentLang, 'poiPopupNextPhoto'))}">›</button>
       <div class="poi-popup__carousel-dots" data-carousel-dots>1 / ${photos.length}</div>` : ''}`
    : '';
  const goHref = poiNavigatorUrl(poi);
  return `<div class="poi-popup" data-poi-id="${escapeHtml(poi.id)}">
    <div class="poi-popup__title">${escapeHtml(poi.name)}</div>${desc}
    <div class="poi-popup__meta"><strong>${escapeHtml(t(currentLang, 'poiPopupCategory'))}:</strong> ${escapeHtml(cat)}</div>${note}
    <div class="poi-popup__photo-header">${escapeHtml(t(currentLang, 'poiPopupPhotos'))}</div>
    <div class="poi-popup__photos" data-photo-index="0" data-photo-list="${escapeHtml(JSON.stringify(photos))}">${photosHtml}</div>
    ${photos.length ? '' : `<p class="poi-popup__no-photos">${escapeHtml(t(currentLang, 'poiPopupDropPhotos'))}</p>`}
    <a class="poi-go-btn" href="${escapeHtml(goHref)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t(currentLang, 'poiPopupGo'))}</a>
  </div>`;
}

function getSearchMatches(q) {
  const norm = q.trim().toLowerCase();
  if (!norm) return [];
  return POIS.map((poi, index) => ({ poi, index })).filter(
    ({ poi }) => isPoiVisible(poi) && filterMatchesSearch(poi, norm),
  );
}

function hideSearchResults() {
  els.searchResults.hidden = true;
  els.searchResults.innerHTML = '';
  els.search.setAttribute('aria-expanded', 'false');
}

function renderSearchResults() {
  const q = els.search.value;
  const matches = getSearchMatches(q);
  els.searchResults.innerHTML = '';

  if (!q.trim()) {
    hideSearchResults();
    return;
  }

  els.searchResults.hidden = false;
  els.search.setAttribute('aria-expanded', 'true');

  if (matches.length === 0) {
    const li = document.createElement('li');
    li.className = 'search-results__empty';
    li.setAttribute('role', 'presentation');
    li.textContent = t(currentLang, 'searchNoResults');
    els.searchResults.appendChild(li);
    return;
  }

  matches.forEach(({ poi, index }) => {
    const li = document.createElement('li');
    li.setAttribute('role', 'none');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'search-results__item';
    btn.setAttribute('role', 'option');
    btn.dataset.poiIndex = String(index);
    const name = document.createElement('span');
    name.className = 'search-results__name';
    name.textContent = poi.name;
    const meta = document.createElement('span');
    meta.className = 'search-results__meta';
    meta.textContent = categoryLabel(currentLang, poi.category);
    btn.appendChild(name);
    btn.appendChild(meta);
    btn.addEventListener('mousedown', (e) => e.preventDefault());
    btn.addEventListener('click', () => {
      focusPoiAtIndex(index);
      hideSearchResults();
      els.search.blur();
    });
    li.appendChild(btn);
    els.searchResults.appendChild(li);
  });
}

function focusPoiAtIndex(index) {
  const poi = POIS[index];
  const marker = markers[index];
  if (!poi || !marker || !map) return;
  map.flyTo([poi.lat, poi.lng], Math.max(map.getZoom(), 17), {
    duration: 0.55,
  });
  marker.openPopup();
}

function onSearchInput() {
  refreshMarkers();
  renderSearchResults();
}

function initMap() {
  // @ts-ignore
  const worldBounds = L.latLngBounds(
    [PIEVEDI_TECO_CENTER.lat - 0.08, PIEVEDI_TECO_CENTER.lng - 0.08],
    [PIEVEDI_TECO_CENTER.lat + 0.08, PIEVEDI_TECO_CENTER.lng + 0.08],
  );

  // @ts-ignore
  map = L.map(els.map, {
    zoomControl: false,
    attributionControl: false,
    minZoom: 13,
    maxZoom: 20,
    maxBounds: worldBounds,
    maxBoundsViscosity: 0.85,
  }).setView([PIEVEDI_TECO_CENTER.lat, PIEVEDI_TECO_CENTER.lng], 17);

  // @ts-ignore — {r} is '' or '@2x' on retina (built into Leaflet tile URL)
  L.tileLayer(CARTO_VOYAGER, {
    attribution: '',
    subdomains: 'abcd',
    maxZoom: 20,
  }).addTo(map);

  POIS.forEach((poi) => {
    const ring = poiMarkerColor(poi);
    const sym = poiMarkerIcon(poi);
    // @ts-ignore
    const icon = L.divIcon({
      className: 'leaflet-div-icon poi-marker-root',
      html: `<div class="poi-marker" style="--poi-color: ${ring}" role="img" aria-label="${escapeHtml(poi.name)}">${sym}</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
    // @ts-ignore
    const marker = L.marker([poi.lat, poi.lng], { icon }).addTo(map);
    marker.bindPopup(buildPopupContent(poi), { maxWidth: 280 });
    markers.push(marker);
  });

  // @ts-ignore
  const bounds = L.latLngBounds(POIS.map((p) => [p.lat, p.lng]));
  if (bounds.isValid()) {
    // @ts-ignore
    map.fitBounds(bounds.pad(0.12), { padding: [52, 52], maxZoom: 17 });
  }

  refreshMarkers();
}

function showStoryModal(open) {
  els.storyBackdrop.classList.toggle('is-open', open);
  els.storyModal.classList.toggle('is-open', open);
  els.storyBackdrop.setAttribute('aria-hidden', open ? 'false' : 'true');
  els.storyModal.setAttribute('aria-hidden', open ? 'false' : 'true');
}

function setLocationAlert(message) {
  if (!message) {
    els.locationAlert.hidden = true;
    els.locationAlert.textContent = '';
    return;
  }
  els.locationAlert.textContent = message;
  els.locationAlert.hidden = false;
}

function storySeen() {
  return document.cookie.split(';').some((part) => part.trim().startsWith(`${STORY_COOKIE_NAME}=1`));
}

function rememberStorySeen() {
  document.cookie = `${STORY_COOKIE_NAME}=1; max-age=31536000; path=/; SameSite=Lax`;
}

function setGpsEnabled(next) {
  gpsEnabled = Boolean(next);
  els.gpsToggle.checked = gpsEnabled;
  if (!gpsEnabled) {
    if (gpsWatchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(gpsWatchId);
      gpsWatchId = null;
    }
    if (userLocationMarker && map) {
      map.removeLayer(userLocationMarker);
      userLocationMarker = null;
    }
    setLocationAlert('');
    return;
  }
  if (!navigator.geolocation || !map) {
    gpsEnabled = false;
    els.gpsToggle.checked = false;
    return;
  }
  if (gpsWatchId !== null) return;
  gpsWatchId = navigator.geolocation.watchPosition(
    async (position) => {
      const latLng = [position.coords.latitude, position.coords.longitude];
      if (!userLocationMarker) {
        // @ts-ignore
        userLocationMarker = L.circleMarker(latLng, {
          radius: 9,
          color: '#ffffff',
          weight: 3,
          fillColor: '#0a84ff',
          fillOpacity: 1,
          className: 'gps-blue-dot',
        }).addTo(map);
      } else {
        userLocationMarker.setLatLng(latLng);
      }

      const distanceKm = kmBetween(
        position.coords.latitude,
        position.coords.longitude,
        PIEVEDI_TECO_CENTER.lat,
        PIEVEDI_TECO_CENTER.lng,
      );
      if (distanceKm <= PIEVE_NEAR_RADIUS_KM) {
        setLocationAlert('');
        return;
      }
      const requestId = ++locationAlertRequestId;
      const place = await reverseGeocodePlace(position.coords.latitude, position.coords.longitude);
      if (requestId !== locationAlertRequestId) return;
      setLocationAlert(`${t(currentLang, 'notNearPievePrefix')} ${place}`);
    },
    () => {
      setGpsEnabled(false);
      setLocationAlert('');
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 5000 },
  );
}

function weatherDateLabel(date) {
  return new Date(date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
}

function buildWeatherYAxis(min, max) {
  const rows = [];
  for (let i = 0; i <= 4; i += 1) {
    const ratio = i / 4;
    const y = 20 + ratio * 120;
    const value = Math.round(max - (max - min) * ratio);
    rows.push(
      `<line x1="0" y1="${y}" x2="360" y2="${y}" stroke="rgba(0,0,0,0.08)" stroke-width="1"></line>
       <text x="5" y="${y - 4}" class="weather-y-label">${value}°</text>`,
    );
  }
  return rows.join('');
}

function renderWeather(data) {
  if (!data?.current || !data?.daily) {
    els.weatherCurrent.textContent = t(currentLang, 'weatherUnavailable');
    els.weatherUpdated.textContent = '';
    els.weatherForecast.innerHTML = '';
    els.weatherChart.innerHTML = '';
    return;
  }
  const current = data.current;
  els.weatherCurrent.textContent =
    `${weatherCodeLabel(current.weather_code)} · ${Math.round(current.temperature_2m)}°C · ` +
    `${t(currentLang, 'weatherFeelsLike')} ${Math.round(current.apparent_temperature)}°C · ` +
    `${t(currentLang, 'weatherWind')} ${Math.round(current.wind_speed_10m)} km/h · ` +
    `${t(currentLang, 'weatherHumidity')} ${Math.round(current.relative_humidity_2m)}%`;
  els.weatherUpdated.textContent = `${t(currentLang, 'weatherUpdatedPrefix')}: ${new Date().toLocaleTimeString()}`;
  const times = data.daily.time || [];
  const max = data.daily.temperature_2m_max || [];
  const min = data.daily.temperature_2m_min || [];
  const codes = data.daily.weather_code || [];
  const usedMax = max.slice(0, 7);
  const usedMin = min.slice(0, 7);
  const allTemps = [...usedMax, ...usedMin].filter((n) => Number.isFinite(n));
  const tMin = Math.min(...allTemps);
  const tMax = Math.max(...allTemps);
  const span = Math.max(1, tMax - tMin);
  const xFor = (i, total) => (i / Math.max(1, total - 1)) * 360;
  const yFor = (temp) => 140 - ((temp - tMin) / span) * 120;
  const maxPoints = usedMax.map((temp, i) => `${xFor(i, usedMax.length)},${yFor(temp)}`).join(' ');
  const minPoints = usedMin.map((temp, i) => `${xFor(i, usedMin.length)},${yFor(temp)}`).join(' ');
  els.weatherChart.innerHTML = `
    ${buildWeatherYAxis(tMin, tMax)}
    <polyline points="${maxPoints}" fill="none" stroke="#ff6b35" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
    <polyline points="${minPoints}" fill="none" stroke="#0a84ff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
  `;
  const daysHtml = times
    .slice(0, 7)
    .map(
      (date, i) => `<article class="weather-day">
        <div class="weather-day__name">${escapeHtml(i < 2 ? weatherDayLabel(i) : new Date(date).toLocaleDateString(undefined, { weekday: 'long' }))}</div>
        <div class="weather-day__date">${escapeHtml(weatherDateLabel(date))}</div>
        <div class="weather-day__meta">${escapeHtml(weatherCodeLabel(codes[i]))}</div>
        <div class="weather-day__temp">${Math.round(min[i])}° / ${Math.round(max[i])}°</div>
      </article>`,
    )
    .join('');
  els.weatherForecast.innerHTML = `<div class="weather-legend"><span class="max">Max</span><span class="min">Min</span></div>${daysHtml}`;
}

async function loadWeather(force = false) {
  if (!force && weatherCache && Date.now() - weatherLoadedAtMs < WEATHER_TTL_MS) {
    renderWeather(weatherCache);
    return;
  }
  els.weatherCurrent.textContent = t(currentLang, 'weatherLoading');
  try {
    const response = await fetch(WEATHER_URL);
    if (!response.ok) throw new Error(`Weather HTTP ${response.status}`);
    weatherCache = await response.json();
    weatherLoadedAtMs = Date.now();
    renderWeather(weatherCache);
  } catch {
    renderWeather(null);
  }
}

function setMenuOpen(open) {
  if (open) closeSheetAnimated();
  els.menuBackdrop.classList.toggle('is-open', open);
  els.menuPanel.classList.toggle('is-open', open);
  els.menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (open) hideSearchResults();
}

function hideViewAnimated(view) {
  if (!view.classList.contains('is-visible')) return;
  view.classList.add('is-closing');
  setTimeout(() => {
    view.classList.remove('is-visible');
    view.classList.remove('is-closing');
    view.setAttribute('aria-hidden', 'true');
  }, VIEW_CLOSE_MS);
}

function showView(view) {
  [els.routesView, els.weatherView, els.meetTeamView, els.storyView, els.galleryView].forEach((v) => {
    if (v !== view) hideViewAnimated(v);
  });
  view.classList.remove('is-closing');
  view.classList.add('is-visible');
  view.setAttribute('aria-hidden', 'false');
  setMenuOpen(false);
  hideSearchResults();
  els.fabFilter.style.visibility = 'hidden';
}

function hideAllViews() {
  [els.routesView, els.weatherView, els.meetTeamView, els.storyView, els.galleryView].forEach((v) =>
    hideViewAnimated(v),
  );
  els.fabFilter.style.visibility = 'visible';
}

function setSheetOpen(open) {
  if (open) setMenuOpen(false);
  els.sheetBackdrop.classList.toggle('is-open', open);
  els.sheet.classList.toggle('is-open', open);
  els.sheetBackdrop.setAttribute('aria-hidden', open ? 'false' : 'true');
  sheetDragOffset = 0;
  els.sheet.style.transform = '';
  els.sheet.classList.remove('is-dragging');
  if (open) hideSearchResults();
}

let sheetDragOffset = 0;
/** @type {number | null} */
let sheetPointerId = null;
let sheetStartY = 0;
let sheetStartOffset = 0;

function applySheetTransform(offsetPx) {
  const o = Math.max(0, offsetPx);
  els.sheet.style.transform = `translate3d(0, ${o}px, 0)`;
}

function closeSheetAnimated() {
  setSheetOpen(false);
}

function initSheetDrag() {
  const zone = els.sheetDragZone;
  const sheet = els.sheet;

  zone.addEventListener('pointerdown', (e) => {
    if (!sheet.classList.contains('is-open')) return;
    sheetPointerId = e.pointerId;
    sheetStartY = e.clientY;
    sheetStartOffset = sheetDragOffset;
    sheet.classList.add('is-dragging');
    zone.setPointerCapture(e.pointerId);
  });

  zone.addEventListener('pointermove', (e) => {
    if (sheetPointerId !== e.pointerId) return;
    const dy = e.clientY - sheetStartY;
    const next = Math.max(0, sheetStartOffset + dy);
    sheetDragOffset = next;
    applySheetTransform(next);
  });

  const endDrag = (e) => {
    if (sheetPointerId !== e.pointerId) return;
    try {
      zone.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    sheetPointerId = null;
    sheet.classList.remove('is-dragging');
    const threshold = sheet.offsetHeight * 0.22;
    if (sheetDragOffset > threshold) {
      sheetDragOffset = 0;
      sheet.style.transform = '';
      closeSheetAnimated();
    } else {
      sheetDragOffset = 0;
      sheet.style.transform = '';
    }
  };

  zone.addEventListener('pointerup', endDrag);
  zone.addEventListener('pointercancel', endDrag);
}

function renderCategoryToggles() {
  els.sheetCategoryList.innerHTML = '';
  POI_CATEGORY_ORDER.forEach((key) => {
    const row = document.createElement('label');
    row.className = 'toggle-row';
    const span = document.createElement('span');
    span.className = 'toggle-row-label';
    const st = CATEGORY_STYLES[key];
    if (st?.color) {
      const swatch = document.createElement('span');
      swatch.className = 'category-swatch';
      swatch.style.backgroundColor = escapeCssIdentColor(st.color);
      swatch.title = categoryLabel(currentLang, key);
      span.appendChild(swatch);
    }
    span.appendChild(document.createTextNode(`${st?.emoji ?? '📍'} `));
    const name = document.createElement('span');
    name.className = 'toggle-row-label-text';
    name.textContent = categoryLabel(currentLang, key);
    span.appendChild(name);
    const sw = document.createElement('span');
    sw.className = 'switch';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = categoryVisible[key] !== false;
    input.addEventListener('change', () => {
      categoryVisible[key] = input.checked;
      refreshMarkers();
      renderSearchResults();
    });
    const slider = document.createElement('span');
    slider.className = 'switch-slider';
    sw.appendChild(input);
    sw.appendChild(slider);
    row.appendChild(span);
    row.appendChild(sw);
    els.sheetCategoryList.appendChild(row);
  });
}

function fillLangSelect() {
  els.langSelect.innerHTML = '';
  LANGUAGES.forEach((lang) => {
    const opt = document.createElement('option');
    opt.value = lang.code;
    opt.textContent = lang.label;
    els.langSelect.appendChild(opt);
  });
  els.langSelect.value = currentLang;
}

function applyTranslations() {
  document.documentElement.lang = currentLang;
  els.search.placeholder = t(currentLang, 'searchPlaceholder');
  const menuRoutes = document.getElementById('menuRoutesLabel');
  if (menuRoutes) menuRoutes.textContent = t(currentLang, 'menuRoutes');
  const menuWeather = document.getElementById('menuWeatherLabel');
  if (menuWeather) menuWeather.textContent = t(currentLang, 'menuWeather');
  const menuMeet = document.getElementById('menuMeetTeamLabel');
  if (menuMeet) menuMeet.textContent = t(currentLang, 'menuMeetTeam');
  const menuStory = document.getElementById('menuStoryLabel');
  if (menuStory) menuStory.textContent = t(currentLang, 'menuStory');
  els.routesTitle.textContent = t(currentLang, 'routesTitle');
  const backBtn = document.getElementById('routesBackBtn');
  if (backBtn) backBtn.setAttribute('aria-label', t(currentLang, 'routesBackAria'));
  els.sheetFilterTitle.textContent = t(currentLang, 'filterTitle');
  els.gpsToggleLabel.textContent = t(currentLang, 'gpsToggle');
  els.sheetCatHeading.textContent = t(currentLang, 'filterCategories');
  els.sheetLangHeading.textContent = t(currentLang, 'filterLanguage');
  els.weatherTitle.textContent = t(currentLang, 'weatherTitle');
  els.weatherPageTitle.textContent = t(currentLang, 'weatherPageTitle');
  els.weatherPullHint.textContent = t(currentLang, 'weatherPullHint');
  els.storyTitle.textContent = t(currentLang, 'storyTitle');
  els.storyBody.textContent = t(currentLang, 'storyBody');
  els.storyCloseBtn.textContent = t(currentLang, 'storyButton');
  els.meetTeamPageTitle.textContent = t(currentLang, 'meetTeamTitle');
  els.meetTeamBody.textContent = t(currentLang, 'meetTeamBody');
  els.showAllPhotosBtn.textContent = t(currentLang, 'meetTeamShowAllPhotos');
  els.storyPageTitle.textContent = t(currentLang, 'storyPageTitle');
  els.galleryTitle.textContent = t(currentLang, 'galleryTitle');
  els.galleryPoiTitle.textContent = t(currentLang, 'galleryPoi');
  els.galleryStoryTitle.textContent = t(currentLang, 'galleryStory');
  els.galleryTeamTitle.textContent = t(currentLang, 'galleryMeetTeam');
  renderCategoryToggles();
  renderRoutes();
  renderWeather(weatherCache);
  markers.forEach((m, i) => {
    m.setPopupContent(buildPopupContent(POIS[i]));
  });
  renderSearchResults();
}

function renderMeetTeam() {
  els.meetTeamGrid.innerHTML = TEAM_PHOTOS.map((src) => `<img src="${escapeHtml(src)}" alt="Meet the team" loading="lazy" />`).join('');
}

function renderStoryPage() {
  const blocks = [];
  STORY_PARAGRAPHS.forEach((text, i) => {
    blocks.push(`<p>${escapeHtml(text)}</p>`);
    if (STORY_PHOTOS[i]) blocks.push(`<img src="${escapeHtml(STORY_PHOTOS[i])}" alt="Story photo" loading="lazy" />`);
  });
  els.storyArticle.innerHTML = blocks.join('');
}

function renderGallery() {
  const poiPhotos = POIS.flatMap((poi) => getPoiPhotos(poi));
  els.galleryPoiGrid.innerHTML = poiPhotos.map((src) => `<img src="${escapeHtml(src)}" alt="POI photo" loading="lazy" />`).join('');
  els.galleryStoryGrid.innerHTML = STORY_PHOTOS.map((src) => `<img src="${escapeHtml(src)}" alt="Story photo" loading="lazy" />`).join('');
  els.galleryTeamGrid.innerHTML = TEAM_PHOTOS.map((src) => `<img src="${escapeHtml(src)}" alt="Team photo" loading="lazy" />`).join('');
}

function renderRoutes() {
  els.routesList.innerHTML = '';
  ROUTES.forEach((route) => {
    const waypoints = routeWaypoints(route);
    const g = googleMapsDirectionsUrl(waypoints);
    const a = appleMapsDirectionsUrl(waypoints);
    const card = document.createElement('article');
    card.className = 'route-card';
    card.innerHTML = `
      <h3>${escapeHtml(route.name)}</h3>
      <div class="route-meta">
        <span>🚶 ${route.walkingTimeMinutes} ${t(currentLang, 'minutesShort')}</span>
        <span>📏 ${route.distanceKm} ${t(currentLang, 'kmShort')}</span>
      </div>
      <p>${escapeHtml(route.description)}</p>
      <div class="route-actions">
        <a href="${escapeHtml(g)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t(currentLang, 'routeExportGoogle'))}</a>
        <a href="${escapeHtml(a)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t(currentLang, 'routeExportApple'))}</a>
      </div>`;
    els.routesList.appendChild(card);
  });
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }
}

function bindUi() {
  els.menuBtn.addEventListener('click', () => {
    const open = !els.menuPanel.classList.contains('is-open');
    setMenuOpen(open);
  });
  els.menuBackdrop.addEventListener('click', () => setMenuOpen(false));

  els.menuRoutes.addEventListener('click', () => {
    showView(els.routesView);
  });
  els.menuWeather.addEventListener('click', () => {
    showView(els.weatherView);
    loadWeather();
  });
  els.menuMeetTeam.addEventListener('click', () => showView(els.meetTeamView));
  els.menuStory.addEventListener('click', () => showView(els.storyView));

  document.getElementById('routesBackBtn').addEventListener('click', () => {
    hideAllViews();
  });
  els.weatherBackBtn.addEventListener('click', () => {
    hideAllViews();
  });
  els.meetTeamBackBtn.addEventListener('click', hideAllViews);
  els.storyBackBtn.addEventListener('click', hideAllViews);
  els.galleryBackBtn.addEventListener('click', () => showView(els.meetTeamView));
  els.showAllPhotosBtn.addEventListener('click', () => showView(els.galleryView));

  els.search.addEventListener('input', onSearchInput);
  els.search.addEventListener('focus', () => {
    if (els.search.value.trim()) renderSearchResults();
  });
  els.search.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideSearchResults();
      els.search.blur();
    }
  });

  document.addEventListener('click', (e) => {
    if (!els.searchWrap.contains(/** @type {Node} */ (e.target))) {
      hideSearchResults();
    }
  });

  els.fabFilter.addEventListener('click', () => {
    setSheetOpen(true);
  });
  els.sheetBackdrop.addEventListener('click', () => closeSheetAnimated());

  els.langSelect.addEventListener('change', () => {
    currentLang = els.langSelect.value || DEFAULT_LANG;
    applyTranslations();
    refreshMarkers();
  });

  els.gpsToggle.addEventListener('change', () => {
    setGpsEnabled(els.gpsToggle.checked);
  });

  els.storyCloseBtn.addEventListener('click', () => {
    rememberStorySeen();
    setGpsEnabled(true);
    showStoryModal(false);
  });
  els.storyBackdrop.addEventListener('click', () => {
    rememberStorySeen();
    showStoryModal(false);
  });

  document.addEventListener('click', (e) => {
    const btn = e.target?.closest?.('.poi-popup__carousel-btn');
    if (!btn) return;
    const wrap = btn.closest('.poi-popup__photos');
    const img = wrap?.querySelector('[data-carousel-image]');
    if (!wrap || !img) return;
    let list = [];
    try {
      list = JSON.parse(wrap.getAttribute('data-photo-list') || '[]');
    } catch {
      return;
    }
    if (!Array.isArray(list) || list.length < 2) return;
    const currentIndex = Number(wrap.getAttribute('data-photo-index') || '0');
    const nextIndex =
      btn.getAttribute('data-action') === 'next'
        ? (currentIndex + 1) % list.length
        : (currentIndex - 1 + list.length) % list.length;
    wrap.setAttribute('data-photo-index', String(nextIndex));
    img.src = list[nextIndex];
    const dots = wrap.querySelector('[data-carousel-dots]');
    if (dots) dots.textContent = `${nextIndex + 1} / ${list.length}`;
  });

  let pullStartY = 0;
  let canPull = false;
  els.weatherView.addEventListener('touchstart', (e) => {
    if (!els.weatherView.classList.contains('is-visible')) return;
    canPull = els.weatherView.scrollTop <= 0;
    pullStartY = e.touches[0].clientY;
  });
  els.weatherView.addEventListener('touchmove', (e) => {
    if (!canPull) return;
    const dy = e.touches[0].clientY - pullStartY;
    if (dy > 70) els.weatherPullHint.textContent = t(currentLang, 'weatherReleaseHint');
  });
  els.weatherView.addEventListener('touchend', async (e) => {
    if (!canPull) return;
    canPull = false;
    const dy = (e.changedTouches?.[0]?.clientY ?? pullStartY) - pullStartY;
    els.weatherPullHint.textContent = t(currentLang, 'weatherPullHint');
    if (dy > 70) {
      els.weatherPullHint.textContent = t(currentLang, 'weatherRefreshing');
      await loadWeather(true);
      els.weatherPullHint.textContent = t(currentLang, 'weatherPullHint');
    }
  });
}

function boot() {
  fillLangSelect();
  applyTranslations();
  initMap();
  renderMeetTeam();
  renderStoryPage();
  renderGallery();
  initSheetDrag();
  bindUi();
  if (!storySeen()) {
    showStoryModal(true);
    setGpsEnabled(true);
  }
  loadWeather();
  registerServiceWorker();
}

boot();
