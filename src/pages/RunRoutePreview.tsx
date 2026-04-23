import { useNavigate } from 'react-router-dom';
import { Play, Share2, MapPin } from 'lucide-react';

export default function RunRoutePreview() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', animation: 'fadeUp 0.4s ease-out' }}>
      <header style={{ padding: 'calc(16px + env(safe-area-inset-top, 40px)) 24px 16px', zIndex: 10, position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(10,22,40,0.5)', backdropFilter: 'blur(10px)', color: 'var(--fn-white)', border: 'none', width: 40, height: 40, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          ←
        </button>
        <button style={{ background: 'rgba(10,22,40,0.5)', backdropFilter: 'blur(10px)', color: 'var(--fn-white)', border: 'none', width: 40, height: 40, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Share2 size={18} />
        </button>
      </header>

      {/* Fake Map with Route */}
      <div style={{ flex: 1, background: '#0A1628', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: '200%', height: '200%', top: '-50%', left: '-50%', backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.8 }} />
        
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <path d="M80,180 C120,100 250,220 320,120" fill="none" stroke="var(--fn-amber)" strokeWidth="6" strokeLinecap="round" />
        </svg>

        <div style={{ position: 'absolute', top: 170, left: 70, width: 24, height: 24, background: 'var(--fn-white)', borderRadius: '50%', border: '6px solid var(--fn-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
        <div style={{ position: 'absolute', top: 105, left: 308, width: 32, height: 32, background: 'var(--grad-primary)', borderRadius: '50%', border: '4px solid #0A1628', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-brand)' }}>
          <MapPin size={16} color="white" />
        </div>
      </div>

      <div style={{ background: 'var(--fn-surface)', padding: 24, borderRadius: '32px 32px 0 0', zIndex: 10, marginTop: -32, boxShadow: '0 -10px 40px rgba(0,0,0,0.5)' }}>
        <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 26, margin: '0 0 8px' }}>Ruta del Lago</h2>
        <p style={{ color: 'var(--fn-slate)', fontSize: 14, margin: '0 0 24px', display: 'flex', gap: 12 }}>
          <span>📍 Parque Sarmiento</span>
          <span>🏃‍♂️ Asfalto</span>
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 32 }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--fn-slate)', fontWeight: 600, textTransform: 'uppercase' }}>Distancia</span>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 20, fontWeight: 800 }}>8.5k</div>
          </div>
          <div style={{ textAlign: 'center', borderLeft: '1px solid var(--fn-border)', borderRight: '1px solid var(--fn-border)' }}>
            <span style={{ fontSize: 11, color: 'var(--fn-slate)', fontWeight: 600, textTransform: 'uppercase' }}>Desnivel</span>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 20, fontWeight: 800 }}>120m</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--fn-slate)', fontWeight: 600, textTransform: 'uppercase' }}>Est.</span>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 20, fontWeight: 800 }}>45m</div>
          </div>
        </div>

        <button onClick={() => navigate('/run-navigator')} style={{ width: '100%', padding: 18, borderRadius: 16, background: 'var(--fn-white)', color: 'var(--fn-bg)', fontWeight: 800, fontSize: 16, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
          <Play size={20} fill="var(--fn-bg)" /> Iniciar esta ruta
        </button>
      </div>
    </div>
  );
}
