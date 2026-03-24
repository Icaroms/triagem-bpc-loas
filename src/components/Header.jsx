/**
 * ============================================================================
 * COMPONENTE: Header
 * ============================================================================
 * Barra superior com logo, título e toggle de tema (claro/escuro).
 */
import { Sun, Moon, Scale } from 'lucide-react';

export default function Header({ dark, setDark, theme: t }) {
  return (
    <div style={{ background: t.headerBg, padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Scale size={28} style={{ color: '#fbbf24' }} />
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>TRIAGEM BPC/LOAS</div>
          <div style={{ fontSize: 11, color: '#93c5fd', fontWeight: 500 }}>Advocacia Humanizada Dr. Egberto Frazão</div>
        </div>
      </div>
      <button
        onClick={() => setDark((d) => !d)}
        style={{ background: dark ? '#334155' : '#3b82f6', border: 'none', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13 }}
      >
        {dark ? <Sun size={16} /> : <Moon size={16} />} {dark ? 'CLARO' : 'ESCURO'}
      </button>
    </div>
  );
}
