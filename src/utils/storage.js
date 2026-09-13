/**
 * ============================================================================
 * CAMADA DE PERSISTÊNCIA — localStorage com versionamento de schema
 * ============================================================================
 * Abstrai o acesso ao localStorage do navegador, isolando o restante da
 * aplicação de detalhes de armazenamento. Toda leitura e escrita passa
 * por aqui.
 *
 * Decisões de projeto:
 *   - Prefixo de namespace evita colisão com outras aplicações no mesmo domínio
 *   - Versionamento de schema permite migrar dados quando a estrutura mudar
 *   - Toda operação é defensiva: localStorage pode estar indisponível
 *     (modo privado do Safari, cota excedida, políticas corporativas)
 *   - Falha de escrita nunca quebra a aplicação — apenas reporta
 *
 * Limitação conhecida: o localStorage é local ao navegador e à máquina.
 * Não há sincronização entre as 10 estações do escritório. A migração para
 * banco de dados remoto está prevista nas melhorias futuras.
 */

/** Prefixo de namespace para todas as chaves da aplicação */
const PREFIX = 'triagem_bpc';

/** Versão atual do schema de dados. Incrementar ao mudar a estrutura. */
export const SCHEMA_VERSION = 2;

/** Chaves utilizadas pela aplicação */
export const KEYS = {
  HISTORY: 'history',
  CID_DB: 'cidDb',
  SCHEMA: 'schemaVersion',
  THEME: 'theme',
  USERS: 'users',      // v2 — cadastro de usuários (salt + hash)
  SESSION: 'session',  // v2 — sessão ativa
  AUDIT: 'audit',      // v2 — log de auditoria
};

/** Monta a chave completa com prefixo */
function fullKey(key) {
  return `${PREFIX}:${key}`;
}

/**
 * Verifica se o localStorage está disponível e utilizável.
 * Testa escrita real — a mera existência do objeto não garante que funcione.
 * @returns {boolean}
 */
export function isStorageAvailable() {
  try {
    const testKey = `${PREFIX}:__test__`;
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Lê um valor persistido e faz o parse do JSON.
 * @param {string} key — Chave (sem prefixo)
 * @param {*} fallback — Valor retornado se a chave não existir ou falhar
 * @returns {*} Valor desserializado ou o fallback
 */
export function readItem(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(fullKey(key));
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[storage] Falha ao ler "${key}":`, err);
    return fallback;
  }
}

/**
 * Persiste um valor serializando em JSON.
 * @param {string} key — Chave (sem prefixo)
 * @param {*} value — Valor a persistir
 * @returns {boolean} true se gravou com sucesso
 */
export function writeItem(key, value) {
  try {
    window.localStorage.setItem(fullKey(key), JSON.stringify(value));
    return true;
  } catch (err) {
    // QuotaExceededError é o caso mais comum aqui
    console.warn(`[storage] Falha ao gravar "${key}":`, err);
    return false;
  }
}

/**
 * Remove uma chave do armazenamento.
 * @param {string} key — Chave (sem prefixo)
 */
export function removeItem(key) {
  try {
    window.localStorage.removeItem(fullKey(key));
    return true;
  } catch (err) {
    console.warn(`[storage] Falha ao remover "${key}":`, err);
    return false;
  }
}

/**
 * Apaga todos os dados da aplicação, preservando chaves de outras apps.
 * Usado na função de eliminação de dados exigida pela LGPD (Art. 18, VI).
 *
 * @param {string[]} [except] — Chaves a preservar (ex.: usuários, para não
 *   deixar o sistema sem administrador ao limpar a base de atendimentos)
 */
export function clearAll(except = []) {
  try {
    const preserved = except.map(fullKey);
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith(`${PREFIX}:`) && !preserved.includes(k))
      .forEach((k) => window.localStorage.removeItem(k));
    return true;
  } catch (err) {
    console.warn('[storage] Falha ao limpar dados:', err);
    return false;
  }
}

/**
 * Garante que o schema armazenado é compatível com o da aplicação.
 * Se a versão for anterior, aplica as migrações necessárias.
 * @returns {{firstRun: boolean, migrated: boolean, from: number|null}}
 */
export function ensureSchema() {
  const stored = readItem(KEYS.SCHEMA, null);

  // Primeira execução — nenhum dado anterior
  if (stored === null) {
    writeItem(KEYS.SCHEMA, SCHEMA_VERSION);
    return { firstRun: true, migrated: false, from: null };
  }

  // Schema atualizado — nada a fazer
  if (stored === SCHEMA_VERSION) {
    return { firstRun: false, migrated: false, from: stored };
  }

  // --- MIGRAÇÕES ---
  // v1 → v2: introdução de usuários, sessão e auditoria.
  // Não há transformação de dados existentes; as chaves novas nascem vazias
  // e o fluxo de configuração inicial cria o primeiro administrador.
  if (stored < 2) {
    if (readItem(KEYS.USERS, null) === null) writeItem(KEYS.USERS, []);
    if (readItem(KEYS.AUDIT, null) === null) writeItem(KEYS.AUDIT, []);
  }

  writeItem(KEYS.SCHEMA, SCHEMA_VERSION);
  return { firstRun: false, migrated: true, from: stored };
}

/**
 * Calcula o espaço ocupado pelos dados da aplicação.
 * @returns {{bytes: number, readable: string}}
 */
export function getStorageSize() {
  try {
    let bytes = 0;
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith(`${PREFIX}:`))
      .forEach((k) => {
        bytes += (window.localStorage.getItem(k) || '').length * 2; // UTF-16
      });
    const readable = bytes < 1024
      ? `${bytes} B`
      : bytes < 1048576
        ? `${(bytes / 1024).toFixed(1)} KB`
        : `${(bytes / 1048576).toFixed(2)} MB`;
    return { bytes, readable };
  } catch {
    return { bytes: 0, readable: '—' };
  }
}

// ============================================================================
// BACKUP E RESTAURAÇÃO
// ============================================================================

/**
 * Gera um arquivo JSON com os dados da aplicação e dispara o download.
 *
 * IMPORTANTE: credenciais de usuário NÃO são exportadas. Um backup que
 * carregasse salt e hash espalharia material de autenticação por pen drives
 * e e-mails. O backup cobre apenas atendimentos e base CID-10.
 */
export function exportBackup() {
  const payload = {
    app: 'triagem-bpc-loas',
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      [KEYS.HISTORY]: readItem(KEYS.HISTORY, []),
      [KEYS.CID_DB]: readItem(KEYS.CID_DB, []),
    },
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `backup-triagem-bpc-${stamp}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Lê um arquivo de backup e valida sua estrutura antes de restaurar.
 * Não grava nada — apenas devolve os dados validados para a camada de UI.
 *
 * @param {File} file — Arquivo JSON selecionado pelo usuário
 * @returns {Promise<{history: Array, cidDb: Array, exportedAt: string}>}
 * @throws {Error} Se o arquivo for inválido ou incompatível
 */
export function parseBackupFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);

        if (parsed.app !== 'triagem-bpc-loas') {
          throw new Error('Arquivo não pertence a este sistema.');
        }
        if (parsed.schemaVersion > SCHEMA_VERSION) {
          throw new Error('Backup gerado por versão mais recente do sistema.');
        }
        const history = parsed.data?.[KEYS.HISTORY];
        const cidDb = parsed.data?.[KEYS.CID_DB];
        if (!Array.isArray(history) || !Array.isArray(cidDb)) {
          throw new Error('Estrutura do backup está corrompida.');
        }

        resolve({ history, cidDb, exportedAt: parsed.exportedAt });
      } catch (err) {
        reject(new Error(err.message || 'Arquivo de backup inválido.'));
      }
    };

    reader.onerror = () => reject(new Error('Falha ao ler o arquivo.'));
    reader.readAsText(file);
  });
}
