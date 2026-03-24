/**
 * ============================================================================
 * EXPORTAÇÃO CSV
 * ============================================================================
 * Exporta dados do histórico para arquivo CSV compatível com Excel.
 * Utiliza BOM (Byte Order Mark) para garantir acentuação correta.
 */

import { getScoreColor } from './scoring';

/**
 * Gera e faz download de um arquivo CSV.
 * @param {Array} data — Array de objetos do histórico
 * @param {string} filename — Nome do arquivo de saída
 */
export function exportCSV(data, filename) {
  const headers = [
    'ID', 'Nome', 'Tipo BPC', 'Idade', 'Renda',
    'CadÚnico', 'Laudo', 'CID', 'Score', 'Viabilidade',
    'Data', 'Horário',
  ];

  const rows = data.map((r) => [
    r.id, r.name, r.tipoBpc, r.idade, r.renda,
    r.cadunicoStatus || '', r.laudo, r.cid, r.score,
    getScoreColor(r.score).label, r.date, r.time || '',
  ]);

  const csv = [headers, ...rows]
    .map((r) => r.map((c) => `"${c}"`).join(','))
    .join('\n');

  // BOM (\uFEFF) garante que o Excel abra com acentuação correta
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
