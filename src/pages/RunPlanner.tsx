import { useNavigate } from 'react-router-dom';
import { Flag, Save } from 'lucide-react';

export default function RunPlanner() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', animation: 'fadeUp 0.4s ease-out' }}>
      <header style={{ padding: '20px 24px 16px', zIndex: 10, position: 'absolute', top: 0, left: 0, right: 0 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', color: 'var(--fn-white)', fontSize: 14 }}>
          ← Volver
        </button>
      </header>

      {/* Fake Map Background */}
      <div style={{ flex: 1, background: '#0A1628', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: '200%', height: '200%', top: '-50%', left: '-50%', backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.5 }} />
        
        {/* Draw Line Fake */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <path d="M100,200 Q150,150 200,250 T300,200 T400,300" fill="none" stroke="var(--fn-blue)" strokeWidth="4" strokeLinecap="round" strokeDasharray="10 10" />
        </svg>

        {/* Start Point */}
        <div style={{ position: 'absolute', top: 190, left: 90, width: 20, height: 20, background: 'var(--fn-green)', borderRadius: '50%', border: '4px solid #0A1628' }} />
        
        {/* End Point Fake */}
        <div style={{ position: 'absolute', top: 290, left: 390, width: 24, height: 24, background: 'var(--fn-blue)', borderRadius: '50%', border: '4px solid #0A1628', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Flag size={12} color="white" />
        </div>
      </div>

      {/* Drawer */}
      <div style={{ background: 'var(--fn-surface)', padding: 24, borderRadius: '24px 24px 0 0', zIndex: 10, marginTop: -20, boxShadow: '0 -10px 40px rgba(0,0,0,0.5)' }}>
        <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 24, margin: '0 0 16px' }}>Planificar Ruta</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div>
            <span style={{ fontSize: 12, color: 'var(--fn-slate)', fontWeight: 600, textTransform: 'uppercase' }}>Distancia Est.</span>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 24, fontWeight: 800 }}>
              5.2 <span style={{ fontSize: 14, color: 'var(--fn-slate)' }}>km</span>
            </div>
          </div>
          <div>
            <span style={{ fontSize: 12, color: 'var(--fn-slate)', fontWeight: 600, textTransform: 'uppercase' }}>Elevación</span>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 24, fontWeight: 800 }}>
              +45 <span style={{ fontSize: 14, color: 'var(--fn-slate)' }}>m</span>
            </div>
          </div>
        </div>

        <button style={{ width: '100%', padding: 16, borderRadius: 16, background: 'var(--grad-primary)', color: 'white', fontWeight: 700, fontSize: 16, boxShadow: 'var(--shadow-brand)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
          <Save size={20} /> Guardar Ruta
        </button>
      </div>
    </div>
  );
}
