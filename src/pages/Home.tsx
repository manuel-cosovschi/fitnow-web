import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, Dumbbell, Trophy, Users, Zap, ChevronRight } from 'lucide-react';

const API = 'https://fitnow-api-production.up.railway.app/api';

const QUICK_ACTIONS = [
  { label: 'Modo Run', sub: 'Rastrea tu ruta GPS', path: '/run', grad: 'var(--grad-primary)', shadow: 'var(--shadow-brand)', icon: <Navigation size={28} color="white" fill="white" /> },
  { label: 'Gym Tracker', sub: 'Registra tu rutina', path: '/gym', grad: 'var(--grad-purple)', shadow: '0 8px 24px rgba(123,82,248,0.35)', icon: <Dumbbell size={28} color="white" /> },
  { label: 'Clubes', sub: 'Deportes de equipo', path: '/club-sports', grad: 'var(--grad-success)', shadow: '0 8px 24px rgba(0,230,118,0.3)', icon: <Trophy size={28} color="white" /> },
  { label: 'Trainers', sub: 'Sesiones personales', path: '/trainers', grad: 'var(--grad-amber)', shadow: '0 8px 24px rgba(255,179,0,0.3)', icon: <Users size={28} color="white" /> },
];

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    fetch(`${API}/enrollments/mine`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setEnrollments((d.enrollments || d.items || []).slice(0, 3)))
      .catch(() => {});
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'Atleta';
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, animation: 'fadeUp 0.4s ease-out' }}>
      {/* Hero header */}
      <div style={{ margin: '-20px -20px 24px', padding: '28px 20px 24px', background: 'linear-gradient(180deg, rgba(30,144,255,0.22) 0%, transparent 100%)', position: 'relative' }}>
        <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(30,144,255,0.08)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: 13, color: 'var(--fn-slate)', fontWeight: 500, margin: '0 0 4px' }}>{greet},</p>
            <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 30, margin: '0 0 4px', lineHeight: 1.1 }}>{firstName}</h1>
            <p style={{ fontSize: 14, color: 'var(--fn-slate)', margin: 0 }}>¿Listo para entrenar hoy?</p>
          </div>
          <div style={{ width: 52, height: 52, borderRadius: 26, background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-brand)', position: 'relative', flexShrink: 0 }}>
            <span style={{ fontFamily: '"DM Serif Display", serif', fontSize: 22, color: 'white' }}>
              {(user?.name || 'A').charAt(0).toUpperCase()}
            </span>
            <div style={{ position: 'absolute', bottom: 2, right: 2, width: 10, height: 10, borderRadius: '50%', background: '#00E676', border: '2px solid var(--fn-bg)' }} />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
        {[
          { label: 'RACHA', value: '3', unit: 'días', color: 'var(--fn-amber)', bg: 'rgba(255,179,0,0.15)', icon: <Zap size={14} color="var(--fn-amber)" /> },
          { label: 'CLASES', value: String(enrollments.length), unit: 'activas', color: 'var(--fn-blue)', bg: 'rgba(30,144,255,0.15)', icon: <Trophy size={14} color="var(--fn-blue)" /> },
          { label: 'MINUTOS', value: '145', unit: 'esta sem.', color: 'var(--fn-green)', bg: 'rgba(0,230,118,0.15)', icon: <Navigation size={14} color="var(--fn-green)" /> },
        ].map(s => (
          <div key={s.label} className="glass-card" style={{ padding: '14px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {s.icon}
              </div>
              <span style={{ fontSize: 9, color: 'var(--fn-slate)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</span>
            </div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: 'var(--fn-slate)', marginTop: 2 }}>{s.unit}</div>
          </div>
        ))}
      </div>

      {/* Promo banner */}
      <div onClick={() => navigate('/offers')} className="glass-card" style={{ padding: 20, cursor: 'pointer', background: 'var(--grad-purple)', border: 'none', position: 'relative', overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ position: 'absolute', right: -20, top: -20, width: 100, height: 100, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', right: 30, bottom: -30, width: 80, height: 80, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 999, color: 'white', textTransform: 'uppercase', letterSpacing: 0.5 }}>Oferta especial</span>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '8px 0 4px', color: 'white' }}>Plan PRO 20% OFF</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: 0 }}>Solo por tiempo limitado</p>
          </div>
          <ChevronRight size={24} color="rgba(255,255,255,0.7)" />
        </div>
      </div>

      {/* Quick Actions */}
      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 22, margin: '0 0 16px' }}>Accesos Rápidos</h2>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}>
          {QUICK_ACTIONS.map(a => (
            <div key={a.label} onClick={() => navigate(a.path)} style={{
              flexShrink: 0, width: 140, height: 140, borderRadius: 22,
              background: a.grad, boxShadow: a.shadow,
              padding: 18, cursor: 'pointer', position: 'relative', overflow: 'hidden',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              transition: 'transform 0.15s',
            }}
              onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.96)')}
              onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {a.icon}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 2 }}>{a.label}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{a.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 22, margin: 0 }}>Próximamente</h2>
          <span onClick={() => navigate('/enrollments')} style={{ fontSize: 13, color: 'var(--fn-blue)', fontWeight: 600, cursor: 'pointer' }}>Ver todo</span>
        </div>
        {enrollments.length === 0 ? (
          <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
            <p style={{ color: 'var(--fn-slate)', fontSize: 14, margin: '0 0 12px' }}>No tenés clases próximas</p>
            <button onClick={() => navigate('/explore')} style={{ background: 'var(--grad-primary)', color: 'white', padding: '10px 20px', borderRadius: 12, fontWeight: 600, fontSize: 13, boxShadow: 'var(--shadow-brand)' }}>
              Explorar actividades
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {enrollments.map((e: any, i: number) => {
              const title = e.activity_title || e.activity?.title || 'Actividad';
              const prov = e.provider_name || e.activity?.provider_name || '';
              return (
                <div key={i} className="glass-card" style={{ padding: 16, display: 'flex', gap: 14, alignItems: 'center', borderLeft: '3px solid var(--fn-green)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(0,230,118,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Trophy size={20} color="var(--fn-green)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{title}</div>
                    {prov && <div style={{ fontSize: 12, color: 'var(--fn-slate)' }}>{prov}</div>}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#00E676', background: 'rgba(0,230,118,0.12)', padding: '4px 10px', borderRadius: 999, whiteSpace: 'nowrap' }}>Activo</span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
