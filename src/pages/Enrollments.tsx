import { useEffect, useState } from 'react';
import { BookOpen, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API = 'https://fitnow-api-production.up.railway.app/api';

const KIND_COLORS: Record<string, string> = {
  gym: '#1E90FF', club: '#7B52F8', trainer: '#FFB300', club_sport: '#00E676',
};

export default function Enrollments() {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    fetch(`${API}/enrollments/mine`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setEnrollments(d.enrollments || d.items || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = enrollments.filter(e => {
    const status = (e.status || 'active').toLowerCase();
    if (tab === 'upcoming') return status === 'active' || status === 'confirmed';
    if (tab === 'past') return status === 'cancelled' || status === 'completed' || status === 'past';
    return true;
  });

  const TABS = [
    { id: 'upcoming', label: 'Próximas' },
    { id: 'past',     label: 'Pasadas' },
    { id: 'all',      label: 'Todas' },
  ] as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeUp 0.4s ease-out' }}>
      <header>
        <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 28, margin: '0 0 4px' }}>Mis Clases</h1>
        <p style={{ color: 'var(--fn-slate)', fontSize: 14, margin: 0 }}>Las actividades en las que participás</p>
      </header>

      {/* Segmented picker */}
      <div className="glass-card" style={{ padding: 4, display: 'flex', gap: 4 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '10px 0', borderRadius: 12, fontWeight: 600, fontSize: 13,
            background: tab === t.id ? 'var(--grad-primary)' : 'transparent',
            color: tab === t.id ? 'white' : 'var(--fn-slate)',
            boxShadow: tab === t.id ? 'var(--shadow-brand)' : 'none',
            transition: 'all 0.2s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--fn-slate)' }}>Cargando...</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
          <BookOpen size={48} color="var(--fn-slate)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>Sin inscripciones</h3>
          <p style={{ color: 'var(--fn-slate)', fontSize: 14, margin: '0 0 16px' }}>Explorá y encontrá tu próxima clase.</p>
          <button onClick={() => navigate('/explore')} style={{ background: 'var(--grad-primary)', color: 'white', padding: '10px 20px', borderRadius: 12, fontWeight: 600, boxShadow: 'var(--shadow-brand)' }}>
            Explorar
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((enr: any, i: number) => {
            const title = enr.activity_title || enr.activity?.title || 'Actividad';
            const provider = enr.provider_name || enr.activity?.provider_name || '';
            const kind = enr.activity?.kind || enr.kind || 'gym';
            const color = KIND_COLORS[kind] || '#1E90FF';
            const status = (enr.status || 'active').toLowerCase();
            const isPast = status === 'cancelled' || status === 'completed' || status === 'past';
            const enrolledAt = enr.enrolled_at || enr.created_at;

            return (
              <div key={i} className="glass-card" style={{ padding: 16, display: 'flex', gap: 14, alignItems: 'flex-start', borderLeft: `3px solid ${color}` }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 14, fontWeight: 800, color }}>{title.charAt(0).toUpperCase()}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>{title}</h4>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, whiteSpace: 'nowrap',
                      background: isPast ? 'var(--fn-elevated)' : 'rgba(0,230,118,0.12)',
                      color: isPast ? 'var(--fn-slate)' : '#00E676',
                    }}>
                      {isPast ? 'Pasada' : 'Activa'}
                    </span>
                  </div>
                  {provider && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--fn-slate)', fontSize: 12, marginBottom: 6 }}>
                      <MapPin size={11} /><span>{provider}</span>
                    </div>
                  )}
                  {enrolledAt && (
                    <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color, fontWeight: 600 }}>
                      Desde {new Date(enrolledAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
