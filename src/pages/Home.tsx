import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Flame, Navigation, Trophy } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeUp 0.4s ease-out' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 28, margin: '0 0 4px 0' }}>
            Hola, {user?.name?.split(' ')[0] || 'Atleta'}
          </h1>
          <p style={{ color: 'var(--fn-slate)', fontSize: 14, margin: 0 }}>¿Listo para entrenar hoy?</p>
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 22, background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Trophy size={20} color="white" />
        </div>
      </header>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 16, background: 'rgba(255,179,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flame size={16} color="var(--fn-amber)" />
            </div>
            <span style={{ fontSize: 12, color: 'var(--fn-slate)', fontWeight: 600, textTransform: 'uppercase' }}>Racha</span>
          </div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 24, fontWeight: 800 }}>
            3 <span style={{ fontSize: 14, color: 'var(--fn-slate)' }}>días</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 16, background: 'rgba(30,144,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={16} color="var(--fn-blue)" />
            </div>
            <span style={{ fontSize: 12, color: 'var(--fn-slate)', fontWeight: 600, textTransform: 'uppercase' }}>Minutos</span>
          </div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 24, fontWeight: 800 }}>
            145
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <section>
        <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 22, marginBottom: 16 }}>Accesos Rápidos</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div onClick={() => navigate('/run')} className="glass-card" style={{ padding: 20, textAlign: 'center', cursor: 'pointer', border: '1px solid var(--fn-blue)' }}>
            <div style={{ width: 48, height: 48, margin: '0 auto 12px', borderRadius: 24, background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-brand)' }}>
              <Navigation size={24} color="white" fill="white" />
            </div>
            <h3 style={{ fontSize: 15, margin: '0 0 4px', fontWeight: 700 }}>Modo Run</h3>
            <p style={{ fontSize: 12, color: 'var(--fn-slate)', margin: 0 }}>Rastrea tu ruta GPS</p>
          </div>
          
          <div onClick={() => navigate('/gym')} className="glass-card" style={{ padding: 20, textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ width: 48, height: 48, margin: '0 auto 12px', borderRadius: 24, background: 'var(--grad-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-purple)' }}>
              <Activity size={24} color="white" />
            </div>
            <h3 style={{ fontSize: 15, margin: '0 0 4px', fontWeight: 700 }}>Gym Tracker</h3>
            <p style={{ fontSize: 12, color: 'var(--fn-slate)', margin: 0 }}>Registra tu rutina</p>
          </div>
        </div>
      </section>

      {/* Upcoming Activities */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 22, margin: 0 }}>Próximamente</h2>
          <span onClick={() => navigate('/enrollments')} style={{ fontSize: 13, color: 'var(--fn-blue)', fontWeight: 600, cursor: 'pointer' }}>Ver todo</span>
        </div>
        <div className="glass-card" style={{ padding: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--grad-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-success)' }}>
            <Trophy size={24} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700 }}>Funcional Cross</h4>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--fn-slate)' }}>Hoy, 18:30 hs • Club Central</p>
          </div>
        </div>
      </section>
    </div>
  );
}
