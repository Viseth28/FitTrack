export interface Coordinate {
  lat: number;
  lng: number;
}

export function calculateDistance(coord1: Coordinate, coord2: Coordinate): number {
  const R = 6371e3; // Earth radius in meters
  const lat1 = (coord1.lat * Math.PI) / 180;
  const lat2 = (coord2.lat * Math.PI) / 180;
  const deltaLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const deltaLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function calculatePace(distanceMeters: number, durationSeconds: number): string {
  if (distanceMeters === 0) return '-:--';
  
  const distanceKm = distanceMeters / 1000;
  const paceMinutes = durationSeconds / 60 / distanceKm;
  
  const pMin = Math.floor(paceMinutes);
  const pSec = Math.round((paceMinutes - pMin) * 60);
  
  return `${pMin}'${pSec.toString().padStart(2, '0')}"`;
}
