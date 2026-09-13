/**
 * ============================================================================
 * COMPONENTE RAIZ: App (v6 — com autenticação)
 * ============================================================================
 * Gerencia o estado global, o ciclo de sessão e orquestra os componentes.
 *
 * Fluxo de acesso:
 *   1. Verifica se existe sessão válida no armazenamento
 *   2. Sem sessão → exibe LoginScreen (que decide entre setup e login)
 *   3. Com sessão → libera a aplicação, monitorando inatividade
 *
 * As abas visíveis dependem do perfil. A verificação de permissão ocorre
 * tanto na navegação quanto na renderização do conteúdo, para que trocar o
 * índice da aba manualmente não exponha área restrita.
 */
import { useEffect, useState, useCallback } from 'react';
import { getTheme } from './styles/theme';
import { CID_DATABASE_INITIAL } from './data/cidDatabase';
import { buildHistory } from './data/simulatedHistory';
import { usePersistedState } from './hooks/usePersistedState';
import { useIdleTimeout } from './hooks/useIdleTimeout';
import { KEYS, ensureSchema } from './utils/storage';
import { getSession, endSession, can } from './utils/auth';
import { logAction } from './utils/audit';

import LoginScreen from './components/LoginScreen';
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import Footer from './components/Footer';
import TabTriagem from './components/TabTriagem';
import TabHistorico from './components/TabHistorico';
import TabEstatisticas from './components/TabEstatisticas';
import TabCID from './components/TabCID';
import TabSistema from './components/TabSistema';

export default function App() {
  // Schema precisa estar íntegro antes de qualquer leitura de dado
  const [schemaReady, setSchemaReady] = useState(false);
  useEffect(() => {
    ensureSchema();
    setSchemaReady(true);
  }, []);

  // --- Sessão ---
  const [session, setSession] = useState(null);
  const [expiredNotice, setExpiredNotice] = useState(false);

  useEffect(() => {
    if (!schemaReady) return;
    const { session: stored, expired } = getSession();
    if (stored) setSession(stored);
    if (expired) setExpiredNotice(true);
  }, [schemaReady]);

  // --- Estado da aplicação (persistido) ---
  const [dark, setDark] = usePersistedState(KEYS.THEME, false);
  const [tab, setTab] = useState(0);
  const [cidDb, setCidDb] = usePersistedState(KEYS.CID_DB, CID_DATABASE_INITIAL);
  const [history, setHistory, storageMeta] = usePersistedState(
    KEYS.HISTORY,
    () => buildHistory(CID_DATABASE_INITIAL)
  );

  const theme = getTheme(dark);

  /** Encerra a sessão por inatividade */
  const handleTimeout = useCallback(() => {
    if (!session) return;
    logAction('SESSION_EXPIRED', { username: session.username });
    endSession();
    setSession(null);
    setExpiredNotice(true);
    setTab(0);
  }, [session]);

  useIdleTimeout(Boolean(session), handleTimeout);

  /** Saída voluntária */
  const handleLogout = () => {
    if (session) logAction('LOGOUT', { username: session.username });
    endSession();
    setSession(null);
    setTab(0);
  };

  /** Entrada bem-sucedida */
  const handleAuthenticated = (newSession) => {
    setSession(newSession);
    setExpiredNotice(false);
  };

  const handleRestore = (restoredHistory, restoredCidDb) => {
    setHistory(restoredHistory);
    setCidDb(restoredCidDb);
    logAction('BACKUP_RESTORE', { username: session?.username });
  };

  const handleClearAll = () => {
    setHistory([]);
    setCidDb(CID_DATABASE_INITIAL);
    logAction('DATA_CLEAR', { username: session?.username });
  };

  // Aguarda a verificação do schema para evitar leitura inconsistente
  if (!schemaReady) return null;

  // --- Não autenticado ---
  if (!session) {
    return (
      <>
        {expiredNotice && (
          <div style={{
            position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
            background: theme.card, border: `1px solid ${theme.warning}`,
            color: theme.warning, padding: '10px 18px', borderRadius: 10,
            fontSize: 13, zIndex: 10, boxShadow: theme.shadow,
            fontFamily: "'Segoe UI', system-ui, sans-serif",
          }}>
            Sessão encerrada por inatividade.
          </div>
        )}
        <LoginScreen theme={theme} onAuthenticated={handleAuthenticated} />
      </>
    );
  }

  // --- Autenticado ---
  return (
    <div style={{
      minHeight: '100vh', background: theme.bg, color: theme.text,
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    }}>
      <Header
        dark={dark}
        setDark={setDark}
        theme={theme}
        session={session}
        onLogout={handleLogout}
      />
      <TabNavigation
        activeTab={tab}
        setTab={setTab}
        dark={dark}
        theme={theme}
        role={session.role}
      />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
        {tab === 0 && can(session.role, 'triagem') && (
          <TabTriagem
            dark={dark}
            theme={theme}
            cidDb={cidDb}
            setHistory={setHistory}
            session={session}
          />
        )}
        {tab === 1 && can(session.role, 'historico') && (
          <TabHistorico
            theme={theme}
            history={history}
            setHistory={setHistory}
            cidDb={cidDb}
            storagePersisted={storageMeta.persisted}
            onRestore={handleRestore}
            onClearAll={handleClearAll}
            session={session}
          />
        )}
        {tab === 2 && can(session.role, 'estatisticas') && (
          <TabEstatisticas theme={theme} history={history} cidDb={cidDb} />
        )}
        {tab === 3 && can(session.role, 'cid') && (
          <TabCID theme={theme} cidDb={cidDb} setCidDb={setCidDb} session={session} />
        )}
        {tab === 4 && can(session.role, 'sistema') && (
          <TabSistema theme={theme} session={session} />
        )}
      </div>

      <Footer theme={theme} />
    </div>
  );
}
