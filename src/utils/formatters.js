/**
 * ============================================================================
 * FUNÇÕES DE FORMATAÇÃO E MÁSCARAS
 * ============================================================================
 * Funções utilitárias para formatação de dados exibidos na interface.
 */

/**
 * Formata CPF durante a digitação.
 * Aplica máscara progressiva: 000.000.000-00
 * @param {string} v — Valor digitado (com ou sem formatação)
 * @returns {string} CPF formatado
 */
export function formatCPF(v) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return d.replace(/(\d{3})(\d+)/, '$1.$2');
  if (d.length <= 9) return d.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4');
}

/**
 * Mascara o CPF para exibição segura.
 * Exibe apenas os 3 primeiros e 2 últimos dígitos: 030.***.***-67
 * @param {string} cpf — CPF completo formatado ou não
 * @returns {string} CPF mascarado
 */
export function maskCPF(cpf) {
  const d = cpf.replace(/\D/g, '');
  if (d.length < 11) return '***.***.***-**';
  return `${d.slice(0, 3)}.***.***-${d.slice(9, 11)}`;
}

/**
 * Formata valor monetário no padrão brasileiro.
 * @param {number} v — Valor numérico
 * @returns {string} Valor formatado: "R$ 1.234,56"
 */
export function formatMoney(v) {
  return 'R$ ' + Number(v).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
