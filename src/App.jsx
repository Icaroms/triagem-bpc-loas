/**
 * ============================================================================
 * COMPONENTE RAIZ: App (v5 — com persistência)
 * ============================================================================
 * Gerencia o estado global e orquestra os componentes.
 *
 * Mudança nesta versão: o estado do histórico e da base CID-10 passou de
 * useState para usePersistedState. Os dados agora sobrevivem ao
 * recarregamento da página, à navegação e ao fechamento do navegador.
 *
 * Na primeira execução, o histórico é semeado com os atendimentos de
 * referência do escritório. A partir daí, o que estiver gravado prevalece.
 */
import { useEffect, useState } from 'react';
import { getTheme } from './styles/theme';
import { CID_DATABASE_INITIAL } from './data/cidDatabase';
import { buildHistory } from './data/simulatedHistory';
import { usePersistedState } from './hooks/usePersistedState';
import { KEYS, ensureSchema } from './utils/storage';

import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import Footer from './components/Footer';
import TabTriagem from './components/TabTriagem';
import TabHistorico from './components/TabHistorico';
import TabEstatisticas from './components/TabEstatisticas';
import TabCID from './components/TabCID';

export default function App() {
  const [dark, setDark] = usePersistedState(KEYS.THEME, false);
  const [tab, setTab] = useState(0);

  // Estado persistido — sobrevive ao recarregamento
  const [cidDb, setCidDb] = usePersistedState(KEYS.CID_DB, CID_DATABASE_INITIAL);
  const [history, setHistory, storageMeta] = usePersistedState(
    KEYS.HISTORY,
    () => buildHistory(CID_DATABASE_INITIAL)
  );

  // Verifica e migra o schema uma única vez na montagem
  useEffect(() => {
    const { migrated } = ensureSchema();
    if (migrated) {
      console.info('[app] Schema de dados migrado para a versão atual.');
    }
  }, []);

  const theme = getTheme(dark);

  /** Restaura um backup substituindo todo o estado atual */
  const handleRestore = (restoredHistory, restoredCidDb) => {
    setHistory(restoredHistory);
    setCidDb(restoredCidDb);
  };

  /** Volta o sistema ao estado inicial após exclusão total */
  const handleClearAll = () => {
    setHistory([]);
    setCidDb(CID_DATABASE_INITIAL);
  };

  return (
    <div style={{
      minHeight: '100vh', background: theme.bg, color: theme.text,
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    }}>
      <Header dark={dark} setDark={setDark} theme={theme} />
      <TabNavigation activeTab={tab} setTab={setTab} dark={dark} theme={theme} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
        {tab === 0 && (
          <TabTriagem
            dark={dark}
            theme={theme}
            cidDb={cidDb}
            setHistory={setHistory}
          />
        )}
        {tab === 1 && (
          <TabHistorico
            theme={theme}
            history={history}
            setHistory={setHistory}
            cidDb={cidDb}
            storagePersisted={storageMeta.persisted}
            onRestore={handleRestore}
            onClearAll={handleClearAll}
          />
        )}
        {tab === 2 && (
          <TabEstatisticas theme={theme} history={history} cidDb={cidDb} />
        )}
        {tab === 3 && (
          <TabCID theme={theme} cidDb={cidDb} setCidDb={setCidDb} />
        )}
      </div>

      <Footer theme={theme} />
    </div>
  );
}
