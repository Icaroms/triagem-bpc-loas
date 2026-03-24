/**
 * ============================================================================
 * GERAÇÃO DE FEEDBACK INTELIGENTE
 * ============================================================================
 * Gera recomendações personalizadas com base no resultado da triagem.
 * Diferencia BPC 87 (PcD) e BPC 88 (Idoso).
 * Inclui sugestão de via judicial quando a taxa administrativa é baixa.
 */

import { LIMITE_RENDA, CID_MINIMO_CASOS } from '../constants';
import { formatMoney } from './formatters';

/**
 * Gera array de strings com feedback personalizado.
 * @param {number} score — Score calculado
 * @param {number} renda — Renda per capita
 * @param {Object} cadunicoSt — Resultado de cadunicoStatus()
 * @param {string} laudo — Situação do laudo
 * @param {string} tipoBpc — "BPC87" | "BPC88"
 * @param {number} idade — Idade do cliente
 * @param {string} cidCode — Código CID-10
 * @param {Array} cidDb — Base de dados CID
 * @returns {string[]} Array de linhas de feedback
 */
export function generateFeedback(score, renda, cadunicoSt, laudo, tipoBpc, idade, cidCode, cidDb) {
  const parts = [];
  const isBpc88 = tipoBpc === 'BPC88';

  // --- CLASSIFICAÇÃO GERAL ---
  if (score >= 70) {
    parts.push('✅ O perfil do cliente apresenta ALTA VIABILIDADE para concessão do benefício pela via administrativa. Ainda assim, nenhum resultado é garantido — o deferimento depende da análise do INSS.');
  } else if (score >= 45) {
    parts.push('⚠️ O perfil do cliente apresenta MÉDIA VIABILIDADE. Recomenda-se fortalecer a documentação antes de protocolar o requerimento administrativo.');
  } else {
    parts.push(
      '❌ O perfil do cliente apresenta BAIXA VIABILIDADE pela via administrativa.' +
      (isBpc88 ? '' : ' Recomenda-se fortemente avaliar a via judicial como alternativa.')
    );
  }

  // --- RENDA ---
  if (renda > LIMITE_RENDA) {
    parts.push(
      `🚫 RENDA ACIMA DO LIMITE: Renda informada (${formatMoney(renda)}) ultrapassa o limite de ¼ do salário mínimo (${formatMoney(LIMITE_RENDA)}). Este é um dos critérios mais restritivos e compromete gravemente o deferimento.`
    );
  }

  // --- CADÚNICO ---
  if (cadunicoSt.status === 'vencido') {
    parts.push(`📋 CADÚNICO VENCIDO: ${cadunicoSt.msg}. O cliente DEVE atualizar o CadÚnico antes de protocolar qualquer requerimento.`);
  } else if (cadunicoSt.status === 'proximo') {
    parts.push(`📋 ATENÇÃO: ${cadunicoSt.msg}. Recomenda-se atualização preventiva para evitar que vença durante a análise.`);
  } else if (cadunicoSt.status === 'ausente') {
    parts.push('📋 CadÚnico não informado. O CadÚnico atualizado é requisito obrigatório para o BPC.');
  } else {
    parts.push(`📋 ${cadunicoSt.msg}.`);
  }

  // --- CAMPOS ESPECÍFICOS BPC 87 (PcD) ---
  if (!isBpc88) {
    // Laudo médico
    if (laudo === 'desatualizado') {
      parts.push('📄 LAUDO DESATUALIZADO: Um laudo médico recente (últimos 6 meses) e detalhado é peça fundamental. Laudos antigos ou genéricos são um dos principais motivos de indeferimento.');
    } else if (laudo === 'detalhado') {
      parts.push('📄 Laudo detalhado. Para maximizar as chances, verificar se está atualizado (últimos 6 meses).');
    }

    // CID-10
    const cidData = cidDb.find((c) => c.code === cidCode);
    const cidRate = cidData && cidData.total >= CID_MINIMO_CASOS
      ? (cidData.approved / cidData.total * 100)
      : null;
    const cidRateNum = cidRate !== null ? Number(cidRate.toFixed(0)) : null;

    if (cidRateNum !== null) {
      parts.push(`📊 CID ${cidCode} (${cidData.name}): taxa histórica de deferimento ADMINISTRATIVO de ${cidRateNum}% (${cidData.approved}/${cidData.total} casos).`);
      if (cidRateNum < 25) {
        parts.push(`⚖️ VIA JUDICIAL RECOMENDADA: O índice de deferimento administrativo para este CID é muito baixo (${cidRateNum}%). A via judicial tende a apresentar taxas significativamente maiores (perícia judicial mais detalhada).`);
      } else if (cidRateNum < 40) {
        parts.push('⚖️ CONSIDERAR VIA JUDICIAL: Taxa administrativa abaixo de 40%. A via judicial pode ser mais efetiva, especialmente com documentação médica robusta.');
      }
    } else if (cidData && cidData.total < CID_MINIMO_CASOS) {
      parts.push(`📊 CID ${cidCode}: base insuficiente (${cidData.total} casos). Mínimo ${CID_MINIMO_CASOS} casos para análise confiável.`);
    }

    // Alerta de combinação perigosa
    if (laudo === 'desatualizado' && cidRateNum !== null && cidRateNum < 40) {
      parts.push('🔴 ALERTA CRÍTICO: Laudo desatualizado + CID de baixa taxa = combinação com altíssima chance de indeferimento administrativo.');
    }
  } else {
    // --- CAMPOS ESPECÍFICOS BPC 88 (IDOSO) ---
    parts.push('👴 BPC IDOSO: A análise é baseada no critério de miserabilidade (renda) e idade. Não é necessário CID ou laudo médico.');
    if (idade < 65) {
      parts.push('⚠️ Cliente não atingiu 65 anos. Verificar BPC 87 (Pessoa com Deficiência).');
    }
  }

  // --- SUGESTÕES ---
  if (score >= 45 && score < 70) {
    parts.push(
      '💡 SUGESTÃO: ' +
      (isBpc88
        ? 'Verificar se há possibilidade de reduzir a renda declarada (revisão de composição familiar) e atualizar o CadÚnico.'
        : 'Reforçar documentação (laudo atualizado + CadÚnico em dia) pode elevar a viabilidade.')
    );
  }
  if (score >= 70) {
    parts.push('⚠️ IMPORTANTE: Score alto NÃO garante deferimento. A decisão final é sempre do INSS ou Judiciário.');
  }

  return parts;
}
