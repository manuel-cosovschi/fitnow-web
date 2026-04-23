import type { DynamicRoute, LatLng, RouteConstraints } from './types';
import { bearing, destinationPoint, haversine, polylineDistance } from './geo';

interface RecalcInput {
  currentPosition: LatLng;
  startPosition: LatLng;
  currentRoute: DynamicRoute | null;
  metersAlreadyCovered: number;
  constraints: RouteConstraints;
}

/**
 * Geometry-based recalculator. When a street routing service (OSRM/Mapbox) is
 * wired in, replace `synthesizePolyline` with the remote call. The public
 * surface (input/output) stays identical.
 */
export function recalculateRoute(input: RecalcInput): DynamicRoute {
  const { currentPosition, startPosition, currentRoute, metersAlreadyCovered, constraints } = input;

  const previousTarget = currentRoute?.targetDistanceMeters ?? 5_000;
  let targetDistance = previousTarget;

  if (constraints.deltaDistanceMeters) targetDistance += constraints.deltaDistanceMeters;
  if (constraints.returnToStart) {
    const remainingToStart = haversine(currentPosition, startPosition);
    targetDistance = Math.max(metersAlreadyCovered + remainingToStart, targetDistance);
  }
  if (constraints.targetDurationSeconds) {
    // assume 6 min/km baseline when a pace isn't known
    targetDistance = Math.round((constraints.targetDurationSeconds / 360) * 1000);
  }
  targetDistance = Math.max(500, targetDistance);

  const remaining = Math.max(500, targetDistance - metersAlreadyCovered);
  const polyline = synthesizePolyline({
    from: currentPosition,
    backTo: constraints.returnToStart ? startPosition : null,
    remainingMeters: remaining,
    addSprint: constraints.sprintMeters ?? null,
  });

  const safetyScore = scoreSafety(constraints);
  const difficulty: DynamicRoute['difficulty'] = constraints.preferHills ? 'hard' : constraints.avoidHills ? 'easy' : 'moderate';
  const elevationProfile = synthesizeElevation(polyline.length, difficulty);

  return {
    id: `route_${Date.now()}`,
    polyline,
    targetDistanceMeters: targetDistance,
    targetDurationSeconds: constraints.targetDurationSeconds ?? null,
    difficulty,
    safetyScore,
    elevationProfile,
    createdAt: Date.now(),
  };
}

/**
 * Synthesizes a multi-waypoint loop using bearing offsets. Produces a route
 * that loops back to the current position (or start) after ~remainingMeters.
 */
function synthesizePolyline(opts: {
  from: LatLng;
  backTo: LatLng | null;
  remainingMeters: number;
  addSprint: number | null;
}): LatLng[] {
  const { from, backTo, remainingMeters, addSprint } = opts;

  // Split into legs: out, turn, back. Each leg ~ 1/3 of remaining distance.
  const leg = Math.max(300, Math.round(remainingMeters / 3));
  const baseBearing = backTo ? bearing(from, backTo) : Math.random() * 360;

  const p1 = destinationPoint(from, baseBearing + 45, leg);
  const p2 = destinationPoint(p1, baseBearing, leg);
  const p3 = backTo ?? destinationPoint(p2, baseBearing + 180 - 45, leg);

  const points: LatLng[] = [from, p1, p2, p3];

  if (addSprint) {
    const mid = points[Math.floor(points.length / 2)];
    const sprintEnd = destinationPoint(mid, baseBearing + 90, addSprint);
    points.splice(Math.floor(points.length / 2) + 1, 0, sprintEnd);
  }

  return points;
}

function synthesizeElevation(count: number, difficulty: DynamicRoute['difficulty']): number[] {
  const amplitude = difficulty === 'hard' ? 30 : difficulty === 'moderate' ? 12 : 3;
  return Array.from({ length: count }, (_, i) => Math.sin((i / count) * Math.PI * 2) * amplitude + amplitude);
}

function scoreSafety(c: RouteConstraints): number {
  let score = 70;
  if (c.maximizeSafety) score += 20;
  if (c.avoidTraffic) score += 8;
  if (c.preferShade) score += 2;
  return Math.min(100, score);
}

/**
 * Estimated time of arrival in seconds given a pace (sec/km).
 */
export function estimateETA(route: DynamicRoute, covered: number, paceSecPerKm: number | null): number | null {
  if (route.targetDistanceMeters == null) return null;
  if (!paceSecPerKm || paceSecPerKm <= 0) return null;
  const remainingKm = Math.max(0, (route.targetDistanceMeters - covered) / 1000);
  return Math.round(remainingKm * paceSecPerKm);
}

export function routeDistanceMeters(route: DynamicRoute): number {
  return polylineDistance(route.polyline);
}
