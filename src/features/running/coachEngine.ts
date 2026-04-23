import type { CoachMessage, RunSession } from './types';
import { estimateFatigue } from './fatigueEstimator';

interface CoachContext {
  session: RunSession;
  targetPaceSecPerKm?: number | null;
  lastMessageAt: number;
}

const MIN_INTERVAL_MS = 25_000;

/**
 * Returns a new coach message if conditions warrant one, else null.
 * Rules:
 *  - pace drift >10% slower than target → "bajá ritmo" (info) or "vas muy despacio" (warning)
 *  - pace drift >10% faster than target → "vas muy rápido" (info)
 *  - every 1km covered → positive reinforcement
 *  - fatigue >0.6 → hydration + pacing reminder
 *  - duration >40min with pace stable → "excelente pacing"
 */
export function maybeGenerateCoachMessage(ctx: CoachContext): CoachMessage | null {
  const now = Date.now();
  if (now - ctx.lastMessageAt < MIN_INTERVAL_MS) return null;

  const { session } = ctx;
  const { metrics } = session;

  if (metrics.durationSeconds < 20) return null;

  const fatigue = estimateFatigue(session);

  // km milestone (once per km)
  const km = Math.floor(metrics.distanceMeters / 1000);
  const prevKm = session.coachMessages.filter(m => m.text.startsWith('Llevás')).length;
  if (km > prevKm && km > 0) {
    return message(`Llevás ${km} km. Seguí así 🔥`, 'positive');
  }

  // High fatigue
  if (fatigue > 0.6) {
    return message('Estás fatigándote. Hidratate y bajá un toque el ritmo.', 'warning');
  }

  if (ctx.targetPaceSecPerKm && metrics.pace != null) {
    const drift = (metrics.pace - ctx.targetPaceSecPerKm) / ctx.targetPaceSecPerKm;
    if (drift > 0.12) return message('Vas más lento del objetivo. Subí un poco el ritmo.', 'info');
    if (drift < -0.12) return message('Vas muy rápido. Cuidado con el pique temprano.', 'info');
  }

  // Long steady effort
  if (metrics.durationSeconds > 40 * 60 && fatigue < 0.3) {
    return message('Excelente pacing. Si seguís así rompés récord.', 'positive');
  }

  return null;
}

function message(text: string, severity: CoachMessage['severity']): CoachMessage {
  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    text,
    severity,
    timestamp: Date.now(),
    spoken: false,
  };
}

/** Formats pace as m:ss /km for display. */
export function formatPace(secPerKm: number | null): string {
  if (!secPerKm || !Number.isFinite(secPerKm)) return '—';
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60).toString().padStart(2, '0');
  return `${m}:${s} /km`;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s}`;
  return `${m}:${s}`;
}
