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
  routesView: document.getElementById('routesView'),
  routesList: document.getElementById('routesList'),
  routesTitle: document.getElementById('routesTitle'),
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
const uploadedPhotosByPoiId = new Map();
const WEATHER_URL = `https://api.open-meteo.com/v1/forecast?latitude=${PIEVEDI_TECO_CENTER.lat}&longitude=${PIEVEDI_TECO_CENTER.lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=4`;
const STORY_COOKIE_NAME = 'pieve_story_seen';
let weatherCache = null;
let weatherLoadedAtMs = 0;
const WEATHER_TTL_MS = 1000 * 60 * 15;
let gpsEnabled = false;
let gpsWatchId = null;
let userLocationMarker = null;

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
    45: 'Fog',
    48: 'Rime fog',
    51: 'Light drizzle',
    53: 'Drizzle',
    55: 'Heavy drizzle',
    61: 'Light rain',
    63: 'Rain',
    65: 'Heavy rain',
    71: 'Light snow',
    73: 'Snow',
    75: 'Heavy snow',
    80: 'Rain showers',
    81: 'Rain showers',
    82: 'Strong showers',
    95: 'Thunderstorm',
  };
  return labels[code] ?? 'Variable';
}

function weatherDayLabel(index) {
  if (index === 0) return t(currentLang, 'weatherToday');
  if (index === 1) return t(currentLang, 'weatherTomorrow');
  return t(currentLang, 'weatherNextDays');
}

function getPoiPhotos(poi) {
  const local = uploadedPhotosByPoiId.get(poi.id) || [];
  const fromAssets = Array.isArray(poi.photos) ? poi.photos : [];
  return [...fromAssets, ...local];
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
    ? photos
        .map((src) => `<img src="${escapeHtml(src)}" alt="${escapeHtml(poi.name)}" loading="lazy" />`)
        .join('')
    : `<p class="poi-popup__no-photos">${escapeHtml(t(currentLang, 'poiPopupDropPhotos'))}</p>`;
  const goHref = poiNavigatorUrl(poi);
  return `<div class="poi-popup" data-poi-id="${escapeHtml(poi.id)}">
    <div class="poi-popup__title">${escapeHtml(poi.name)}</div>${desc}
    <div class="poi-popup__meta"><strong>${escapeHtml(t(currentLang, 'poiPopupCategory'))}:</strong> ${escapeHtml(cat)}</div>${note}
    <div class="poi-popup__photo-header">${escapeHtml(t(currentLang, 'poiPopupPhotos'))}</div>
    <div class="poi-popup__photos">${photosHtml}</div>
    <label class="poi-photo-drop" data-poi-drop="${escapeHtml(poi.id)}">
      <input type="file" accept="image/*" multiple data-poi-file="${escapeHtml(poi.id)}" />
      ${escapeHtml(t(currentLang, 'poiPopupDropPhotos'))}
    </label>
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

  map.on('popupopen', (e) => {
    const root = e.popup.getElement();
    if (!root) return;
    const poiId = root.querySelector('.poi-popup')?.getAttribute('data-poi-id');
    const poi = poiById(poiId);
    if (!poi) return;
    const input = root.querySelector(`[data-poi-file="${poi.id}"]`);
    const dropZone = root.querySelector(`[data-poi-drop="${poi.id}"]`);
    if (!input || !dropZone) return;
    const applyFiles = (files) => {
      const entries = uploadedPhotosByPoiId.get(poi.id) || [];
      Array.from(files).forEach((file) => {
        if (file.type.startsWith('image/')) {
          entries.push(URL.createObjectURL(file));
        }
      });
      uploadedPhotosByPoiId.set(poi.id, entries);
      const index = POIS.findIndex((p) => p.id === poi.id);
      if (index >= 0) markers[index].setPopupContent(buildPopupContent(poi));
      e.popup.update();
      if (index >= 0) markers[index].openPopup();
    };
    input.addEventListener('change', () => {
      if (input.files?.length) applyFiles(input.files);
    });
    dropZone.addEventListener('dragover', (event) => {
      event.preventDefault();
      dropZone.classList.add('is-dragover');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('is-dragover'));
    dropZone.addEventListener('drop', (event) => {
      event.preventDefault();
      dropZone.classList.remove('is-dragover');
      if (event.dataTransfer?.files?.length) applyFiles(event.dataTransfer.files);
    });
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
    return;
  }
  if (!navigator.geolocation || !map) {
    gpsEnabled = false;
    els.gpsToggle.checked = false;
    return;
  }
  if (gpsWatchId !== null) return;
  gpsWatchId = navigator.geolocation.watchPosition(
    (position) => {
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
    },
    () => {
      setGpsEnabled(false);
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 5000 },
  );
}

function renderWeather(data) {
  if (!data?.current || !data?.daily) {
    els.weatherCurrent.textContent = t(currentLang, 'weatherUnavailable');
    els.weatherUpdated.textContent = '';
    els.weatherForecast.innerHTML = '';
    return;
  }
  const current = data.current;
  els.weatherCurrent.textContent =
    `${weatherCodeLabel(current.weather_code)} · ${Math.round(current.temperature_2m)}°C · ` +
    `${t(currentLang, 'weatherWind')} ${Math.round(current.wind_speed_10m)} km/h · ` +
    `${t(currentLang, 'weatherHumidity')} ${Math.round(current.relative_humidity_2m)}%`;
  els.weatherUpdated.textContent = `${t(currentLang, 'weatherUpdatedPrefix')}: ${new Date().toLocaleTimeString()}`;
  const times = data.daily.time || [];
  const max = data.daily.temperature_2m_max || [];
  const min = data.daily.temperature_2m_min || [];
  const codes = data.daily.weather_code || [];
  els.weatherForecast.innerHTML = times
    .slice(0, 4)
    .map(
      (date, i) => `<article class="weather-day">
        <div class="weather-day__name">${escapeHtml(i < 2 ? weatherDayLabel(i) : new Date(date).toLocaleDateString(undefined, { weekday: 'short' }))}</div>
        <div class="weather-day__meta">${escapeHtml(weatherCodeLabel(codes[i]))}</div>
        <div class="weather-day__temp">${Math.round(min[i])}° / ${Math.round(max[i])}°</div>
      </article>`,
    )
    .join('');
}

async function loadWeather() {
  if (weatherCache && Date.now() - weatherLoadedAtMs < WEATHER_TTL_MS) {
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

function setRoutesVisible(visible) {
  els.routesView.classList.toggle('is-visible', visible);
  els.routesView.setAttribute('aria-hidden', visible ? 'false' : 'true');
  els.fabFilter.style.visibility = visible ? 'hidden' : 'visible';
  if (visible) {
    setMenuOpen(false);
    hideSearchResults();
  }
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
  const ph2 = document.getElementById('menuPlaceholder2Label');
  if (ph2) ph2.textContent = t(currentLang, 'menuPlaceholder2');
  const ph3 = document.getElementById('menuPlaceholder3Label');
  if (ph3) ph3.textContent = t(currentLang, 'menuPlaceholder3');
  els.routesTitle.textContent = t(currentLang, 'routesTitle');
  const backBtn = document.getElementById('routesBackBtn');
  if (backBtn) backBtn.setAttribute('aria-label', t(currentLang, 'routesBackAria'));
  els.sheetFilterTitle.textContent = t(currentLang, 'filterTitle');
  els.gpsToggleLabel.textContent = t(currentLang, 'gpsToggle');
  els.sheetCatHeading.textContent = t(currentLang, 'filterCategories');
  els.sheetLangHeading.textContent = t(currentLang, 'filterLanguage');
  els.weatherTitle.textContent = t(currentLang, 'weatherTitle');
  els.storyTitle.textContent = t(currentLang, 'storyTitle');
  els.storyBody.textContent = t(currentLang, 'storyBody');
  els.storyCloseBtn.textContent = t(currentLang, 'storyButton');
  renderCategoryToggles();
  renderRoutes();
  renderWeather(weatherCache);
  markers.forEach((m, i) => {
    m.setPopupContent(buildPopupContent(POIS[i]));
  });
  renderSearchResults();
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
    setRoutesVisible(true);
    loadWeather();
  });

  document.getElementById('routesBackBtn').addEventListener('click', () => {
    setRoutesVisible(false);
  });

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
    showStoryModal(false);
  });
  els.storyBackdrop.addEventListener('click', () => {
    rememberStorySeen();
    showStoryModal(false);
  });
}

function boot() {
  fillLangSelect();
  applyTranslations();
  initMap();
  initSheetDrag();
  bindUi();
  if (!storySeen()) showStoryModal(true);
  loadWeather();
  registerServiceWorker();
}

boot();
