/**
 * ============================================================================
 * DEFINIÇÕES DE TEMA (CLARO / ESCURO)
 * ============================================================================
 * Centraliza todas as cores e tokens visuais do sistema.
 * Cada tema retorna um objeto com as mesmas chaves para troca dinâmica.
 */

export const lightTheme = {
  bg: '#f8fafc',
  card: '#ffffff',
  cardAlt: '#f1f5f9',
  text: '#0f172a',
  textMuted: '#64748b',
  border: '#e2e8f0',
  accent: '#2563eb',
  danger: '#dc2626',
  success: '#16a34a',
  warning: '#d97706',
  inputBg: '#ffffff',
  inputBorder: '#cbd5e1',
  tabActive: '#2563eb',
  tabText: '#64748b',
  headerBg: '#1e40af',
  shadow: '0 4px 24px rgba(0,0,0,0.08)',
};

export const darkTheme = {
  bg: '#0f172a',
  card: '#1e293b',
  cardAlt: '#334155',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  border: '#475569',
  accent: '#38bdf8',
  danger: '#ef4444',
  success: '#22c55e',
  warning: '#eab308',
  inputBg: '#1e293b',
  inputBorder: '#475569',
  tabActive: '#38bdf8',
  tabText: '#94a3b8',
  headerBg: '#0c1524',
  shadow: '0 4px 24px rgba(0,0,0,0.4)',
};

/**
 * Retorna o tema com base no estado do modo escuro.
 * @param {boolean} isDark — true para tema escuro
 * @returns {Object} Objeto do tema
 */
export function getTheme(isDark) {
  return isDark ? darkTheme : lightTheme;
}
