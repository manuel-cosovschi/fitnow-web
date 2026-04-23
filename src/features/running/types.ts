/**
 * Strict types for the running AI module.
 * Everything downstream (hooks, engines, store, API) depends on these.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

export interface GeoSample {
  lat: number;
  lng: number;
  accuracy: number;        // meters
  altitude: number | null; // meters
  speed: number | null;    // m/s (null when unavailable)
  heading: number | null;  // degrees 0-359
  timestamp: number;       // ms epoch
}

export type AccuracyMode = 'balanced' | 'high' | 'battery_saver';

export type RunStatus = 'idle' | 'running' | 'paused' | 'finished';

export interface RunMetrics {
  distanceMeters: number;  // total distance
  durationSeconds: number; // moving time
  pace: number | null;     // seconds per km (null at start)
  currentSpeed: number | null; // m/s
  avgSpeed: number | null;     // m/s
  elevationGain: number;       // meters
  caloriesEstimate: number;    // kcal (rough)
}

export interface RunSession {
  id: string;
  userId: string | null;
  startedAt: number;
  endedAt: number | null;
  status: RunStatus;
  samples: GeoSample[];
  metrics: RunMetrics;
  routeId: string | null;
  commands: AICommand[];
  coachMessages: CoachMessage[];
}

export interface DynamicRoute {
  id: string;
  polyline: LatLng[];
  targetDistanceMeters: number | null;
  targetDurationSeconds: number | null;
  difficulty: 'easy' | 'moderate' | 'hard';
  safetyScore: number; // 0-100
  elevationProfile: number[]; // meters per waypoint
  createdAt: number;
}

// --- AI Command System ---

export type CommandIntent =
  | 'extend_distance'     // "haceme 2 km más"
  | 'shorten_distance'    // "acortá 500m"
  | 'avoid_hills'         // "evitá subidas"
  | 'add_hills'           // "más difícil"
  | 'return_home'         // "volver a casa"
  | 'route_via'           // "pasá por la costanera"
  | 'add_sprint'          // "sprint de 500m"
  | 'prefer_shade'        // "más sombra"
  | 'avoid_traffic'       // "menos tránsito"
  | 'safer_route'         // "ruta más segura"
  | 'finish_by'           // "terminar en 30 min"
  | 'unknown';

export interface RouteConstraints {
  deltaDistanceMeters?: number;  // +2000 or -500
  targetDurationSeconds?: number;
  avoidHills?: boolean;
  preferHills?: boolean;
  preferShade?: boolean;
  avoidTraffic?: boolean;
  maximizeSafety?: boolean;
  returnToStart?: boolean;
  viaPlace?: string;
  sprintMeters?: number;
}

export interface AICommand {
  id: string;
  rawText: string;
  intent: CommandIntent;
  constraints: RouteConstraints;
  confidence: number; // 0-1
  applied: boolean;
  appliedAt: number | null;
  timestamp: number;
  source: 'voice' | 'text' | 'button';
}

export interface AICommandAdapter {
  /** Parses natural language into intent + constraints. */
  parse(text: string): Promise<{ intent: CommandIntent; constraints: RouteConstraints; confidence: number }>;
}

// --- Coach ---

export type CoachSeverity = 'info' | 'positive' | 'warning' | 'critical';

export interface CoachMessage {
  id: string;
  text: string;
  severity: CoachSeverity;
  timestamp: number;
  spoken: boolean;
}

// --- Safety ---

export interface SafetyAlert {
  id: string;
  kind: 'low_battery' | 'poor_gps' | 'weather' | 'night_mode' | 'offroute' | 'inactive';
  message: string;
  severity: CoachSeverity;
  timestamp: number;
}

// --- Emergency ---

export interface EmergencyPayload {
  location: LatLng;
  timestamp: number;
  sessionId: string;
  userName: string | null;
}
