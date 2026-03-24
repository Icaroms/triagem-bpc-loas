/**
 * Barrel export — Reexporta todas as utilidades a partir de um ponto central.
 * Permite importações limpas: import { calcAge, formatCPF } from './utils'
 */
export { calcAge, detectBpcType } from './age';
export { cadunicoStatus } from './cadunico';
export { formatCPF, maskCPF, formatMoney } from './formatters';
export { calcScore, getScoreColor } from './scoring';
export { generateFeedback } from './feedback';
export { exportCSV } from './exportCSV';
export { handlePrint } from './print';
