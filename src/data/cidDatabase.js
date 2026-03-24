/**
 * ============================================================================
 * BASE DE DADOS CID-10 — TAXAS DE DEFERIMENTO ADMINISTRATIVO
 * ============================================================================
 * CIDs mais frequentes no escritório. Taxas judiciais tendem a ser maiores.
 *
 * REGRA: CIDs com menos de 5 casos (CID_MINIMO_CASOS) não são aceitos
 * para evitar distorções (ex.: 1/1 caso = 100% artificial).
 *
 * Campos:
 *   code     — Código CID-10
 *   name     — Descrição da condição
 *   approved — Casos deferidos administrativamente
 *   denied   — Casos indeferidos administrativamente
 *   total    — Total analisado (approved + denied)
 */
export const CID_DATABASE_INITIAL = [
  // --- NEURODESENVOLVIMENTO (mais frequentes no escritório) ---
  { code: 'F84.0', name: 'Autismo infantil', approved: 72, denied: 11, total: 83 },
  { code: 'F84.1', name: 'Autismo atípico', approved: 18, denied: 7, total: 25 },
  { code: 'F84.5', name: 'Síndrome de Asperger', approved: 9, denied: 8, total: 17 },
  { code: 'Q90',   name: 'Síndrome de Down', approved: 38, denied: 3, total: 41 },
  { code: 'F71',   name: 'Deficiência intelectual moderada', approved: 40, denied: 6, total: 46 },
  { code: 'F72',   name: 'Deficiência intelectual grave', approved: 28, denied: 2, total: 30 },

  // --- TRANSTORNOS MENTAIS ---
  { code: 'F20', name: 'Esquizofrenia', approved: 34, denied: 9, total: 43 },
  { code: 'F31', name: 'Transtorno afetivo bipolar', approved: 11, denied: 21, total: 32 },
  { code: 'F32', name: 'Episódios depressivos', approved: 7, denied: 29, total: 36 },
  { code: 'F33', name: 'Transtorno depressivo recorrente', approved: 9, denied: 25, total: 34 },
  { code: 'F41', name: 'Outros transtornos ansiosos', approved: 4, denied: 28, total: 32 },

  // --- SISTEMA NERVOSO ---
  { code: 'G40', name: 'Epilepsia', approved: 18, denied: 16, total: 34 },
  { code: 'G80', name: 'Paralisia cerebral', approved: 31, denied: 3, total: 34 },
  { code: 'G35', name: 'Esclerose múltipla', approved: 22, denied: 5, total: 27 },
  { code: 'G12', name: 'Atrofia muscular espinal', approved: 17, denied: 2, total: 19 },
  { code: 'G56', name: 'Síndrome do túnel do carpo', approved: 5, denied: 19, total: 24 },

  // --- OLHOS E OUVIDOS ---
  { code: 'H54', name: 'Cegueira e visão subnormal', approved: 25, denied: 7, total: 32 },
  { code: 'H90', name: 'Perda de audição bilateral', approved: 19, denied: 10, total: 29 },

  // --- OSTEOMUSCULAR (coluna e articulações — frequentes por fábricas) ---
  { code: 'M54', name: 'Dorsalgia (dor na coluna)', approved: 6, denied: 31, total: 37 },
  { code: 'M51', name: 'Hérnia de disco intervertebral', approved: 10, denied: 22, total: 32 },
  { code: 'M47', name: 'Espondilose (artrose da coluna)', approved: 8, denied: 20, total: 28 },
  { code: 'M19', name: 'Artrose não especificada', approved: 7, denied: 18, total: 25 },
  { code: 'M16', name: 'Coxartrose (artrose do quadril)', approved: 11, denied: 14, total: 25 },
  { code: 'M65', name: 'Sinovite e tenossinovite (mãos/punho)', approved: 4, denied: 17, total: 21 },
  { code: 'M75', name: 'Lesões do ombro', approved: 5, denied: 16, total: 21 },

  // --- ENDÓCRINAS / CARDIOVASCULARES / NEOPLASIAS ---
  { code: 'E11', name: 'Diabetes mellitus tipo 2', approved: 5, denied: 27, total: 32 },
  { code: 'E10', name: 'Diabetes mellitus tipo 1', approved: 12, denied: 14, total: 26 },
  { code: 'I10', name: 'Hipertensão essencial (primária)', approved: 3, denied: 30, total: 33 },
  { code: 'C50', name: 'Neoplasia maligna da mama', approved: 17, denied: 12, total: 29 },
];
