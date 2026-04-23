import { useCallback, useEffect, useRef, useState } from 'react';
import type { AccuracyMode, GeoSample } from './types';
import { haversine } from './geo';

interface Options {
  mode?: AccuracyMode;
  /** Reject samples with worse accuracy than this (meters). */
  maxAccuracyMeters?: number;
  /** Minimum distance between kept samples (meters). Filters jitter while idle. */
  minDistanceMeters?: number;
  enabled?: boolean;
}

const MODE_OPTIONS: Record<AccuracyMode, PositionOptions> = {
  high:          { enableHighAccuracy: true,  maximumAge: 0,    timeout: 10_000 },
  balanced:      { enableHighAccuracy: true,  maximumAge: 2_000, timeout: 10_000 },
  battery_saver: { enableHighAccuracy: false, maximumAge: 5_000, timeout: 15_000 },
};

export interface GeolocationState {
  current: GeoSample | null;
  samples: GeoSample[];
  error: string | null;
  permission: 'granted' | 'denied' | 'prompt' | 'unknown';
  isWatching: boolean;
}

/**
 * Real Geolocation hook with jitter filtering and accuracy modes.
 * Uses a simple 1-euro-filter style smoother (distance gate + accuracy gate).
 */
export function useGeolocation(opts: Options = {}) {
  const { mode = 'balanced', maxAccuracyMeters = 30, minDistanceMeters = 3, enabled = true } = opts;

  const [state, setState] = useState<GeolocationState>({
    current: null,
    samples: [],
    error: null,
    permission: 'unknown',
    isWatching: false,
  });

  const watchId = useRef<number | null>(null);
  const lastKeptRef = useRef<GeoSample | null>(null);

  const handleSample = useCallback((pos: GeolocationPosition) => {
    const sample: GeoSample = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy ?? 9999,
      altitude: pos.coords.altitude ?? null,
      speed: pos.coords.speed ?? null,
      heading: pos.coords.heading ?? null,
      timestamp: pos.timestamp,
    };

    if (sample.accuracy > maxAccuracyMeters) {
      setState(s => ({ ...s, current: sample })); // surface current reading but don't append
      return;
    }

    const last = lastKeptRef.current;
    if (last) {
      const d = haversine(last, sample);
      if (d < minDistanceMeters) {
        setState(s => ({ ...s, current: sample }));
        return;
      }
    }
    lastKeptRef.current = sample;

    setState(s => ({
      ...s,
      current: sample,
      samples: [...s.samples, sample],
      error: null,
    }));
  }, [maxAccuracyMeters, minDistanceMeters]);

  const handleError = useCallback((err: GeolocationPositionError) => {
    const message =
      err.code === 1 ? 'Permiso de ubicación denegado'
      : err.code === 2 ? 'No se pudo obtener ubicación'
      : err.code === 3 ? 'Timeout de ubicación'
      : 'Error de GPS';
    setState(s => ({ ...s, error: message }));
  }, []);

  const start = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState(s => ({ ...s, error: 'Geolocation no disponible en este dispositivo' }));
      return;
    }
    if (watchId.current != null) return;
    watchId.current = navigator.geolocation.watchPosition(handleSample, handleError, MODE_OPTIONS[mode]);
    setState(s => ({ ...s, isWatching: true }));
  }, [handleSample, handleError, mode]);

  const stop = useCallback(() => {
    if (watchId.current != null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setState(s => ({ ...s, isWatching: false }));
  }, []);

  const reset = useCallback(() => {
    lastKeptRef.current = null;
    setState(s => ({ ...s, samples: [], current: null, error: null }));
  }, []);

  useEffect(() => {
    if (!enabled) return;
    start();
    return stop;
  }, [enabled, start, stop]);

  useEffect(() => {
    if (!navigator.permissions) return;
    navigator.permissions.query({ name: 'geolocation' as PermissionName }).then(p => {
      setState(s => ({ ...s, permission: p.state as GeolocationState['permission'] }));
      p.onchange = () => setState(s => ({ ...s, permission: p.state as GeolocationState['permission'] }));
    }).catch(() => {});
  }, []);

  return { ...state, start, stop, reset };
}
