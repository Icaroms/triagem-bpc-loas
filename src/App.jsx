/**
 * ============================================================================
 * COMPONENTE RAIZ: App (v2 — Triagem)
 * ============================================================================
 * Adiciona a aba de Triagem funcional. Demais abas com placeholder.
 */
import { useState } from 'react';
import { getTheme } from './styles/theme';
import { CID_DATABASE_INITIAL } from './data/cidDatabase';

import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import Footer from './components/Footer';
import TabTriagem from './components/TabTriagem';

export default function App() {
  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState(0);
  const [cidDb] = useState(CID_DATABASE_INITIAL);
  const [history, setHistory] = useState([]);

  const theme = getTheme(dark);

  const Placeholder = ({ icon, title }) => (
    <div style={{ background: theme.card, borderRadius: 16, padding: 40, boxShadow: theme.shadow, border: '1px solid ' + theme.border, textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <h2 style={{ margin: '0 0 8px', color: theme.text, fontSize: 20 }}>{title}</h2>
      <p style={{ color: theme.textMuted, fontSize: 14 }}>Módulo em desenvolvimento...</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, color: theme.text, fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" }}>
      <Header dark={dark} setDark={setDark} theme={theme} />
      <TabNavigation activeTab={tab} setTab={setTab} dark={dark} theme={theme} />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
        {tab === 0 && <TabTriagem dark={dark} theme={theme} cidDb={cidDb} setHistory={setHistory} />}
        {tab === 1 && <Placeholder icon="👥" title="Histórico" />}
        {tab === 2 && <Placeholder icon="📊" title="Estatísticas" />}
        {tab === 3 && <Placeholder icon="🏥" title="CID-10" />}
      </div>
      <Footer theme={theme} />
    </div>
  );
}
