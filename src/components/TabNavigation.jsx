/**
 * ============================================================================
 * COMPONENTE: TabNavigation
 * ============================================================================
 * Navegação por abas. As abas exibidas dependem do perfil do usuário —
 * a aba Sistema só aparece para administradores.
 */
import { ClipboardList, Users, BarChart3, Database, Settings } from 'lucide-react';
import { can } from '../utils/auth';

/** Definição das abas e a área de permissão correspondente */
const TABS = [
  { icon: <ClipboardList size={18} />, label: 'Triagem', area: 'triagem' },
  { icon: <Users size={18} />, label: 'Histórico', area: 'historico' },
  { icon: <BarChart3 size={18} />, label: 'Estatísticas', area: 'estatisticas' },
  { icon: <Database size={18} />, label: 'CID-10', area: 'cid' },
  { icon: <Settings size={18} />, label: 'Sistema', area: 'sistema' },
];

export default function TabNavigation({ activeTab, setTab, dark, theme: t, role }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'center', gap: 4,
      padding: '12px 24px 0', background: dark ? '#0f172a' : '#eff6ff',
      flexWrap: 'wrap',
    }}>
      {TABS.map((tb, i) => {
        // Oculta abas que o perfil não pode acessar
        if (!can(role, tb.area)) return null;
        return (
          <button
            key={i}
            onClick={() => setTab(i)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px',
              borderRadius: '10px 10px 0 0', border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: 13,
              background: activeTab === i ? t.card : 'transparent',
              color: activeTab === i ? t.accent : t.tabText,
              boxShadow: activeTab === i ? t.shadow : 'none',
              borderBottom: activeTab === i ? '3px solid ' + t.tabActive : '3px solid transparent',
            }}
          >
            {tb.icon} {tb.label}
          </button>
        );
      })}
    </div>
  );
}
