/**
 * ============================================================================
 * COMPONENTE: TabNavigation
 * ============================================================================
 * Navegação por abas (Triagem, Histórico, Estatísticas, CID-10).
 */
import { ClipboardList, Users, BarChart3, Database } from 'lucide-react';

const TABS = [
  { icon: <ClipboardList size={18} />, label: 'Triagem' },
  { icon: <Users size={18} />, label: 'Histórico' },
  { icon: <BarChart3 size={18} />, label: 'Estatísticas' },
  { icon: <Database size={18} />, label: 'CID-10' },
];

export default function TabNavigation({ activeTab, setTab, dark, theme: t }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 4, padding: '12px 24px 0', background: dark ? '#0f172a' : '#eff6ff' }}>
      {TABS.map((tb, i) => (
        <button
          key={i}
          onClick={() => setTab(i)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '10px 22px',
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
      ))}
    </div>
  );
}
