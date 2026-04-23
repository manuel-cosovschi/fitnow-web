import type { RunMetrics, RunSession } from './types';

/**
 * Returns fatigue level 0-1 based on pace degradation across the session.
 * Compares average pace of the first third vs the current sliding window.
 */
export function estimateFatigue(session: RunSession): number {
  const { samples } = session;
  if (samples.length < 30) return 0;

  const splitIdx = Math.floor(samples.length / 3);
  const early = windowPace(samples.slice(0, splitIdx));
  const recent = windowPace(samples.slice(-Math.min(60, splitIdx)));

  if (!early || !recent) return 0;
  // Higher sec/km => slower. Fatigue = degradation ratio capped to [0,1].
  const delta = (recent - early) / early;
  return Math.max(0, Math.min(1, delta * 2));
}

function windowPace(samples: RunSession['samples']): number | null {
  if (samples.length < 2) return null;
  const first = samples[0];
  const last = samples[samples.length - 1];
  const seconds = (last.timestamp - first.timestamp) / 1000;
  let distance = 0;
  for (let i = 1; i < samples.length; i++) {
    const a = samples[i - 1];
    const b = samples[i];
    distance += Math.hypot((a.lat - b.lat) * 111_000, (a.lng - b.lng) * 111_000 * Math.cos(((a.lat + b.lat) / 2) * Math.PI / 180));
  }
  if (distance < 50) return null;
  return (seconds / (distance / 1000)); // sec/km
}

export function computeMetrics(session: RunSession): RunMetrics {
  const { samples, startedAt } = session;
  if (samples.length < 2) {
    return {
      distanceMeters: 0,
      durationSeconds: 0,
      pace: null,
      currentSpeed: null,
      avgSpeed: null,
      elevationGain: 0,
      caloriesEstimate: 0,
    };
  }

  let distance = 0;
  let elevationGain = 0;
  for (let i = 1; i < samples.length; i++) {
    const a = samples[i - 1];
    const b = samples[i];
    const d = Math.hypot((a.lat - b.lat) * 111_000, (a.lng - b.lng) * 111_000 * Math.cos(((a.lat + b.lat) / 2) * Math.PI / 180));
    distance += d;
    if (a.altitude != null && b.altitude != null && b.altitude > a.altitude) elevationGain += b.altitude - a.altitude;
  }

  const last = samples[samples.length - 1];
  const endedAt = session.endedAt ?? last.timestamp;
  const durationSeconds = Math.max(1, Math.round((endedAt - startedAt) / 1000));
  const avgSpeed = distance / durationSeconds; // m/s
  const pace = avgSpeed > 0 ? 1000 / avgSpeed : null; // sec/km

  // Rough calorie estimate: 1 kcal per kg-km. Assume 70kg average.
  const caloriesEstimate = Math.round((distance / 1000) * 70);

  return {
    distanceMeters: Math.round(distance),
    durationSeconds,
    pace,
    currentSpeed: last.speed ?? null,
    avgSpeed,
    elevationGain: Math.round(elevationGain),
    caloriesEstimate,
  };
}
