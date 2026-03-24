/**
 * ============================================================================
 * VALIDAÇÃO DO CADÚNICO
 * ============================================================================
 * O CadÚnico (Cadastro Único) é requisito obrigatório para o BPC.
 * Validade: 2 anos a partir da última atualização.
 */

import { CADUNICO_VALIDADE_ANOS, CADUNICO_ALERTA_DIAS } from '../constants';

/**
 * Verifica a situação do CadÚnico com base na data da última atualização.
 * 
 * @param {string} dateStr — Data da última atualização "YYYY-MM-DD"
 * @param {Date} [refDate] — Data de referência (padrão: hoje)
 * @returns {Object} Objeto com:
 *   - valid    {boolean} — Se está dentro da validade
 *   - daysLeft {number}  — Dias restantes até vencer
 *   - status   {string}  — "ok" | "proximo" (≤90 dias) | "vencido" | "ausente"
 *   - msg      {string}  — Mensagem descritiva para exibição
 */
export function cadunicoStatus(dateStr, refDate) {
  // Caso a data não tenha sido informada
  if (!dateStr) {
    return { valid: false, daysLeft: 0, status: 'ausente', msg: 'Data não informada' };
  }

  const ref = refDate || new Date();
  const d = new Date(dateStr);

  // Calcula a data de expiração (2 anos após a atualização)
  const expiry = new Date(d);
  expiry.setFullYear(expiry.getFullYear() + CADUNICO_VALIDADE_ANOS);

  const diffMs = expiry - ref;
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  // Já venceu
  if (daysLeft < 0) {
    return {
      valid: false,
      daysLeft: 0,
      status: 'vencido',
      msg: 'CadÚnico vencido desde ' + expiry.toLocaleDateString('pt-BR'),
    };
  }

  // Próximo de vencer (≤90 dias)
  if (daysLeft <= CADUNICO_ALERTA_DIAS) {
    return {
      valid: true,
      daysLeft,
      status: 'proximo',
      msg: `CadÚnico vence em ${daysLeft} dias (${expiry.toLocaleDateString('pt-BR')})`,
    };
  }

  // Válido
  return {
    valid: true,
    daysLeft,
    status: 'ok',
    msg: 'CadÚnico válido até ' + expiry.toLocaleDateString('pt-BR'),
  };
}
