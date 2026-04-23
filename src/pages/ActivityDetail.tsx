import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, CheckCircle2, Dumbbell, Zap, Trophy, Users, ShieldCheck } from 'lucide-react';

const KIND_CONFIG: Record<string, { color: string; grad: string; icon: JSX.Element }> = {
  gym:        { color: '#1E90FF', grad: 'var(--grad-primary)', icon: <Dumbbell size={32} color="white" /> },
  club:       { color: '#7B52F8', grad: 'var(--grad-purple)',  icon: <Trophy size={32} color="white" /> },
  trainer:    { color: '#FFB300', grad: 'var(--grad-amber)',   icon: <Zap size={32} color="white" /> },
  club_sport: { color: '#00E676', grad: 'var(--grad-success)', icon: <Users size={32} color="white" /> },
};
const DEFAULT_KIND = { color: '#1E90FF', grad: 'var(--grad-primary)', icon: <Dumbbell size={32} color="white" /> };

export default function ActivityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<any>(null);
  const [provider, setProvider] = useState<any>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    fetch(`https://fitnow-api-production.up.railway.app/api/activities/${id}`)
      .then(r => r.json())
      .then(d => { setActivity(d.activity || d); setProvider(d.provider || null); })
      .catch(console.error);
  }, [id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('https://fitnow-api-production.up.railway.app/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ activity_id: Number(id) }),
      });
      if (res.ok) setEnrolled(true);
      else alert('Error al inscribirse');
    } catch { alert('Error de red'); }
    finally { setEnrolling(false); }
  };

  if (!activity) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--fn-slate)' }}>
      Cargando...
    </div>
  );

  const kind = KIND_CONFIG[activity.kind] || DEFAULT_KIND;
  const seatsLeft = activity.seats_left ?? null;
  const capacity = activity.capacity ?? null;
  const seatsUsed = capacity != null && seatsLeft != null ? capacity - seatsLeft : null;
  const seatsPct = capacity && seatsUsed != null ? Math.min((seatsUsed / capacity) * 100, 100) : null;
  const seatsColor = seatsPct == null ? kind.color : seatsPct > 80 ? '#FFB300' : seatsPct > 50 ? '#00E676' : '#00E676';

  return (
    <div style={{ paddingBottom: 100, animation: 'fadeUp 0.4s ease-out' }}>
      {/* Hero — full bleed */}
      <div style={{ margin: '-20px -20px 0', height: 280, background: kind.grad, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -60, top: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', right: 20, bottom: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,22,40,0.75) 0%, transparent 55%)' }} />

        <button onClick={() => navigate(-1)} style={{
          position: 'absolute', top: 16, left: 16, width: 40, height: 40, borderRadius: 12,
          background: 'rgba(10,22,40,0.55)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ArrowLeft size={20} color="white" />
        </button>

        <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', color: 'white', textTransform: 'uppercase' }}>
            {activity.kind || 'Actividad'}
          </span>
          <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 26, margin: '8px 0 4px', color: 'white', lineHeight: 1.2 }}>
            {activity.title}
          </h1>
          {activity.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
              <MapPin size={13} /><span>{activity.location}</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Price + capacity card */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: seatsPct != null ? 16 : 0 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--fn-slate)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Inversión mensual</div>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 32, fontWeight: 800, color: 'var(--fn-blue)', lineHeight: 1 }}>
                ${Number(activity.price || 0).toLocaleString('es-AR')}
                <span style={{ fontSize: 14, color: 'var(--fn-slate)', fontWeight: 400 }}> /mes</span>
              </div>
            </div>
            {seatsLeft != null && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--fn-slate)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Cupos</div>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 20, fontWeight: 700, color: seatsColor }}>
                  {seatsLeft} <span style={{ fontSize: 12, color: 'var(--fn-slate)', fontWeight: 400 }}>libres</span>
                </div>
              </div>
            )}
          </div>
          {seatsPct != null && capacity && (
            <div>
              <div style={{ height: 6, borderRadius: 999, background: 'var(--fn-elevated)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${seatsPct}%`, background: seatsColor, borderRadius: 999, transition: 'width 0.6s ease' }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--fn-slate)', marginTop: 6 }}>
                {seatsUsed} de {capacity} lugares ocupados
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {activity.description && (
          <div className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, color: 'var(--fn-slate)', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 10px' }}>Descripción</h3>
            <p style={{ color: 'var(--fn-white)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{activity.description}</p>
          </div>
        )}

        {/* Provider card */}
        {provider && (
          <div className="glass-card" style={{ padding: 16, borderLeft: `3px solid ${kind.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `${kind.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: '"DM Serif Display", serif', fontSize: 18, color: kind.color }}>
                  {(provider.name || 'P').charAt(0).toUpperCase()}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>{provider.name}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, color: '#00E676', background: 'rgba(0,230,118,0.12)', padding: '2px 8px', borderRadius: 999 }}>
                    <ShieldCheck size={11} /> Verificado
                  </span>
                </div>
                {provider.address && <div style={{ fontSize: 12, color: 'var(--fn-slate)', marginTop: 2 }}>{provider.address}</div>}
              </div>
            </div>
          </div>
        )}

        {/* Sessions */}
        {activity.sessions?.length > 0 && (
          <div>
            <h3 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 18, margin: '0 0 12px' }}>Próximas sesiones</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activity.sessions.slice(0, 5).map((s: any) => (
                <div key={s.id} className="glass-card" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>
                    {new Date(s.start_time).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                  <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13, color: kind.color }}>
                    {new Date(s.start_time).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 20px', paddingBottom: 'calc(16px + env(safe-area-inset-bottom))', background: 'rgba(10,22,40,0.92)', backdropFilter: 'blur(20px)', borderTop: '1px solid var(--fn-border)', zIndex: 50 }}>
        <button onClick={handleEnroll} disabled={enrolling || enrolled} style={{
          width: '100%', padding: 18, borderRadius: 16, fontWeight: 700, fontSize: 16,
          background: enrolled ? 'var(--grad-success)' : 'var(--grad-primary)', color: 'white',
          boxShadow: enrolled ? '0 8px 24px rgba(0,230,118,0.35)' : 'var(--shadow-brand)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10,
          opacity: enrolling ? 0.7 : 1, transition: 'all 0.2s',
        }}>
          {enrolling ? 'Procesando...' : enrolled ? <><CheckCircle2 size={20} /> Inscripto exitosamente</> : 'Inscribirme ahora'}
        </button>
      </div>
    </div>
  );
}
