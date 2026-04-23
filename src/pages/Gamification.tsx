import { useNavigate } from 'react-router-dom';
import { Trophy, Flame, Star, Medal } from 'lucide-react';

export default function Gamification() {
  const navigate = useNavigate();

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '20px', animation: 'fadeUp 0.4s ease-out' }}>
      <header>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', color: 'var(--fn-white)', padding: '0 0 16px 0', fontSize: 14 }}>
          ← Volver
        </button>
        <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 28, margin: '0 0 8px 0' }}>Tus Logros</h1>
        <p style={{ color: 'var(--fn-slate)', fontSize: 14, margin: 0 }}>Compite, gana puntos y sube de nivel.</p>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <div style={{ position: 'relative', width: 140, height: 140 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '4px solid rgba(255,179,0,0.2)' }} />
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '4px solid var(--fn-amber)', clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 100%)', transform: 'rotate(45deg)' }} />
          <div style={{ position: 'absolute', inset: 8, background: 'var(--fn-elevated)', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-card)' }}>
            <span style={{ fontSize: 12, color: 'var(--fn-slate)', fontWeight: 600, textTransform: 'uppercase' }}>Nivel</span>
            <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 40, fontWeight: 800, color: 'var(--fn-amber)', lineHeight: 1.1 }}>5</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Star size={18} color="var(--fn-amber)" />
            <span style={{ fontSize: 12, color: 'var(--fn-slate)', fontWeight: 600, textTransform: 'uppercase' }}>Puntos</span>
          </div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 24, fontWeight: 800 }}>
            1,250
          </div>
        </div>
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Flame size={18} color="var(--fn-amber)" fill="var(--fn-amber)" />
            <span style={{ fontSize: 12, color: 'var(--fn-slate)', fontWeight: 600, textTransform: 'uppercase' }}>Racha Actual</span>
          </div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 24, fontWeight: 800 }}>
            3 días
          </div>
        </div>
      </div>

      <section>
        <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 20, marginBottom: 16 }}>Insignias</h2>
        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card" style={{ padding: 16, minWidth: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 24, background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trophy size={24} color="white" />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, textAlign: 'center' }}>Primeros 10k</span>
            </div>
          ))}
          <div className="glass-card" style={{ padding: 16, minWidth: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: 0.5 }}>
            <div style={{ width: 48, height: 48, borderRadius: 24, background: 'var(--fn-elevated)', border: '1px dashed var(--fn-slate)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Medal size={24} color="var(--fn-slate)" />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, textAlign: 'center' }}>Maratón</span>
          </div>
        </div>
      </section>
    </div>
  );
}
