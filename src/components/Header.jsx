/**
 * ============================================================================
 * COMPONENTE: Header
 * ============================================================================
 * Barra superior com logo, identificação do usuário logado, toggle de tema
 * e botão de saída.
 */
import { Sun, Moon, Scale, LogOut, UserCircle } from 'lucide-react';
import { ROLES } from '../utils/auth';

export default function Header({ dark, setDark, theme: t, session, onLogout }) {
  return (
    <div style={{
      background: t.headerBg, padding: '14px 24px',
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', flexWrap: 'wrap', gap: 12,
    }}>
      {/* Identidade */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Scale size={28} style={{ color: '#fbbf24' }} />
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>TRIAGEM BPC/LOAS</div>
          <div style={{ fontSize: 11, color: '#93c5fd', fontWeight: 500 }}>
            Advocacia Humanizada Dr. Egberto Frazão
          </div>
        </div>
      </div>

      {/* Usuário e ações */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {session && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '6px 12px', borderRadius: 9,
            background: 'rgba(255,255,255,0.12)',
          }}>
            <UserCircle size={17} style={{ color: '#93c5fd' }} />
            <div style={{ lineHeight: 1.25 }}>
              <div style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>{session.name}</div>
              <div style={{ fontSize: 10, color: '#93c5fd' }}>{ROLES[session.role].label}</div>
            </div>
          </div>
        )}

        <button
          onClick={() => setDark((d) => !d)}
          title={dark ? 'Modo claro' : 'Modo escuro'}
          style={{
            background: dark ? '#334155' : '#3b82f6', border: 'none',
            borderRadius: 9, padding: '9px 11px', cursor: 'pointer', color: '#fff',
            display: 'flex', alignItems: 'center',
          }}
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {session && (
          <button
            onClick={onLogout}
            title="Sair"
            style={{
              background: 'rgba(239,68,68,0.85)', border: 'none',
              borderRadius: 9, padding: '9px 11px', cursor: 'pointer', color: '#fff',
              display: 'flex', alignItems: 'center',
            }}
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
