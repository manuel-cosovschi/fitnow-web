import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play, Pause, Square, Navigation, Mic, MicOff, Send,
  Battery, AlertTriangle, CheckCircle2, Sparkles, MapPin, Flag,
} from 'lucide-react';
import {
  buildCommand, INTENT_LABELS, speak, useRunSession, useVoiceCommand,
  formatDuration, shareEmergency, estimateETA,
} from '../features/running';
import type { AICommand, LatLng } from '../features/running';

/**
 * Premium live tracker. Wires the running feature module end-to-end:
 * Geolocation → metrics → coach → safety → route engine → voice/text commands.
 */
export default function RunNavigator() {
  const navigate = useNavigate();
  const userRaw = typeof localStorage !== 'undefined' ? localStorage.getItem('user') : null;
  const userObj = userRaw ? JSON.parse(userRaw) : null;

  const controller = useRunSession({
    userId: userObj?.id ?? null,
    userName: userObj?.name ?? null,
    targetPaceSecPerKm: null,
  });

  const { session, route, alerts, geo, battery, telemetry, start, pause, resume, finish, applyCommand } = controller;
  const [textInput, setTextInput] = useState('');
  const [lastCommand, setLastCommand] = useState<AICommand | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const onVoiceFinal = useCallback(async (text: string) => {
    const cmd = await buildCommand(text, 'voice');
    const applied = applyCommand(cmd);
    setLastCommand(applied);
    setToast(`${INTENT_LABELS[applied.intent]}${applied.intent === 'unknown' ? '' : ' ✓'}`);
    if (applied.intent !== 'unknown') speak('Listo, ajusté la ruta.');
  }, [applyCommand]);

  const voice = useVoiceCommand(onVoiceFinal);

  const submitText = useCallback(async () => {
    const text = textInput.trim();
    if (!text) return;
    const cmd = await buildCommand(text, 'text');
    const applied = applyCommand(cmd);
    setLastCommand(applied);
    setToast(`${INTENT_LABELS[applied.intent]}${applied.intent === 'unknown' ? '' : ' ✓'}`);
    setTextInput('');
  }, [textInput, applyCommand]);

  const applyQuick = useCallback(async (text: string) => {
    const cmd = await buildCommand(text, 'button');
    const applied = applyCommand(cmd);
    setLastCommand(applied);
    setToast(`${INTENT_LABELS[applied.intent]} ✓`);
  }, [applyCommand]);

  // Dismiss toast after 3s
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  // Speak the latest coach message once
  useEffect(() => {
    const latest = session.coachMessages[session.coachMessages.length - 1];
    if (!latest || latest.spoken) return;
    latest.spoken = true;
    speak(latest.text);
  }, [session.coachMessages.length]);

  const handleEmergency = useCallback(async () => {
    if (!geo.current) { alert('Sin ubicación disponible'); return; }
    const url = await shareEmergency({
      location: { lat: geo.current.lat, lng: geo.current.lng },
      timestamp: Date.now(),
      sessionId: session.id,
      userName: userObj?.name ?? null,
    });
    const navShare = (navigator as Navigator & { share?: (d: { title: string; text: string; url: string }) => Promise<void> }).share;
    if (navShare) {
      await navShare({ title: 'Mi ubicación — FitNow', text: 'Necesito ayuda. Estoy corriendo acá:', url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
      setToast('Link copiado al portapapeles');
    }
  }, [geo.current, session.id, userObj]);

  const handleFinish = useCallback(() => {
    finish();
    setTimeout(() => navigate('/run'), 600);
  }, [finish, navigate]);

  const eta = useMemo(() => {
    if (!route) return null;
    const secs = estimateETA(route, session.metrics.distanceMeters, session.metrics.pace);
    return secs != null ? formatDuration(secs) : null;
  }, [route, session.metrics.distanceMeters, session.metrics.pace]);

  const latestCoach = session.coachMessages[session.coachMessages.length - 1];
  const criticalAlert = alerts.find(a => a.severity === 'critical' || a.severity === 'warning');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--fn-bg)', animation: 'fadeUp 0.4s ease-out', position: 'relative' }}>
      {/* Header */}
      <header style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        padding: 'calc(14px + env(safe-area-inset-top, 16px)) 20px 14px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'linear-gradient(180deg, rgba(10,22,40,0.9) 0%, transparent 100%)',
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(10,22,40,0.6)', backdropFilter: 'blur(12px)', padding: '8px 14px', borderRadius: 999, color: 'var(--fn-white)', fontSize: 13, fontWeight: 600, border: '1px solid var(--fn-border)' }}>
          ← Salir
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <GpsBadge accuracy={geo.current?.accuracy ?? null} watching={geo.isWatching} />
          {battery.supported && battery.level != null && <BatteryBadge level={battery.level} charging={!!battery.charging} />}
        </div>
      </header>

      {/* Live map canvas (SVG-based — replace with Mapbox GL when key is wired) */}
      <LiveMap
        current={geo.current ? { lat: geo.current.lat, lng: geo.current.lng } : null}
        track={session.samples.map(s => ({ lat: s.lat, lng: s.lng }))}
        route={route?.polyline ?? null}
        running={session.status === 'running'}
      />

      {/* Coach toast / Alert banner */}
      {toast && (
        <div style={{
          position: 'absolute', top: 'calc(72px + env(safe-area-inset-top, 16px))', left: 20, right: 20, zIndex: 25,
          padding: 12, borderRadius: 14, background: 'rgba(30,144,255,0.92)', color: 'white',
          fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 8px 24px rgba(30,144,255,0.35)', animation: 'fadeUp 0.3s ease-out',
        }}>
          <Sparkles size={16} /> {toast}
        </div>
      )}

      {latestCoach && !toast && (
        <div style={{
          position: 'absolute', top: 'calc(72px + env(safe-area-inset-top, 16px))', left: 20, right: 20, zIndex: 24,
          padding: 12, borderRadius: 14,
          background: latestCoach.severity === 'warning' ? 'rgba(255,179,0,0.92)' : latestCoach.severity === 'positive' ? 'rgba(0,230,118,0.92)' : 'rgba(17,34,64,0.9)',
          backdropFilter: 'blur(12px)', color: 'white', fontSize: 14, fontWeight: 600,
          border: '1px solid rgba(255,255,255,0.12)',
        }}>
          {latestCoach.text}
        </div>
      )}

      {criticalAlert && (
        <div style={{
          position: 'absolute', top: 'calc(120px + env(safe-area-inset-top, 16px))', left: 20, right: 20, zIndex: 23,
          padding: 10, borderRadius: 12, background: 'rgba(255,48,85,0.12)', border: '1px solid rgba(255,48,85,0.4)',
          color: '#FF3055', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <AlertTriangle size={14} /> {criticalAlert.message}
        </div>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Stats + controls bottom sheet */}
      <div style={{
        position: 'relative', zIndex: 15,
        background: 'rgba(10,22,40,0.92)', backdropFilter: 'blur(24px)',
        padding: '20px 20px 24px',
        paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
        borderRadius: '28px 28px 0 0',
        borderTop: '1px solid var(--fn-border)',
      }}>
        {/* Primary metric */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'var(--fn-slate)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>Tiempo</div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 52, fontWeight: 800, color: 'var(--fn-white)', lineHeight: 1 }}>
            {formatDuration(session.metrics.durationSeconds)}
          </div>
        </div>

        {/* Secondary grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
          <Stat label="Distancia" value={telemetry.distanceKm} unit="km" />
          <Stat label="Ritmo"     value={telemetry.paceLabel.split(' ')[0]} unit="/km" />
          <Stat label="ETA"       value={eta ?? '—'} unit="" />
        </div>

        {/* Route summary (when AI route active) */}
        {route && (
          <div style={{ padding: '10px 14px', borderRadius: 12, background: 'var(--fn-elevated)', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Flag size={14} color="var(--fn-blue)" />
              <span style={{ fontSize: 12, color: 'var(--fn-slate)' }}>Ruta IA</span>
              <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13, fontWeight: 700, color: 'var(--fn-white)' }}>
                {telemetry.routeDistanceKm} km
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: route.difficulty === 'hard' ? 'rgba(255,48,85,0.18)' : route.difficulty === 'easy' ? 'rgba(0,230,118,0.18)' : 'rgba(255,179,0,0.18)', color: route.difficulty === 'hard' ? '#FF3055' : route.difficulty === 'easy' ? '#00E676' : '#FFB300', textTransform: 'uppercase' }}>
                {route.difficulty}
              </span>
              <span style={{ fontSize: 11, color: 'var(--fn-slate)' }}>· {route.safetyScore}% safe</span>
            </div>
          </div>
        )}

        {/* AI command input */}
        {session.status !== 'finished' && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', background: 'var(--fn-elevated)', borderRadius: 14, padding: '2px 2px 2px 14px', border: voice.listening ? '1px solid var(--fn-blue)' : '1px solid var(--fn-border)' }}>
                <input
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') submitText(); }}
                  placeholder={voice.listening ? '🎙 Escuchando...' : 'Decile al coach: "2 km más", "volver"...'}
                  style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--fn-white)', fontSize: 14, padding: '10px 0', outline: 'none' }}
                />
                <button onClick={submitText} disabled={!textInput.trim()} style={{ width: 36, height: 36, borderRadius: 10, background: textInput.trim() ? 'var(--grad-primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: textInput.trim() ? 1 : 0.4 }}>
                  <Send size={16} color={textInput.trim() ? 'white' : 'var(--fn-slate)'} />
                </button>
              </div>
              {voice.supported && (
                <button
                  onClick={() => voice.listening ? voice.stop() : voice.start()}
                  style={{
                    width: 44, height: 44, borderRadius: 14,
                    background: voice.listening ? 'var(--grad-crimson)' : 'var(--fn-elevated)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid var(--fn-border)',
                    animation: voice.listening ? 'pulseDot 1.2s ease-in-out infinite' : 'none',
                  }}
                >
                  {voice.listening ? <MicOff size={18} color="white" /> : <Mic size={18} color="var(--fn-white)" />}
                </button>
              )}
            </div>

            {/* Quick chips */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' } as React.CSSProperties}>
              {['+2 km', 'Acortar 500m', 'Evitá subidas', 'Más difícil', 'Volver a casa', 'Terminar en 30 min'].map(chip => (
                <button key={chip} onClick={() => applyQuick(chip)} style={{
                  flexShrink: 0, padding: '7px 12px', borderRadius: 999,
                  background: 'var(--fn-elevated)', border: '1px solid var(--fn-border)',
                  color: 'var(--fn-white)', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                }}>
                  {chip}
                </button>
              ))}
            </div>

            {lastCommand && (
              <div style={{ marginTop: 8, fontSize: 11, color: 'var(--fn-slate)' }}>
                Último comando: <span style={{ color: 'var(--fn-white)' }}>"{lastCommand.rawText}"</span> → {INTENT_LABELS[lastCommand.intent]}
                {lastCommand.applied && <CheckCircle2 size={11} color="#00E676" style={{ marginLeft: 4, verticalAlign: 'middle' }} />}
              </div>
            )}
          </div>
        )}

        {/* Primary controls */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
          {session.status === 'idle' && (
            <button onClick={start} style={{ width: 78, height: 78, borderRadius: 39, background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-brand)' }}>
              <Play size={36} color="white" fill="white" style={{ marginLeft: 4 }} />
            </button>
          )}
          {session.status === 'running' && (
            <>
              <button onClick={handleEmergency} style={{ width: 52, height: 52, borderRadius: 26, background: 'rgba(255,48,85,0.15)', border: '1px solid var(--fn-crimson)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={22} color="var(--fn-crimson)" />
              </button>
              <button onClick={pause} style={{ width: 68, height: 68, borderRadius: 34, background: 'rgba(255,179,0,0.2)', border: '1px solid var(--fn-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Pause size={28} color="var(--fn-amber)" fill="var(--fn-amber)" />
              </button>
              <button onClick={handleFinish} style={{ width: 52, height: 52, borderRadius: 26, background: 'rgba(255,48,85,0.2)', border: '1px solid var(--fn-crimson)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Square size={20} color="var(--fn-crimson)" fill="var(--fn-crimson)" />
              </button>
            </>
          )}
          {session.status === 'paused' && (
            <>
              <button onClick={handleFinish} style={{ width: 60, height: 60, borderRadius: 30, background: 'rgba(255,48,85,0.2)', border: '1px solid var(--fn-crimson)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Square size={22} color="var(--fn-crimson)" fill="var(--fn-crimson)" />
              </button>
              <button onClick={resume} style={{ width: 78, height: 78, borderRadius: 39, background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-brand)' }}>
                <Play size={32} color="white" fill="white" style={{ marginLeft: 4 }} />
              </button>
            </>
          )}
          {session.status === 'finished' && (
            <button onClick={() => navigate('/run')} style={{ padding: '16px 28px', borderRadius: 16, background: 'var(--grad-success)', color: 'white', fontWeight: 700, fontSize: 15 }}>
              Volver
            </button>
          )}
        </div>

        {geo.error && (
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--fn-crimson)', textAlign: 'center' }}>
            {geo.error}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulseDot {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,48,85,0.5); }
          50%      { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(255,48,85,0); }
        }
      `}</style>
    </div>
  );
}

// --- Subcomponents ---

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '8px 4px', background: 'var(--fn-elevated)', borderRadius: 12 }}>
      <div style={{ fontSize: 10, color: 'var(--fn-slate)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 17, fontWeight: 800, color: 'var(--fn-white)', lineHeight: 1 }}>
        {value}<span style={{ fontSize: 11, color: 'var(--fn-slate)', fontWeight: 500 }}> {unit}</span>
      </div>
    </div>
  );
}

function GpsBadge({ accuracy, watching }: { accuracy: number | null; watching: boolean }) {
  const color = !watching ? '#8899AA' : accuracy == null ? '#FFB300' : accuracy < 15 ? '#00E676' : accuracy < 40 ? '#FFB300' : '#FF3055';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', background: 'rgba(10,22,40,0.6)', backdropFilter: 'blur(12px)', borderRadius: 999, border: '1px solid var(--fn-border)' }}>
      <MapPin size={11} color={color} />
      <span style={{ fontSize: 11, fontWeight: 700, color }}>{watching ? (accuracy != null ? `${Math.round(accuracy)}m` : '...') : 'OFF'}</span>
    </div>
  );
}

function BatteryBadge({ level, charging }: { level: number; charging: boolean }) {
  const pct = Math.round(level * 100);
  const color = charging ? '#00E676' : pct < 20 ? '#FF3055' : pct < 40 ? '#FFB300' : '#E8F0FE';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', background: 'rgba(10,22,40,0.6)', backdropFilter: 'blur(12px)', borderRadius: 999, border: '1px solid var(--fn-border)' }}>
      <Battery size={11} color={color} />
      <span style={{ fontSize: 11, fontWeight: 700, color }}>{pct}%</span>
    </div>
  );
}

interface LiveMapProps {
  current: LatLng | null;
  track: LatLng[];
  route: LatLng[] | null;
  running: boolean;
}

function LiveMap({ current, track, route, running }: LiveMapProps) {
  const allPoints: LatLng[] = [...track, ...(route ?? []), ...(current ? [current] : [])];

  const viewport = useMemo(() => {
    if (allPoints.length === 0) return null;
    const lats = allPoints.map(p => p.lat);
    const lngs = allPoints.map(p => p.lng);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    const padLat = Math.max((maxLat - minLat) * 0.2, 0.0005);
    const padLng = Math.max((maxLng - minLng) * 0.2, 0.0005);
    return { minLat: minLat - padLat, maxLat: maxLat + padLat, minLng: minLng - padLng, maxLng: maxLng + padLng };
  }, [allPoints]);

  const toSvg = useCallback((p: LatLng): [number, number] => {
    if (!viewport) return [50, 50];
    const x = ((p.lng - viewport.minLng) / (viewport.maxLng - viewport.minLng)) * 100;
    const y = 100 - ((p.lat - viewport.minLat) / (viewport.maxLat - viewport.minLat)) * 100;
    return [x, y];
  }, [viewport]);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 1, overflow: 'hidden' }}>
      {/* Gridded canvas */}
      <div style={{ position: 'absolute', inset: 0, background: '#0A1628', backgroundImage: 'radial-gradient(circle, rgba(30,144,255,0.08) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {viewport && (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          {/* Planned route (dashed) */}
          {route && route.length > 1 && (
            <polyline
              points={route.map(p => toSvg(p).join(',')).join(' ')}
              fill="none"
              stroke="#7B52F8"
              strokeWidth="0.5"
              strokeDasharray="1.5,1"
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity="0.8"
            />
          )}
          {/* Traveled track (solid gradient) */}
          {track.length > 1 && (
            <polyline
              points={track.map(p => toSvg(p).join(',')).join(' ')}
              fill="none"
              stroke="#1E90FF"
              strokeWidth="0.8"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}
          {/* Current pulse */}
          {current && (() => {
            const [cx, cy] = toSvg(current);
            return (
              <g>
                <circle cx={cx} cy={cy} r="2" fill="#1E90FF" opacity="0.25">
                  {running && <animate attributeName="r" values="1;3;1" dur="2s" repeatCount="indefinite" />}
                </circle>
                <circle cx={cx} cy={cy} r="1" fill="#1E90FF" />
              </g>
            );
          })()}
          {/* Start marker */}
          {track.length > 0 && (() => {
            const [sx, sy] = toSvg(track[0]);
            return <circle cx={sx} cy={sy} r="0.8" fill="#00E676" stroke="white" strokeWidth="0.3" />;
          })()}
        </svg>
      )}

      {/* Empty state centered marker */}
      {!viewport && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'var(--fn-slate)', textAlign: 'center', fontSize: 13 }}>
          <Navigation size={36} color="var(--fn-slate)" style={{ marginBottom: 8, opacity: 0.5 }} />
          <div>Esperando señal GPS...</div>
        </div>
      )}
    </div>
  );
}
