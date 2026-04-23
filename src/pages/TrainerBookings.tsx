import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Search } from 'lucide-react';

export default function TrainerBookings() {
  const navigate = useNavigate();

  const trainers = [
    { id: 1, name: 'Martín Pérez', spec: 'Fuerza & Hipertrofia', rating: 4.9, price: 15000, img: 'M' },
    { id: 2, name: 'Sofía Costa', spec: 'Funcional & HIIT', rating: 4.8, price: 12000, img: 'S' }
  ];

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '20px', animation: 'fadeUp 0.4s ease-out', paddingBottom: 40 }}>
      <header>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', color: 'var(--fn-white)', padding: '0 0 16px 0', fontSize: 14 }}>
          ← Volver
        </button>
        <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 28, margin: '0 0 8px 0' }}>Entrenadores</h1>
        <p style={{ color: 'var(--fn-slate)', fontSize: 14, margin: 0 }}>Encuentra al profesional ideal para ti.</p>
      </header>

      <div style={{ position: 'relative' }}>
        <Search size={18} color="var(--fn-slate)" style={{ position: 'absolute', left: 16, top: 16 }} />
        <input 
          placeholder="Buscar por especialidad..." 
          style={{ paddingLeft: 46, borderRadius: 24, background: 'var(--fn-surface)' }} 
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {trainers.map(t => (
          <div key={t.id} className="glass-card" style={{ padding: 16, display: 'flex', gap: 16, cursor: 'pointer' }}>
            <div style={{ width: 64, height: 64, borderRadius: 32, background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, boxShadow: 'var(--shadow-brand)' }}>
              {t.img}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px' }}>{t.name}</h3>
              <p style={{ fontSize: 13, color: 'var(--fn-slate)', margin: '0 0 8px' }}>{t.spec}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--fn-slate)' }}>
                <span>⭐ {t.rating}</span>
                <span>${t.price}/mes</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: 20, marginTop: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>Reservar Sesión de Prueba</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'var(--fn-elevated)', borderRadius: 12 }}>
            <Calendar size={18} color="var(--fn-blue)" />
            <span style={{ fontSize: 14 }}>Jueves, 25 de Abril</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'var(--fn-elevated)', borderRadius: 12 }}>
            <Clock size={18} color="var(--fn-amber)" />
            <span style={{ fontSize: 14 }}>18:00 hs</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'var(--fn-elevated)', borderRadius: 12 }}>
            <MapPin size={18} color="var(--fn-green)" />
            <span style={{ fontSize: 14 }}>Gimnasio Central</span>
          </div>
        </div>

        <button style={{ width: '100%', marginTop: 20, padding: 16, borderRadius: 12, background: 'var(--fn-white)', color: 'var(--fn-bg)', fontWeight: 700, fontSize: 15 }}>
          Confirmar Reserva
        </button>
      </div>
    </div>
  );
}
