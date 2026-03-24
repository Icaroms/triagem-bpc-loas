/**
 * ============================================================================
 * COMPONENTE RAIZ: App (v1 — Shell)
 * ============================================================================
 * Versão inicial com layout base e placeholders para as abas.
 */
import { useState } from 'react';
import { getTheme } from './styles/theme';

import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import Footer from './components/Footer';

export default function App() {
  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState(0);

  const theme = getTheme(dark);

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, color: theme.text, fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" }}>
      <Header dark={dark} setDark={setDark} theme={theme} />
      <TabNavigation activeTab={tab} setTab={setTab} dark={dark} theme={theme} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
        <div style={{
          background: theme.card, borderRadius: 16, padding: 40,
          boxShadow: theme.shadow, border: '1px solid ' + theme.border,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>
            {tab === 0 ? '📋' : tab === 1 ? '👥' : tab === 2 ? '📊' : '🏥'}
          </div>
          <h2 style={{ margin: '0 0 8px', color: theme.text, fontSize: 20 }}>
            {['Triagem', 'Histórico', 'Estatísticas', 'CID-10'][tab]}
          </h2>
          <p style={{ color: theme.textMuted, fontSize: 14 }}>
            Módulo em desenvolvimento...
          </p>
        </div>
      </div>

      <Footer theme={theme} />
    </div>
  );
}
