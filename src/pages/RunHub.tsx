import { useNavigate } from 'react-router-dom';
import { Play, Map, History } from 'lucide-react';

export default function RunHub() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeUp 0.4s ease-out' }}>
      <header>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', color: 'var(--fn-white)', padding: '0 0 16px 0', fontSize: 14 }}>
          ← Volver
        </button>
        <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 28, margin: '0 0 8px 0' }}>Modo Run</h1>
        <p style={{ color: 'var(--fn-slate)', fontSize: 14, margin: 0 }}>Rastrea, planea y conquista nuevas rutas.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
        <div className="glass-card" style={{ padding: 24, textAlign: 'center', cursor: 'pointer', border: '1px solid var(--fn-blue)' }}>
          <div style={{ width: 64, height: 64, margin: '0 auto 16px', borderRadius: 32, background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-brand)' }}>
            <Play size={32} color="white" fill="white" />
          </div>
          <h3 style={{ fontSize: 18, margin: '0 0 4px', fontWeight: 700 }}>Iniciar Carrera Libre</h3>
          <p style={{ fontSize: 13, color: 'var(--fn-slate)', margin: 0 }}>GPS y tracking en tiempo real</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="glass-card" style={{ padding: 20, cursor: 'pointer' }}>
          <Map size={24} color="var(--fn-blue)" style={{ marginBottom: 12 }} />
          <h4 style={{ fontSize: 15, margin: '0 0 4px', fontWeight: 600 }}>Rutas</h4>
          <p style={{ fontSize: 12, color: 'var(--fn-slate)', margin: 0 }}>Descubrir</p>
        </div>
        <div className="glass-card" style={{ padding: 20, cursor: 'pointer' }}>
          <History size={24} color="var(--fn-blue)" style={{ marginBottom: 12 }} />
          <h4 style={{ fontSize: 15, margin: '0 0 4px', fontWeight: 600 }}>Historial</h4>
          <p style={{ fontSize: 12, color: 'var(--fn-slate)', margin: 0 }}>Tus marcas</p>
        </div>
      </div>
    </div>
  );
}
