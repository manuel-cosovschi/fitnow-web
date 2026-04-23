import { useNavigate } from 'react-router-dom';
import { Target, Search } from 'lucide-react';

export default function ClubSports() {
  const navigate = useNavigate();

  const sports = [
    { name: 'Fútbol', color: 'var(--fn-blue)' },
    { name: 'Tenis', color: 'var(--fn-green)' },
    { name: 'Pádel', color: 'var(--fn-amber)' },
    { name: 'Natación', color: 'var(--fn-purple)' }
  ];

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '20px', animation: 'fadeUp 0.4s ease-out', paddingBottom: 40 }}>
      <header>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', color: 'var(--fn-white)', padding: '0 0 16px 0', fontSize: 14 }}>
          ← Volver
        </button>
        <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 28, margin: '0 0 8px 0' }}>Clubes y Deportes</h1>
        <p style={{ color: 'var(--fn-slate)', fontSize: 14, margin: 0 }}>Encuentra tu deporte favorito.</p>
      </header>

      <div style={{ position: 'relative' }}>
        <Search size={18} color="var(--fn-slate)" style={{ position: 'absolute', left: 16, top: 16 }} />
        <input 
          placeholder="Buscar un deporte..." 
          style={{ paddingLeft: 46, borderRadius: 24, background: 'var(--fn-surface)' }} 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {sports.map(sport => (
          <div key={sport.name} onClick={() => navigate('/explore')} className="glass-card" style={{ padding: 20, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 24, background: `color-mix(in srgb, ${sport.color} 20%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={24} color={sport.color} />
            </div>
            <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{sport.name}</h4>
          </div>
        ))}
      </div>
    </div>
  );
}
