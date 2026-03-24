/**
 * ============================================================================
 * CONSTANTES GLOBAIS DO SISTEMA
 * ============================================================================
 * Valores de referência utilizados em todo o sistema.
 * Atualize SALARIO_MINIMO sempre que houver reajuste federal.
 */

/** Salário mínimo vigente em 2026 (R$) */
export const SALARIO_MINIMO = 1621.00;

/** Limite de renda per capita para elegibilidade ao BPC: ¼ do salário mínimo */
export const LIMITE_RENDA = SALARIO_MINIMO / 4;

/**
 * Classificação do score de viabilidade.
 * Utilizada para definir cores e labels do semáforo visual.
 */
export const SCORE_THRESHOLDS = {
  ALTA: 70,    // ≥70: Alta Viabilidade (verde)
  MEDIA: 45,   // ≥45: Média Viabilidade (amarelo)
  // <45: Baixa Viabilidade (vermelho)
};

/**
 * Prazo de validade do CadÚnico em dias (2 anos = 730 dias).
 * Alerta de proximidade: 90 dias antes do vencimento.
 */
export const CADUNICO_VALIDADE_ANOS = 2;
export const CADUNICO_ALERTA_DIAS = 90;

/**
 * Mínimo de casos registrados para um CID ser considerado
 * estatisticamente confiável. Evita distorções como 1/1 = 100%.
 */
export const CID_MINIMO_CASOS = 5;
