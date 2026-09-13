/**
 * ============================================================================
 * LOG DE AUDITORIA
 * ============================================================================
 * Registra quem fez o quê e quando. Atende ao princípio de responsabilização
 * e prestação de contas da LGPD (Art. 6º, X) e permite rastrear alterações
 * indevidas na base de atendimentos.
 *
 * PRINCÍPIO ADOTADO: o log NUNCA armazena dado pessoal. Registra apenas
 * o identificador interno do registro afetado e a ação executada. Saber que
 * "maria.atendente excluiu o atendimento #1739..." é suficiente para auditar,
 * sem replicar nome, CPF ou CID em um segundo lugar.
 *
 * O log é circular: mantém apenas as N entradas mais recentes para não
 * estourar a cota do localStorage.
 */

import { readItem, writeItem, KEYS } from './storage';

/** Quantidade máxima de entradas mantidas */
const MAX_ENTRIES = 500;

/** Ações auditáveis do sistema */
export const ACTIONS = {
  LOGIN: 'Entrou no sistema',
  LOGOUT: 'Saiu do sistema',
  LOGIN_FAILED: 'Tentativa de acesso negada',
  SESSION_EXPIRED: 'Sessão expirada por inatividade',
  TRIAGEM_CREATE: 'Realizou triagem',
  TRIAGEM_DELETE: 'Excluiu atendimento',
  HISTORY_CLEAR: 'Limpou o histórico',
  CID_CREATE: 'Cadastrou CID',
  CID_UPDATE: 'Editou CID',
  CID_DELETE: 'Excluiu CID',
  CSV_EXPORT: 'Exportou CSV',
  BACKUP_EXPORT: 'Exportou backup',
  BACKUP_RESTORE: 'Restaurou backup',
  DATA_CLEAR: 'Excluiu todos os dados',
  USER_CREATE: 'Cadastrou usuário',
  USER_UPDATE: 'Alterou usuário',
  USER_DELETE: 'Excluiu usuário',
  PASSWORD_CHANGE: 'Alterou a própria senha',
};

/**
 * Registra uma entrada no log.
 * @param {string} action — Uma das chaves de ACTIONS
 * @param {Object} [context]
 * @param {string} [context.username] — Quem executou
 * @param {string} [context.ref] — Identificador do registro afetado
 * @param {string} [context.note] — Detalhe curto, sem dado pessoal
 */
export function logAction(action, context = {}) {
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    action,
    label: ACTIONS[action] || action,
    username: context.username || 'sistema',
    ref: context.ref || null,
    note: context.note || null,
    at: new Date().toISOString(),
  };

  const log = readItem(KEYS.AUDIT, []);
  // Mais recente primeiro, truncando o excedente
  const updated = [entry, ...log].slice(0, MAX_ENTRIES);
  writeItem(KEYS.AUDIT, updated);

  return entry;
}

/**
 * Recupera o log completo, do mais recente ao mais antigo.
 * @returns {Array}
 */
export function getAuditLog() {
  return readItem(KEYS.AUDIT, []);
}

/**
 * Apaga o log de auditoria.
 * Exige perfil administrador na camada de UI.
 */
export function clearAuditLog() {
  writeItem(KEYS.AUDIT, []);
}

/**
 * Exporta o log em CSV para arquivamento externo.
 */
export function exportAuditCSV() {
  const log = getAuditLog();
  const headers = ['Data/Hora', 'Usuário', 'Ação', 'Referência', 'Observação'];
  const rows = log.map((e) => [
    new Date(e.at).toLocaleString('pt-BR'),
    e.username,
    e.label,
    e.ref || '',
    e.note || '',
  ]);

  const csv = [headers, ...rows]
    .map((r) => r.map((c) => `"${c}"`).join(','))
    .join('\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `auditoria-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
