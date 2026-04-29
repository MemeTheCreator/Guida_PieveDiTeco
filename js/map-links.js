/**
 * Build deep links for walking directions through ordered waypoints (lat,lng).
 */

function encodeGoogleWaypoint(lat, lng) {
  return `${Number(lat).toFixed(6)},${Number(lng).toFixed(6)}`;
}

/**
 * Google Maps directions (walking) — first stop origin, last destination, middle as waypoints.
 * @param {{ lat: number, lng: number }[]} waypoints
 */
export function googleMapsDirectionsUrl(waypoints) {
  if (!waypoints.length) return 'https://www.google.com/maps';
  if (waypoints.length === 1) {
    const w = waypoints[0];
    return `https://www.google.com/maps/search/?api=1&query=${encodeGoogleWaypoint(w.lat, w.lng)}`;
  }
  const origin = waypoints[0];
  const destination = waypoints[waypoints.length - 1];
  const middle = waypoints.slice(1, -1);
  const params = new URLSearchParams({
    api: '1',
    origin: encodeGoogleWaypoint(origin.lat, origin.lng),
    destination: encodeGoogleWaypoint(destination.lat, destination.lng),
    travelmode: 'walking',
  });
  if (middle.length) {
    params.set('waypoints', middle.map((p) => encodeGoogleWaypoint(p.lat, p.lng)).join('|'));
  }
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/**
 * Apple Maps — walking directions from first to last coordinate (intermediate stops not universally supported).
 * @param {{ lat: number, lng: number }[]} waypoints
 */
export function appleMapsDirectionsUrl(waypoints) {
  if (!waypoints.length) return 'https://maps.apple.com/';
  if (waypoints.length === 1) {
    const w = waypoints[0];
    return `https://maps.apple.com/?ll=${encodeGoogleWaypoint(w.lat, w.lng)}&q=${encodeGoogleWaypoint(w.lat, w.lng)}`;
  }
  const a = waypoints[0];
  const b = waypoints[waypoints.length - 1];
  const params = new URLSearchParams({
    saddr: encodeGoogleWaypoint(a.lat, a.lng),
    daddr: encodeGoogleWaypoint(b.lat, b.lng),
    dirflg: 'w',
  });
  return `https://maps.apple.com/?${params.toString()}`;
}
