import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AICommand, CoachMessage, DynamicRoute, GeoSample, RunSession, SafetyAlert } from './types';
import { computeMetrics } from './fatigueEstimator';
import { formatPace } from './coachEngine';
import { persistRunSession } from './api';
import { recalculateRoute, routeDistanceMeters } from './routeEngine';
import { evaluateSafety, isNight } from './safetyEngine';
import { useBatteryStatus } from './useBatteryStatus';
import { useGeolocation } from './useGeolocation';
import { maybeGenerateCoachMessage } from './coachEngine';

interface UseRunSessionOpts {
  userId: string | null;
  userName?: string | null;
  targetPaceSecPerKm?: number | null;
  autoStart?: boolean;
}

function newSessionId() {
  return `run_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Top-level composition hook. Wires geolocation, metrics, coach, safety,
 * and the AI route engine into a single state machine. The UI subscribes
 * to this once; everything below is plumbing.
 */
export function useRunSession(opts: UseRunSessionOpts) {
  const { userId, userName = null, targetPaceSecPerKm = null, autoStart = false } = opts;

  const geo = useGeolocation({ mode: 'balanced', enabled: true });
  const battery = useBatteryStatus();

  const [session, setSession] = useState<RunSession>(() => ({
    id: newSessionId(),
    userId,
    startedAt: Date.now(),
    endedAt: null,
    status: autoStart ? 'running' : 'idle',
    samples: [],
    metrics: {
      distanceMeters: 0, durationSeconds: 0, pace: null, currentSpeed: null,
      avgSpeed: null, elevationGain: 0, caloriesEstimate: 0,
    },
    routeId: null,
    commands: [],
    coachMessages: [],
  }));

  const [route, setRoute] = useState<DynamicRoute | null>(null);
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const lastMsgAtRef = useRef<number>(0);
  const lastSampleAtRef = useRef<number>(Date.now());

  // Append GPS samples while running
  useEffect(() => {
    if (session.status !== 'running' || !geo.current) return;
    const sample = geo.current;
    const sessionLatest = session.samples[session.samples.length - 1];
    if (sessionLatest && sessionLatest.timestamp === sample.timestamp) return;
    if (sample.accuracy > 40) return; // drop noisy while running

    lastSampleAtRef.current = sample.timestamp;
    setSession(s => {
      const samples = [...s.samples, sample];
      return { ...s, samples, metrics: computeMetrics({ ...s, samples }) };
    });
  }, [geo.current, session.status]);

  // Duration ticker: refresh duration + pace every second even when no new sample arrived
  useEffect(() => {
    if (session.status !== 'running') return;
    const id = setInterval(() => {
      setSession(s => ({ ...s, metrics: computeMetrics(s) }));
    }, 1000);
    return () => clearInterval(id);
  }, [session.status]);

  // Coach evaluation
  useEffect(() => {
    if (session.status !== 'running') return;
    const msg = maybeGenerateCoachMessage({ session, targetPaceSecPerKm, lastMessageAt: lastMsgAtRef.current });
    if (msg) {
      lastMsgAtRef.current = Date.now();
      setSession(s => ({ ...s, coachMessages: [...s.coachMessages, msg] }));
    }
  }, [session.metrics.distanceMeters, session.metrics.pace, session.status, targetPaceSecPerKm, session]);

  // Safety evaluation (runs every 10s)
  useEffect(() => {
    const id = setInterval(() => {
      const fresh = evaluateSafety({
        battery,
        currentSample: geo.current,
        lastSampleAge: Date.now() - lastSampleAtRef.current,
        nightMode: isNight(),
      });
      setAlerts(fresh);
    }, 10_000);
    return () => clearInterval(id);
  }, [battery, geo.current]);

  // Persist session as it grows (throttled)
  useEffect(() => {
    if (session.status === 'idle') return;
    const id = setTimeout(() => { persistRunSession(session); }, 2000);
    return () => clearTimeout(id);
  }, [session]);

  const start = useCallback(() => {
    geo.reset();
    setSession(s => ({ ...s, status: 'running', startedAt: Date.now(), endedAt: null }));
  }, [geo]);

  const pause = useCallback(() => {
    setSession(s => ({ ...s, status: 'paused' }));
  }, []);

  const resume = useCallback(() => {
    setSession(s => ({ ...s, status: 'running' }));
  }, []);

  const finish = useCallback(() => {
    setSession(s => ({ ...s, status: 'finished', endedAt: Date.now(), metrics: computeMetrics(s) }));
    geo.stop();
  }, [geo]);

  const applyCommand = useCallback((cmd: AICommand) => {
    const metersCovered = session.metrics.distanceMeters;
    const origin = session.samples[0] ?? geo.current;
    const current = geo.current;
    if (!origin || !current) return cmd;

    if (cmd.intent === 'unknown') {
      setSession(s => ({ ...s, commands: [...s.commands, cmd] }));
      return cmd;
    }

    const next = recalculateRoute({
      currentPosition: { lat: current.lat, lng: current.lng },
      startPosition: { lat: origin.lat, lng: origin.lng },
      currentRoute: route,
      metersAlreadyCovered: metersCovered,
      constraints: cmd.constraints,
    });

    setRoute(next);
    const applied = { ...cmd, applied: true, appliedAt: Date.now() };
    setSession(s => ({ ...s, commands: [...s.commands, applied], routeId: next.id }));
    return applied;
  }, [geo.current, route, session.samples, session.metrics.distanceMeters]);

  const pushCoachMessage = useCallback((msg: CoachMessage) => {
    setSession(s => ({ ...s, coachMessages: [...s.coachMessages, msg] }));
  }, []);

  const telemetry = useMemo(() => ({
    paceLabel: formatPace(session.metrics.pace),
    distanceKm: (session.metrics.distanceMeters / 1000).toFixed(2),
    routeDistanceKm: route ? (routeDistanceMeters(route) / 1000).toFixed(2) : null,
  }), [session.metrics, route]);

  return {
    session,
    route,
    alerts,
    geo,
    battery,
    telemetry,
    userName,
    start,
    pause,
    resume,
    finish,
    applyCommand,
    pushCoachMessage,
  };
}

export type RunSessionController = ReturnType<typeof useRunSession>;

/** Re-export GeoSample for consumers typing pipeline boundaries. */
export type { GeoSample };
