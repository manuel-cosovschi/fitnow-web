import { useState, useEffect } from 'react';
import { PlusCircle, Building2, Users } from 'lucide-react';

export default function ProviderDashboard() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    fetch('https://fitnow-api-production.up.railway.app/api/activities/my_activities', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setActivities(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeUp 0.4s ease-out' }}>
      <header>
        <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 28, margin: '0 0 8px 0' }}>Panel Proveedor</h1>
        <p style={{ color: 'var(--fn-slate)', fontSize: 14, margin: 0 }}>Gestioná tus clases y gimnasios.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Building2 size={18} color="var(--fn-purple)" />
            <span style={{ fontSize: 12, color: 'var(--fn-slate)', fontWeight: 600, textTransform: 'uppercase' }}>Clases Activas</span>
          </div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 24, fontWeight: 800 }}>
            {activities.length}
          </div>
        </div>
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Users size={18} color="var(--fn-green)" />
            <span style={{ fontSize: 12, color: 'var(--fn-slate)', fontWeight: 600, textTransform: 'uppercase' }}>Inscriptos</span>
          </div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 24, fontWeight: 800 }}>
            0
          </div>
        </div>
      </div>

      <button style={{ background: 'var(--grad-purple)', color: 'white', padding: 16, borderRadius: 16, fontWeight: 'bold', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: 'var(--shadow-purple)' }}>
        <PlusCircle size={20} /> Crear Nueva Actividad
      </button>

      <section>
        <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 20, marginBottom: 16 }}>Mis Actividades</h2>
        {loading ? (
          <div style={{ color: 'var(--fn-slate)' }}>Cargando...</div>
        ) : activities.length === 0 ? (
          <div className="glass-card" style={{ padding: 32, textAlign: 'center', color: 'var(--fn-slate)' }}>
            Aún no has creado actividades.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {activities.map(act => (
              <div key={act.id} className="glass-card" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700 }}>{act.title}</h4>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--fn-slate)' }}>${act.price} / mes</p>
                </div>
                <div style={{ padding: '6px 12px', background: 'rgba(123,82,248,0.2)', color: 'var(--fn-purple)', borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
                  Editar
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
