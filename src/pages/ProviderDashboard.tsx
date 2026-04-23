import { useState, useEffect } from 'react';
import { PlusCircle, Users, TrendingUp, Dumbbell } from 'lucide-react';

const API = 'https://fitnow-api-production.up.railway.app/api';

const KIND_CONFIG: Record<string, { color: string; grad: string }> = {
  gym:        { color: '#1E90FF', grad: 'var(--grad-primary)' },
  club:       { color: '#7B52F8', grad: 'var(--grad-purple)' },
  trainer:    { color: '#FFB300', grad: 'var(--grad-amber)' },
  club_sport: { color: '#00E676', grad: 'var(--grad-success)' },
};

export default function ProviderDashboard() {
  const [user, setUser] = useState<any>(null);
  const [activeActs, setActiveActs] = useState<any[]>([]);
  const [draftActs, setDraftActs] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const pid = user?.provider_id;
    if (!token || !pid) { setLoading(false); return; }

    Promise.all([
      fetch(`${API}/activities?provider_id=${pid}&status=active`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API}/activities?provider_id=${pid}&status=draft`,  { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API}/enrollments/provider`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => ({})),
    ]).then(([a, d, e]) => {
      setActiveActs(a.items || []);
      setDraftActs(d.items || []);
      setEnrollments(e.enrollments || e.items || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [user]);

  const allActs = [...activeActs, ...draftActs];
  const providerName = user?.provider_name || user?.name || 'Mi Espacio';
  const initial = providerName.charAt(0).toUpperCase();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, animation: 'fadeUp 0.4s ease-out' }}>
      {/* Header gradient */}
      <div style={{ margin: '-20px -20px 24px', padding: '28px 20px 24px', background: 'linear-gradient(180deg, rgba(123,82,248,0.22) 0%, transparent 100%)', position: 'relative' }}>
        <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(123,82,248,0.08)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'var(--grad-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(123,82,248,0.35)', flexShrink: 0 }}>
            <span style={{ fontFamily: '"DM Serif Display", serif', fontSize: 22, color: 'white' }}>{initial}</span>
          </div>
          <div>
            <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 24, margin: '0 0 2px' }}>{providerName}</h1>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#7B52F8', background: 'rgba(123,82,248,0.15)', padding: '2px 10px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: 0.5 }}>Proveedor</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
        {[
          { label: 'ACTIVAS',    value: String(activeActs.length),    color: 'var(--fn-purple)', bg: 'rgba(123,82,248,0.15)', icon: <Dumbbell size={14} color="var(--fn-purple)" /> },
          { label: 'BORRADORES', value: String(draftActs.length),     color: 'var(--fn-amber)',  bg: 'rgba(255,179,0,0.15)',  icon: <TrendingUp size={14} color="var(--fn-amber)" /> },
          { label: 'INSCRIPTOS', value: String(enrollments.length),   color: 'var(--fn-green)',  bg: 'rgba(0,230,118,0.15)', icon: <Users size={14} color="var(--fn-green)" /> },
        ].map(s => (
          <div key={s.label} className="glass-card" style={{ padding: '14px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {s.icon}
              </div>
              <span style={{ fontSize: 9, color: 'var(--fn-slate)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</span>
            </div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 24, fontWeight: 800 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Create button */}
      <button style={{ background: 'var(--grad-purple)', color: 'white', padding: 16, borderRadius: 16, fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 8px 24px rgba(123,82,248,0.35)', marginBottom: 24 }}
        onClick={() => alert('Crear actividad — próximamente')}>
        <PlusCircle size={20} /> Crear nueva actividad
      </button>

      {/* Activity list */}
      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 20, margin: '0 0 14px' }}>Mis actividades</h2>
        {loading ? (
          <div style={{ color: 'var(--fn-slate)', textAlign: 'center', padding: 20 }}>Cargando...</div>
        ) : allActs.length === 0 ? (
          <div className="glass-card" style={{ padding: 32, textAlign: 'center', color: 'var(--fn-slate)' }}>
            Aún no creaste actividades.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {allActs.map(act => {
              const k = KIND_CONFIG[act.kind] || KIND_CONFIG.gym;
              const seatsUsed = act.capacity && act.seats_left != null ? act.capacity - act.seats_left : null;
              const pct = act.capacity && seatsUsed != null ? (seatsUsed / act.capacity) * 100 : null;
              const barColor = pct == null ? k.color : pct > 80 ? '#FFB300' : '#00E676';
              return (
                <div key={act.id} className="glass-card" style={{ padding: 16, borderLeft: `3px solid ${k.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: pct != null ? 12 : 0 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{act.title}</h4>
                        {act.status === 'draft' && (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'rgba(255,179,0,0.15)', color: '#FFB300' }}>Borrador</span>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: 'var(--fn-slate)' }}>
                        ${Number(act.price || 0).toLocaleString('es-AR')} / mes
                      </p>
                    </div>
                    {act.seats_left != null && (
                      <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13, color: barColor, fontWeight: 700 }}>
                        {act.seats_left} libres
                      </span>
                    )}
                  </div>
                  {pct != null && act.capacity && (
                    <div>
                      <div style={{ height: 4, borderRadius: 999, background: 'var(--fn-elevated)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 999 }} />
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--fn-slate)', marginTop: 4 }}>
                        {seatsUsed} / {act.capacity} ocupados
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent enrollments */}
      {enrollments.length > 0 && (
        <section>
          <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 20, margin: '0 0 14px' }}>Últimas inscripciones</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {enrollments.slice(0, 8).map((e: any, i: number) => (
              <div key={i} className="glass-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--fn-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: '"DM Serif Display", serif', fontSize: 15 }}>
                    {(e.user_name || e.user?.name || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{e.user_name || e.user?.name || 'Usuario'}</div>
                  <div style={{ fontSize: 12, color: 'var(--fn-slate)' }}>{e.activity_title || e.activity?.title || ''}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#00E676', background: 'rgba(0,230,118,0.12)', padding: '3px 10px', borderRadius: 999 }}>
                  {e.status || 'activo'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
