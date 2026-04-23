import { useEffect, useState } from 'react';

export interface BatteryStatus {
  level: number | null;     // 0-1
  charging: boolean | null;
  supported: boolean;
}

interface BatteryManager extends EventTarget {
  level: number;
  charging: boolean;
}

/**
 * Web Battery API wrapper. Returns `supported: false` in browsers that don't expose it
 * (iOS Safari notoriously doesn't). The running UI must degrade gracefully.
 */
export function useBatteryStatus() {
  const [status, setStatus] = useState<BatteryStatus>({ level: null, charging: null, supported: true });

  useEffect(() => {
    const nav = navigator as Navigator & { getBattery?: () => Promise<BatteryManager> };
    if (!nav.getBattery) {
      setStatus({ level: null, charging: null, supported: false });
      return;
    }

    let detach: (() => void) | null = null;
    nav.getBattery().then(bat => {
      const update = () => setStatus({ level: bat.level, charging: bat.charging, supported: true });
      update();
      bat.addEventListener('levelchange', update);
      bat.addEventListener('chargingchange', update);
      detach = () => {
        bat.removeEventListener('levelchange', update);
        bat.removeEventListener('chargingchange', update);
      };
    }).catch(() => setStatus({ level: null, charging: null, supported: false }));

    return () => { detach?.(); };
  }, []);

  return status;
}
