import type { BatteryStatus } from './useBatteryStatus';
import type { GeoSample, SafetyAlert } from './types';

interface SafetyInput {
  battery: BatteryStatus;
  currentSample: GeoSample | null;
  lastSampleAge: number; // ms since last accepted sample
  nightMode: boolean;
}

/**
 * Pure function. Inspects current device + tracking state and emits
 * a prioritized list of alerts. Upstream decides how to render them.
 */
export function evaluateSafety(input: SafetyInput): SafetyAlert[] {
  const alerts: SafetyAlert[] = [];
  const now = Date.now();

  if (input.battery.supported && input.battery.level != null && input.battery.level < 0.15 && !input.battery.charging) {
    alerts.push({
      id: `alert_${now}_battery`,
      kind: 'low_battery',
      message: 'Batería baja. Considerá volver por la ruta más corta.',
      severity: 'warning',
      timestamp: now,
    });
  }

  if (input.currentSample && input.currentSample.accuracy > 60) {
    alerts.push({
      id: `alert_${now}_gps`,
      kind: 'poor_gps',
      message: 'GPS con señal débil. Las mediciones pueden ser imprecisas.',
      severity: 'info',
      timestamp: now,
    });
  }

  if (input.lastSampleAge > 30_000) {
    alerts.push({
      id: `alert_${now}_inactive`,
      kind: 'inactive',
      message: 'No recibimos ubicación hace un rato. ¿Seguís en movimiento?',
      severity: 'warning',
      timestamp: now,
    });
  }

  if (input.nightMode) {
    alerts.push({
      id: `alert_${now}_night`,
      kind: 'night_mode',
      message: 'Modo noche activo. Preferimos rutas bien iluminadas.',
      severity: 'info',
      timestamp: now,
    });
  }

  return alerts;
}

export function isNight(date = new Date()): boolean {
  const h = date.getHours();
  return h < 6 || h >= 20;
}
