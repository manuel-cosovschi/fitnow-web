import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Enrollments() {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    fetch('https://fitnow-api-production.up.railway.app/api/enrollments/my_enrollments', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setEnrollments(data.items || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeUp 0.4s ease-out' }}>
      <header>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', color: 'var(--fn-white)', padding: '0 0 16px 0', fontSize: 14 }}>
          ← Volver
        </button>
        <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 28, margin: '0 0 8px 0' }}>Mis Inscripciones</h1>
        <p style={{ color: 'var(--fn-slate)', fontSize: 14, margin: 0 }}>Las actividades en las que participas.</p>
      </header>

      {loading ? (
        <div style={{ color: 'var(--fn-slate)' }}>Cargando...</div>
      ) : enrollments.length === 0 ? (
        <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
          <BookOpen size={48} color="var(--fn-slate)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>No tienes inscripciones</h3>
          <p style={{ color: 'var(--fn-slate)', fontSize: 14, margin: '0 0 16px' }}>Explorá y encontrá tu próxima clase.</p>
          <button onClick={() => navigate('/explore')} style={{ background: 'var(--fn-blue)', color: 'white', padding: '10px 20px', borderRadius: 12, fontWeight: 600 }}>Explorar</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {enrollments.map((enr, i) => (
            <div key={i} className="glass-card" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>{enr.activity?.title || 'Actividad'}</h4>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--fn-slate)' }}>Estado: {enr.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
