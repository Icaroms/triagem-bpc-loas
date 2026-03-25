/**
 * ============================================================================
 * COMPONENTE: TabCID
 * ============================================================================
 * Base de dados CID-10 com CRUD completo (adicionar, editar, excluir).
 * Trava de mínimo 5 casos para consistência estatística.
 * Badge "PREFERIR JUDICIAL" para CIDs com taxa < 25%.
 */
import { useState } from 'react';
import {
  Search, Trash2, Edit3, PlusCircle,
  CheckCircle, XCircle, AlertTriangle,
} from 'lucide-react';
import { CID_MINIMO_CASOS } from '../constants';
import { sCard, sInput, sLabel, sBtn } from '../styles/shared';

export default function TabCID({ theme: t, cidDb, setCidDb }) {
  const [search, setSearch] = useState('');
  const [editCode, setEditCode] = useState(null);
  const [editForm, setEditForm] = useState({ code: '', name: '', approved: 0, denied: 0 });
  const [addMode, setAddMode] = useState(false);
  const [newCid, setNewCid] = useState({ code: '', name: '', approved: '', denied: '' });

  // Filtro por código ou nome
  const filtered = cidDb.filter((c) => {
    const s = search.toLowerCase();
    return !s || c.code.toLowerCase().includes(s) || c.name.toLowerCase().includes(s);
  });

  return (
    <div>
      {/* Barra de busca e botão adicionar */}
      <div style={{ ...sCard(t), display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 200 }}>
          <Search size={18} style={{ color: t.textMuted }} />
          <input style={{ ...sInput(t), maxWidth: 350 }} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar CID por código ou nome..." />
        </div>
        <button style={sBtn(t.accent)} onClick={() => { setAddMode(true); setNewCid({ code: '', name: '', approved: '', denied: '' }); }}>
          <PlusCircle size={16} /> ADICIONAR CID
        </button>
      </div>

      {/* Formulário de adição */}
      {addMode && (
        <div style={{ ...sCard(t), borderLeft: '4px solid ' + t.accent }}>
          <h3 style={{ margin: '0 0 12px', color: t.accent, fontSize: 15 }}>NOVO CID-10</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', gap: 12 }}>
            <div><label style={sLabel(t)}>CÓDIGO</label><input style={sInput(t)} value={newCid.code} onChange={(e) => setNewCid((p) => ({ ...p, code: e.target.value.toUpperCase() }))} /></div>
            <div><label style={sLabel(t)}>DESCRIÇÃO</label><input style={sInput(t)} value={newCid.name} onChange={(e) => setNewCid((p) => ({ ...p, name: e.target.value }))} /></div>
            <div><label style={sLabel(t)}>DEFERIDOS</label><input style={sInput(t)} type="number" value={newCid.approved} onChange={(e) => setNewCid((p) => ({ ...p, approved: e.target.value }))} /></div>
            <div><label style={sLabel(t)}>INDEFERIDOS</label><input style={sInput(t)} type="number" value={newCid.denied} onChange={(e) => setNewCid((p) => ({ ...p, denied: e.target.value }))} /></div>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button style={sBtn(t.accent)} onClick={() => {
              const a = Number(newCid.approved), dn = Number(newCid.denied);
              if (!newCid.code || !newCid.name || isNaN(a) || isNaN(dn)) return alert('Preencha todos os campos.');
              if (a + dn < CID_MINIMO_CASOS) return alert(`Mínimo de ${CID_MINIMO_CASOS} casos para consistência estatística.`);
              if (cidDb.find((c) => c.code === newCid.code)) return alert('CID já cadastrado.');
              setCidDb((db) => [...db, { code: newCid.code, name: newCid.name, approved: a, denied: dn, total: a + dn }]);
              setAddMode(false);
            }}><CheckCircle size={14} /> SALVAR</button>
            <button style={sBtn(t.textMuted, true)} onClick={() => setAddMode(false)}><XCircle size={14} /> CANCELAR</button>
          </div>
          <div style={{ fontSize: 11, color: t.warning, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <AlertTriangle size={12} /> CIDs com menos de {CID_MINIMO_CASOS} casos não são aceitos (ex.: 1/1 = 100% — distorção).
          </div>
        </div>
      )}

      {/* Info */}
      <div style={{ fontSize: 11, color: t.textMuted, padding: '4px 8px', marginBottom: 8 }}>
        {cidDb.length} CIDs cadastrados · Taxas de deferimento ADMINISTRATIVO · Taxas judiciais tendem a ser maiores
      </div>

      {/* Lista de CIDs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filtered.map((c) => {
          const rate = c.total >= CID_MINIMO_CASOS ? (c.approved / c.total * 100) : null;
          const rateColor = rate !== null ? (rate >= 60 ? t.success : rate >= 35 ? t.warning : t.danger) : t.textMuted;
          const isEditing = editCode === c.code;

          return (
            <div key={c.code} style={{ ...sCard(t), padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
              {!isEditing ? (
                <>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: t.text }}>
                      <span style={{ color: t.accent }}>{c.code}</span> — {c.name}
                      {rate !== null && rate < 25 && (
                        <span style={{ marginLeft: 8, fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#7c3aed18', color: '#7c3aed', fontWeight: 700 }}>PREFERIR JUDICIAL</span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: t.textMuted }}>{c.approved} deferidos · {c.denied} indeferidos · {c.total} casos</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ textAlign: 'center', minWidth: 70 }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: rateColor }}>{rate !== null ? rate.toFixed(0) + '%' : 'N/D'}</div>
                      <div style={{ fontSize: 10, color: t.textMuted }}>Tx. Admin.</div>
                    </div>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textMuted, padding: 4 }} onClick={() => { setEditCode(c.code); setEditForm({ code: c.code, name: c.name, approved: c.approved, denied: c.denied }); }}>
                      <Edit3 size={16} />
                    </button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.danger, padding: 4 }} onClick={() => { if (confirm('Excluir ' + c.code + '?')) setCidDb((db) => db.filter((x) => x.code !== c.code)); }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <div><label style={sLabel(t)}>CÓDIGO</label><input style={sInput(t)} value={editForm.code} disabled /></div>
                    <div><label style={sLabel(t)}>NOME</label><input style={sInput(t)} value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} /></div>
                    <div><label style={sLabel(t)}>DEFERIDOS</label><input style={sInput(t)} type="number" value={editForm.approved} onChange={(e) => setEditForm((p) => ({ ...p, approved: Number(e.target.value) }))} /></div>
                    <div><label style={sLabel(t)}>INDEFERIDOS</label><input style={sInput(t)} type="number" value={editForm.denied} onChange={(e) => setEditForm((p) => ({ ...p, denied: Number(e.target.value) }))} /></div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={sBtn(t.accent)} onClick={() => {
                      const tot = editForm.approved + editForm.denied;
                      if (tot < CID_MINIMO_CASOS) return alert(`Mínimo de ${CID_MINIMO_CASOS} casos.`);
                      setCidDb((db) => db.map((x) => x.code === editForm.code ? { ...x, name: editForm.name, approved: editForm.approved, denied: editForm.denied, total: tot } : x));
                      setEditCode(null);
                    }}><CheckCircle size={14} /> SALVAR</button>
                    <button style={sBtn(t.textMuted, true)} onClick={() => setEditCode(null)}><XCircle size={14} /> CANCELAR</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
