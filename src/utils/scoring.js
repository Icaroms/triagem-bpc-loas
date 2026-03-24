/**
 * ============================================================================
 * SISTEMA DE SCORING (PONTUAÇÃO DE VIABILIDADE)
 * ============================================================================
 * Algoritmo central do sistema. Calcula a viabilidade do benefício BPC
 * com base em múltiplos critérios, diferenciando BPC 87 (PcD) e BPC 88 (Idoso).
 *
 * O score varia de 0 a 100 e é classificado em três faixas:
 *   🟢 ≥70: Alta Viabilidade
 *   🟡 ≥45: Média Viabilidade
 *   🔴 <45: Baixa Viabilidade
 */

import { LIMITE_RENDA, CID_MINIMO_CASOS } from '../constants';

/**
 * Calcula o score de viabilidade do benefício.
 *
 * --- REGRAS BPC 88 (IDOSO) ---
 * Baseado apenas em miserabilidade + idade (sem CID ou laudo):
 *   Renda ≤ limite: 40 pts | Renda 1x-1.5x: 12 pts
 *   CadÚnico válido: 35 pts | Próximo: 18 pts
 *   Idade ≥ 65: 25 pts
 *   Penalidade renda acima: -15 | CadÚnico inválido: -10
 *
 * --- REGRAS BPC 87 (PcD) ---
 * Análise completa com CID + laudo:
 *   Renda ≤ limite: 15 pts
 *   CadÚnico válido: 12 pts | Próximo: 6 pts
 *   Laudo atualizado: 18 pts | Detalhado: 12 pts | Desatualizado: 0
 *   Confirmação PcD: 10 pts
 *   Taxa CID (proporcional): até 35 pts
 *   Penalidades cumulativas para combinações negativas
 *
 * @param {number} renda — Renda per capita informada
 * @param {Object} cadunicoSt — Resultado de cadunicoStatus()
 * @param {string} laudo — "atualizado" | "detalhado" | "desatualizado" | "N/A"
 * @param {string} tipoBpc — "BPC87" | "BPC88"
 * @param {number} idade — Idade calculada do cliente
 * @param {string} cidCode — Código CID-10 ou "N/A"
 * @param {Array} cidDb — Array da base de dados CID
 * @returns {number} Score de 0 a 100
 */
export function calcScore(renda, cadunicoSt, laudo, tipoBpc, idade, cidCode, cidDb) {
  // ==========================================
  // SCORING BPC 88 (IDOSO)
  // Não utiliza CID nem laudo
  // ==========================================
  if (tipoBpc === 'BPC88') {
    let s = 0;

    // Idade: deve ter 65+ anos
    if (idade >= 65) s += 25;

    // Renda: critério mais importante para o idoso
    if (renda <= LIMITE_RENDA) s += 40;
    else if (renda <= LIMITE_RENDA * 1.5) s += 12;

    // CadÚnico: comprovação de situação socioeconômica
    if (cadunicoSt.status === 'ok') s += 35;
    else if (cadunicoSt.status === 'proximo') s += 18;

    // Penalidades
    if (renda > LIMITE_RENDA) s -= 15;
    if (!cadunicoSt.valid) s -= 10;

    return Math.max(0, Math.min(100, s));
  }

  // ==========================================
  // SCORING BPC 87 (PESSOA COM DEFICIÊNCIA)
  // ==========================================
  let s = 0;

  // Renda per capita (max 15 pts)
  if (renda <= LIMITE_RENDA) s += 15;
  else if (renda <= LIMITE_RENDA * 1.5) s += 5;

  // CadÚnico (max 12 pts)
  if (cadunicoSt.status === 'ok') s += 12;
  else if (cadunicoSt.status === 'proximo') s += 6;

  // Laudo médico (max 18 pts) — desatualizado = 0 (rigoroso)
  if (laudo === 'atualizado') s += 18;
  else if (laudo === 'detalhado') s += 12;
  // desatualizado = 0 pontos (intencional)

  // Confirmação tipo PcD (max 10 pts)
  s += 10;

  // Taxa de deferimento do CID (max 35 pts) — peso principal
  const cidData = cidDb.find((c) => c.code === cidCode);
  let cidRate = 0;
  if (cidData && cidData.total >= CID_MINIMO_CASOS) {
    cidRate = cidData.approved / cidData.total;
    s += Math.round(cidRate * 35);
  } else if (cidData) {
    s += 8; // Dados insuficientes — pontuação conservadora
  }

  // ==========================================
  // PENALIDADES CUMULATIVAS
  // Tornam o score mais rigoroso em combinações negativas
  // ==========================================
  if (cidData && cidData.total >= CID_MINIMO_CASOS && cidRate < 0.25) {
    s -= 10; // CID com taxa muito baixa
  }
  if (laudo === 'desatualizado' && cidData && cidData.total >= CID_MINIMO_CASOS && cidRate < 0.40) {
    s -= 8;  // Laudo ruim + CID difícil
  }
  if (!cadunicoSt.valid && laudo === 'desatualizado') {
    s -= 5;  // Dupla falha documental
  }
  if (renda > LIMITE_RENDA) {
    s -= 10; // Renda acima é muito grave
  }

  return Math.max(0, Math.min(100, s));
}

/**
 * Retorna a cor, label e emoji do semáforo visual com base no score.
 * @param {number} score — Score de 0 a 100
 * @returns {Object} { bg, label, emoji }
 */
export function getScoreColor(score) {
  if (score >= 70) return { bg: '#16a34a', label: 'ALTA VIABILIDADE', emoji: '🟢' };
  if (score >= 45) return { bg: '#d97706', label: 'MÉDIA VIABILIDADE', emoji: '🟡' };
  return { bg: '#dc2626', label: 'BAIXA VIABILIDADE', emoji: '🔴' };
}
