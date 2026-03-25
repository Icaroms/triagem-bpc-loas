/**
 * ============================================================================
 * COMPONENTE: TabHistorico
 * ============================================================================
 * Aba de histórico — lista de atendimentos com busca, exclusão e exportação.
 * CPF não é exibido. Badge "VIA JUDICIAL" para CIDs de baixa taxa.
 */
import { useState } from 'react';
import { Search, Trash2, Download, Clock } from 'lucide-react';
import { getScoreColor, exportCSV } from '../utils';
import { sCard, sInput, sBtn } from '../styles/shared';

export default function TabHistorico({ theme: t, history, setHistory, cidDb }) {
  const [search, setSearch] = useState('');

  // Filtra por nome, CID ou data
  const filtered = history.filter((h) => {
    const s = search.toLowerCase();
    return !s || h.name.toLowerCase().includes(s) || h.cid.toLowerCase().includes(s) || h.date.includes(s);
  });

  return (
    <div>
      {/* Barra de busca e ações */}
      <div style={{ ...sCard(t), display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 200 }}>
          <Search size={18} style={{ color: t.textMuted }} />
          <input style={{ ...sInput(t), maxWidth: 350 }} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome, CID ou data..." />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={sBtn(t.accent, true)} onClick={() => exportCSV(filtered, 'historico_triagens.csv')}><Download size={16} /> CSV</button>
          <button style={sBtn(t.danger, true)} onClick={() => { if (confirm('Excluir todo o histórico?')) setHistory([]); }}><Trash2 size={16} /> LIMPAR</button>
        </div>
      </div>

      {/* Lista de atendimentos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 && (
          <div style={{ ...sCard(t), textAlign: 'center', color: t.textMuted }}>Nenhum registro encontrado.</div>
        )}
        {filtered.slice(0, 60).map((h) => {
          const sc = getScoreColor(h.score);
          const cd = h.cid !== 'N/A' ? cidDb.find((x) => x.code === h.cid) : null;
          const isJudicial = cd && cd.total >= 5 && (cd.approved / cd.total) < 0.30;
          return (
            <div key={h.id} style={{ ...sCard(t), padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid ' + sc.bg, marginBottom: 0 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: t.text, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {h.name}
                  {isJudicial && (
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: '#7c3aed22', color: '#7c3aed', fontWeight: 700, border: '1px solid #7c3aed33' }}>
                      ⚖️ VIA JUDICIAL
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: t.textMuted, display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 2 }}>
                  <span>{h.tipoBpc === 'BPC88' ? 'IDOSO' : 'PCD'}</span><span>·</span>
                  <span>{h.idade} ANOS</span><span>·</span>
                  {h.cid !== 'N/A' && <><span>CID: {h.cid}</span><span>·</span></>}
                  <span>{h.date}</span><span>·</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={11} /> {h.time}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: sc.bg }}>{h.score}</div>
                  <div style={{ fontSize: 10, color: t.textMuted }}>{sc.label}</div>
                </div>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.danger, padding: 4 }} onClick={() => setHistory((prev) => prev.filter((x) => x.id !== h.id))}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
