import type { EmergencyPayload, RunSession } from './types';

const API = 'https://fitnow-api-production.up.railway.app/api';
const STORAGE_KEY = 'fitnow_run_sessions_v1';

/**
 * Backend endpoints expected (to be implemented server-side):
 *   POST   /run/sessions         { session } → { id }
 *   PATCH  /run/sessions/:id     { session }
 *   GET    /run/sessions/mine    → { items: RunSession[] }
 *   POST   /run/emergency        { payload } → { shareUrl }
 *
 * Until those ship, every call degrades to localStorage so the feature works
 * offline and the UI contract is stable.
 */

function authHeader(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function loadLocal(): RunSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RunSession[]) : [];
  } catch {
    return [];
  }
}

function saveLocal(sessions: RunSession[]): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions)); } catch { /* storage full */ }
}

function upsertLocal(session: RunSession): void {
  const all = loadLocal();
  const idx = all.findIndex(s => s.id === session.id);
  if (idx >= 0) all[idx] = session; else all.unshift(session);
  saveLocal(all.slice(0, 200)); // cap history
}

export async function persistRunSession(session: RunSession): Promise<void> {
  upsertLocal(session);
  try {
    await fetch(`${API}/run/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ session }),
    });
  } catch {
    /* offline — local storage already has it */
  }
}

export async function listMyRunSessions(): Promise<RunSession[]> {
  try {
    const res = await fetch(`${API}/run/sessions/mine`, { headers: authHeader() });
    if (res.ok) {
      const data = await res.json();
      const items = (data.items || data.sessions || []) as RunSession[];
      if (items.length > 0) return items;
    }
  } catch { /* fall through */ }
  return loadLocal();
}

export async function shareEmergency(payload: EmergencyPayload): Promise<string> {
  // Best-effort: ping backend so operators can see it. Always also produce
  // a fallback share URL the user can copy/send via Web Share.
  try {
    const res = await fetch(`${API}/run/emergency`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ payload }),
    });
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.shareUrl) return data.shareUrl;
    }
  } catch { /* ignore */ }

  const { lat, lng } = payload.location;
  return `https://maps.google.com/?q=${lat},${lng}`;
}
