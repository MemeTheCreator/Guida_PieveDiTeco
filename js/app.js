import {
  PIEVEDI_TECO_CENTER,
  POIS,
  ROUTES,
  POI_CATEGORY_ORDER,
  CATEGORY_STYLES,
} from './data.js';
import { DEFAULT_LANG, LANGUAGES, t, categoryLabel } from './i18n.js';
import { googleMapsDirectionsUrl, appleMapsDirectionsUrl } from './map-links.js';

/** @type {string} */
let currentLang = DEFAULT_LANG;

/** @type {Record<string, boolean>} */
const categoryVisible = Object.fromEntries(POI_CATEGORY_ORDER.map((k) => [k, true]));

const els = {
  map: /** @type {HTMLElement} */ (document.getElementById('map')),
  search: /** @type {HTMLInputElement} */ (document.getElementById('searchInput')),
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
};

/** @type {any} */
let map = null;

/** @type {any[]} */
const markers = [];

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
  return (
    poi.name.toLowerCase().includes(q) ||
    cat.includes(q) ||
    poi.category.toLowerCase().includes(q)
  );
}

function isPoiVisible(poi) {
  return categoryVisible[poi.category] !== false;
}

function refreshMarkers() {
  const q = els.search.value.trim().toLowerCase();
  markers.forEach((m, i) => {
    const poi = POIS[i];
    const show = isPoiVisible(poi) && filterMatchesSearch(poi, q);
    const el = m.getElement();
    if (el) el.style.display = show ? '' : 'none';
    if (show) m.addTo(map);
    else map.removeLayer(m);
  });
}

function buildPopupContent(poi) {
  const cat = categoryLabel(currentLang, poi.category);
  const note = poi.shortNote
    ? `<p class="poi-popup__note">${escapeHtml(poi.shortNote)}</p>`
    : '';
  return `<div class="poi-popup__title">${escapeHtml(poi.name)}</div>
    <div class="poi-popup__meta"><strong>${escapeHtml(t(currentLang, 'poiPopupCategory'))}:</strong> ${escapeHtml(cat)}</div>${note}`;
}

function initMap() {
  // @ts-ignore — Leaflet global from script tag
  map = L.map(els.map, {
    zoomControl: true,
    attributionControl: true,
  }).setView([PIEVEDI_TECO_CENTER.lat, PIEVEDI_TECO_CENTER.lng], 17);

  // @ts-ignore
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
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
    map.fitBounds(bounds, { padding: [52, 52], maxZoom: 17 });
  }

  refreshMarkers();
}

function setMenuOpen(open) {
  if (open) closeSheetAnimated();
  els.menuBackdrop.classList.toggle('is-open', open);
  els.menuPanel.classList.toggle('is-open', open);
  els.menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
}

function setRoutesVisible(visible) {
  els.routesView.classList.toggle('is-visible', visible);
  els.routesView.setAttribute('aria-hidden', visible ? 'false' : 'true');
  els.fabFilter.style.visibility = visible ? 'hidden' : 'visible';
  if (visible) setMenuOpen(false);
}

function setSheetOpen(open) {
  if (open) setMenuOpen(false);
  els.sheetBackdrop.classList.toggle('is-open', open);
  els.sheet.classList.toggle('is-open', open);
  els.sheetBackdrop.setAttribute('aria-hidden', open ? 'false' : 'true');
  sheetDragOffset = 0;
  els.sheet.style.transform = '';
  els.sheet.classList.remove('is-dragging');
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
  els.sheetCatHeading.textContent = t(currentLang, 'filterCategories');
  els.sheetLangHeading.textContent = t(currentLang, 'filterLanguage');
  renderCategoryToggles();
  renderRoutes();
  markers.forEach((m, i) => {
    m.setPopupContent(buildPopupContent(POIS[i]));
  });
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
  });

  document.getElementById('routesBackBtn').addEventListener('click', () => {
    setRoutesVisible(false);
  });

  els.search.addEventListener('input', () => refreshMarkers());

  els.fabFilter.addEventListener('click', () => {
    setSheetOpen(true);
  });
  els.sheetBackdrop.addEventListener('click', () => closeSheetAnimated());

  els.langSelect.addEventListener('change', () => {
    currentLang = els.langSelect.value || DEFAULT_LANG;
    applyTranslations();
    refreshMarkers();
  });
}

function boot() {
  fillLangSelect();
  applyTranslations();
  initMap();
  initSheetDrag();
  bindUi();
  registerServiceWorker();
}

boot();
