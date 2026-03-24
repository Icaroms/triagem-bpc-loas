/**
 * ============================================================================
 * FUNÇÕES DE CÁLCULO DE IDADE E DETECÇÃO DE TIPO BPC
 * ============================================================================
 */

/**
 * Calcula a idade com base na data de nascimento.
 * Considera o mês e dia para verificar se o aniversário já ocorreu no ano.
 * @param {string} birthDate — Data no formato "YYYY-MM-DD"
 * @param {Date} [refDate] — Data de referência (padrão: hoje)
 * @returns {number} Idade em anos completos
 */
export function calcAge(birthDate, refDate) {
  if (!birthDate) return 0;
  const ref = refDate || new Date();
  const birth = new Date(birthDate);
  let age = ref.getFullYear() - birth.getFullYear();
  const m = ref.getMonth() - birth.getMonth();
  // Ajusta se o aniversário ainda não ocorreu no ano de referência
  if (m < 0 || (m === 0 && ref.getDate() < birth.getDate())) age--;
  return age;
}

/**
 * Detecta automaticamente o tipo de BPC com base na idade.
 *   BPC 88 (Idoso) = 65 anos ou mais
 *   BPC 87 (PcD)   = menos de 65 anos
 * @param {string} birthDate — Data de nascimento "YYYY-MM-DD"
 * @param {Date} [refDate] — Data de referência
 * @returns {"BPC87" | "BPC88"} Tipo do benefício
 */
export function detectBpcType(birthDate, refDate) {
  return calcAge(birthDate, refDate) >= 65 ? 'BPC88' : 'BPC87';
}
