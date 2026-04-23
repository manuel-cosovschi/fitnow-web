import { useNavigate } from 'react-router-dom';
import { Tag, Percent, ArrowRight } from 'lucide-react';

export default function SpecialOffers() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeUp 0.4s ease-out', paddingBottom: 40 }}>
      <header>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', color: 'var(--fn-white)', padding: '0 0 16px 0', fontSize: 14 }}>
          ← Volver
        </button>
        <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 28, margin: '0 0 8px 0' }}>Ofertas Especiales</h1>
        <p style={{ color: 'var(--fn-slate)', fontSize: 14, margin: 0 }}>Descuentos exclusivos en membresías.</p>
      </header>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: 'var(--grad-purple)', filter: 'blur(40px)', opacity: 0.5, borderRadius: '50%', zIndex: 0 }} />
        
        <div style={{ padding: 24, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(123,82,248,0.2)', color: '#D4C4FF', borderRadius: 12, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 16 }}>
            <Percent size={14} /> Oferta Limitada
          </div>
          
          <h3 style={{ fontSize: 24, fontFamily: '"DM Serif Display", serif', margin: '0 0 8px' }}>Plan Anual PRO</h3>
          <p style={{ color: 'var(--fn-slate)', fontSize: 14, margin: '0 0 20px' }}>Acceso ilimitado a todos los gimnasios y clubes asociados por todo un año.</p>
          
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 24 }}>
            <span style={{ fontSize: 32, fontFamily: '"JetBrains Mono", monospace', fontWeight: 800 }}>$120,000</span>
            <span style={{ fontSize: 16, color: 'var(--fn-slate)', textDecoration: 'line-through', paddingBottom: 6 }}>$180,000</span>
          </div>

          <button style={{ width: '100%', padding: 16, borderRadius: 12, background: 'var(--fn-white)', color: 'var(--fn-bg)', fontWeight: 700, fontSize: 15, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
            Reclamar Oferta <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(30,144,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Tag size={24} color="var(--fn-blue)" />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: 16, margin: '0 0 4px', fontWeight: 700 }}>Pase Amigo: 2x1</h4>
            <p style={{ fontSize: 13, color: 'var(--fn-slate)', margin: '0 0 12px' }}>Entrená con un amigo todo el mes pagando una sola cuota.</p>
            <span style={{ fontSize: 13, color: 'var(--fn-blue)', fontWeight: 600 }}>Ver detalles</span>
          </div>
        </div>
      </div>
    </div>
  );
}
