import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';

export default function Explore() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetch('https://fitnow-api-production.up.railway.app/api/activities')
      .then(res => res.json())
      .then(data => setActivities(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = activities.filter(a => 
    a.title.toLowerCase().includes(filter.toLowerCase()) || 
    (a.location && a.location.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <header>
        <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 28, margin: '0 0 16px 0' }}>Explorar</h1>
        
        <div style={{ position: 'relative' }}>
          <Search size={18} color="var(--fn-slate)" style={{ position: 'absolute', left: 16, top: 16 }} />
          <input 
            placeholder="Buscar gimnasios, clases, trainers..." 
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ paddingLeft: 46, borderRadius: 24, background: 'var(--fn-surface)' }} 
          />
        </div>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--fn-slate)' }}>Cargando actividades...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(act => (
            <div 
              key={act.id} 
              onClick={() => navigate(`/explore/${act.id}`)}
              className="glass-card" 
              style={{ padding: 0, cursor: 'pointer', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ height: 120, background: 'var(--fn-elevated)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                  {act.kind === 'trainer' ? 'Personal Trainer' : act.kind === 'club' ? 'Club Deportivo' : 'Gimnasio'}
                </div>
              </div>
              <div style={{ padding: 16 }}>
                <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700 }}>{act.title}</h3>
                {act.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--fn-slate)', fontSize: 13, marginBottom: 12 }}>
                    <MapPin size={14} />
                    <span>{act.location}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 18, fontWeight: 800 }}>
                    ${Number(act.price).toFixed(0)} <span style={{ fontSize: 11, color: 'var(--fn-slate)' }}>/ mes</span>
                  </div>
                  <div style={{ background: 'var(--fn-elevated)', padding: '6px 12px', borderRadius: 12, fontSize: 12, fontWeight: 600, color: 'var(--fn-blue)' }}>
                    Ver más
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
