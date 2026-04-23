import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, CheckCircle2 } from 'lucide-react';

export default function ActivityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<any>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    fetch(`https://fitnow-api-production.up.railway.app/api/activities/${id}`)
      .then(res => res.json())
      .then(data => setActivity(data))
      .catch(console.error);
  }, [id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`https://fitnow-api-production.up.railway.app/api/enrollments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ activity_id: id })
      });
      if (res.ok) setEnrolled(true);
      else alert('Error al inscribirse');
    } catch (err) {
      alert('Error de red');
    } finally {
      setEnrolling(false);
    }
  };

  if (!activity) return <div style={{ padding: 40, textAlign: 'center' }}>Cargando...</div>;

  return (
    <div style={{ paddingBottom: 40, animation: 'fadeUp 0.4s ease-out' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'transparent', color: 'var(--fn-white)', padding: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        <ArrowLeft size={20} /> Volver
      </button>

      <div style={{ height: 200, background: 'var(--fn-elevated)', borderRadius: 24, marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--fn-bg), transparent)' }} />
      </div>

      <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 32, margin: '0 0 12px 0' }}>{activity.title}</h1>
      
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {activity.location && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--fn-slate)', fontSize: 14 }}>
            <MapPin size={16} color="var(--fn-blue)" /> {activity.location}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--fn-slate)', fontSize: 14 }}>
          <Calendar size={16} color="var(--fn-amber)" /> Lunes a Viernes
        </div>
      </div>

      <div className="glass-card" style={{ padding: 20, marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 12px' }}>Descripción</h3>
        <p style={{ color: 'var(--fn-slate)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
          {activity.description || 'Sin descripción disponible.'}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--fn-slate)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Inversión</div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 28, fontWeight: 800 }}>
            ${Number(activity.price).toFixed(0)} <span style={{ fontSize: 14, color: 'var(--fn-slate)' }}>/ mes</span>
          </div>
        </div>
      </div>

      <button 
        onClick={handleEnroll} 
        disabled={enrolling || enrolled}
        style={{ 
          width: '100%', 
          padding: 18, 
          borderRadius: 16, 
          background: enrolled ? 'var(--grad-success)' : 'var(--grad-primary)', 
          color: 'white', 
          fontWeight: 700, 
          fontSize: 16, 
          boxShadow: enrolled ? 'var(--shadow-success)' : 'var(--shadow-brand)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 10
        }}
      >
        {enrolling ? 'Procesando...' : enrolled ? <><CheckCircle2 /> Inscripto Exitosamente</> : 'Inscribirme Ahora'}
      </button>
    </div>
  );
}
