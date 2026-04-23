import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Dumbbell, Zap, Trophy, Users } from 'lucide-react';

const KIND_CONFIG: Record<string, { label: string; color: string; grad: string; icon: JSX.Element }> = {
  gym:        { label: 'Gimnasio', color: '#1E90FF', grad: 'var(--grad-primary)', icon: <Dumbbell size={22} color="white" /> },
  club:       { label: 'Club',     color: '#7B52F8', grad: 'var(--grad-purple)',  icon: <Trophy size={22} color="white" /> },
  trainer:    { label: 'Trainer',  color: '#FFB300', grad: 'var(--grad-amber)',   icon: <Zap size={22} color="white" /> },
  club_sport: { label: 'Deporte',  color: '#00E676', grad: 'var(--grad-success)', icon: <Users size={22} color="white" /> },
};
const DEFAULT_KIND = { label: 'Actividad', color: '#1E90FF', grad: 'var(--grad-primary)', icon: <Dumbbell size={22} color="white" /> };

const FILTERS = [
  { id: '', label: 'Todos' },
  { id: 'gym', label: 'Gimnasio' },
  { id: 'club', label: 'Club' },
  { id: 'trainer', label: 'Trainer' },
  { id: 'club_sport', label: 'Deportes' },
];

export default function Explore() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState('');

  useEffect(() => {
    fetch('https://fitnow-api-production.up.railway.app/api/activities')
      .then(r => r.json())
      .then(d => setActivities(d.items || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = activities.filter(a => {
    const matchSearch = !search ||
      a.title?.toLowerCase().includes(search.toLowerCase()) ||
      a.location?.toLowerCase().includes(search.toLowerCase());
    const matchKind = !kindFilter || a.kind === kindFilter;
    return matchSearch && matchKind;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeUp 0.4s ease-out' }}>
      <header>
        <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 28, margin: '0 0 16px 0' }}>Explorar</h1>
        <div style={{ position: 'relative' }}>
          <Search size={18} color="var(--fn-blue)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            placeholder="Buscar gimnasios, clases, trainers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 46, height: 52, borderRadius: 14 }}
          />
        </div>
      </header>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}>
        {FILTERS.map(f => {
          const active = kindFilter === f.id;
          return (
            <button key={f.id} onClick={() => setKindFilter(f.id)} style={{
              flexShrink: 0, padding: '8px 18px', borderRadius: 999, fontWeight: 600, fontSize: 13,
              background: active ? 'var(--grad-primary)' : 'var(--fn-surface)',
              color: active ? 'white' : 'var(--fn-slate)',
              border: `1px solid ${active ? 'transparent' : 'var(--fn-border)'}`,
              boxShadow: active ? 'var(--shadow-brand)' : 'none',
              transition: 'all 0.2s',
            }}>
              {f.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--fn-slate)' }}>Cargando actividades...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--fn-slate)' }}>Sin resultados</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(act => {
            const kind = KIND_CONFIG[act.kind] || DEFAULT_KIND;
            return (
              <div
                key={act.id}
                onClick={() => navigate(`/explore/${act.id}`)}
                className="glass-card"
                style={{ padding: 16, cursor: 'pointer', display: 'flex', gap: 14, alignItems: 'flex-start', borderLeft: `3px solid ${kind.color}`, transition: 'transform 0.15s' }}
                onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.985)')}
                onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <div style={{ width: 50, height: 50, borderRadius: 14, background: kind.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {kind.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>{act.title}</h3>
                    {act.price != null && (
                      <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 15, fontWeight: 800, color: 'var(--fn-blue)', flexShrink: 0 }}>
                        ${Number(act.price).toLocaleString('es-AR')}
                      </span>
                    )}
                  </div>
                  {act.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--fn-slate)', fontSize: 12, marginBottom: 8 }}>
                      <MapPin size={12} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{act.location}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: `${kind.color}22`, color: kind.color }}>{kind.label}</span>
                    {act.difficulty && <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 999, background: 'var(--fn-elevated)', color: 'var(--fn-slate)' }}>{act.difficulty}</span>}
                    {act.modality && <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 999, background: 'var(--fn-elevated)', color: 'var(--fn-slate)' }}>{act.modality}</span>}
                    {act.seats_left === 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: 'rgba(255,48,85,0.15)', color: 'var(--fn-crimson)' }}>Sin lugares</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
