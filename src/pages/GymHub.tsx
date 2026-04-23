import { useNavigate } from 'react-router-dom';
import { Activity, Dumbbell, Target } from 'lucide-react';

export default function GymHub() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeUp 0.4s ease-out' }}>
      <header>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', color: 'var(--fn-white)', padding: '0 0 16px 0', fontSize: 14 }}>
          ← Volver
        </button>
        <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 28, margin: '0 0 8px 0' }}>Gym Tracker</h1>
        <p style={{ color: 'var(--fn-slate)', fontSize: 14, margin: 0 }}>Gestión de fuerza y volumen total.</p>
      </header>

      <div onClick={() => navigate('/training-plan')} className="glass-card" style={{ padding: 24, textAlign: 'center', cursor: 'pointer', border: '1px solid var(--fn-purple)' }}>
        <div style={{ width: 64, height: 64, margin: '0 auto 16px', borderRadius: 32, background: 'var(--grad-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-purple)' }}>
          <Activity size={32} color="white" />
        </div>
        <h3 style={{ fontSize: 18, margin: '0 0 4px', fontWeight: 700 }}>Entrenamiento Libre</h3>
        <p style={{ fontSize: 13, color: 'var(--fn-slate)', margin: 0 }}>Registra cada serie y repetición</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="glass-card" style={{ padding: 20, cursor: 'pointer' }}>
          <Dumbbell size={24} color="var(--fn-purple)" style={{ marginBottom: 12 }} />
          <h4 style={{ fontSize: 15, margin: '0 0 4px', fontWeight: 600 }}>Ejercicios</h4>
          <p style={{ fontSize: 12, color: 'var(--fn-slate)', margin: 0 }}>Catálogo</p>
        </div>
        <div className="glass-card" style={{ padding: 20, cursor: 'pointer' }}>
          <Target size={24} color="var(--fn-purple)" style={{ marginBottom: 12 }} />
          <h4 style={{ fontSize: 15, margin: '0 0 4px', fontWeight: 600 }}>Rutinas</h4>
          <p style={{ fontSize: 12, color: 'var(--fn-slate)', margin: 0 }}>Tus planes</p>
        </div>
      </div>
    </div>
  );
}
