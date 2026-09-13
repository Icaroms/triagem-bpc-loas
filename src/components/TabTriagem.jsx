/**
 * ============================================================================
 * COMPONENTE: TabTriagem
 * ============================================================================
 * Aba principal — formulário de triagem com scoring e feedback.
 * Detecta automaticamente BPC 87/88 pela data de nascimento.
 * Bloqueia campos de CID e laudo para BPC 88 (Idoso).
 *
 * MINIMIZAÇÃO DE DADOS (LGPD, Art. 6º, III): o CPF é usado apenas para
 * conferência durante o atendimento e gravado de forma MASCARADA. O número
 * completo permanece nos autos e no contrato, não nesta base.
 */
import { useState } from 'react';
import {
  CheckCircle, XCircle, AlertTriangle, RotateCcw,
  PlusCircle, Shield, Calendar, FileText, Printer, Info,
} from 'lucide-react';
import { LIMITE_RENDA, SALARIO_MINIMO } from '../constants';
import {
  calcAge, detectBpcType, cadunicoStatus,
  formatCPF, maskCPF, formatMoney,
  calcScore, getScoreColor, generateFeedback, handlePrint,
} from '../utils';
import { logAction } from '../utils/audit';
import {
  sCard, sInput, sDisabled, sLabel, sBtn,
  sError, sBadge, sInfoTag,
} from '../styles/shared';

export default function TabTriagem({ dark, theme: t, cidDb, setHistory, session }) {
  const [form, setForm] = useState({
    name: '', cpf: '', birthDate: '', renda: '',
    cadunicoDate: '', laudo: 'atualizado', cid: cidDb[0]?.code || 'F84.0', obs: '',
  });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});

  const formAge = form.birthDate ? calcAge(form.birthDate) : null;
  const formBpcType = formAge !== null ? (formAge >= 65 ? 'BPC88' : 'BPC87') : null;
  const formCadunico = cadunicoStatus(form.cadunicoDate);
  const isBpc88 = formBpcType === 'BPC88';

  const validateName = (v) => /^[A-Za-zÀ-ÿ\s'.]+$/.test(v);

  const handleChange = (field, val) => {
    if (field === 'name') val = val.replace(/[^A-Za-zÀ-ÿ\s'.]/g, '').toUpperCase();
    if (field === 'cpf') val = formatCPF(val);
    if (field === 'renda') val = val.replace(/[^\d.,]/g, '');
    setForm((f) => ({ ...f, [field]: val }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const handleSubmit = () => {
    const errs = {};
    if (!form.name.trim() || !validateName(form.name)) errs.name = 'Nome inválido (somente letras)';
    if (form.cpf.replace(/\D/g, '').length !== 11) errs.cpf = 'CPF deve ter 11 dígitos';
    if (!form.birthDate) errs.birthDate = 'Data de nascimento obrigatória';
    else if (formAge < 0 || formAge > 120) errs.birthDate = 'Data inválida';
    const rendaNum = Number(String(form.renda).replace(',', '.'));
    if (isNaN(rendaNum) || rendaNum < 0) errs.renda = 'Renda inválida';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const tipoBpc = detectBpcType(form.birthDate);
    const idade = calcAge(form.birthDate);
    const cadSt = cadunicoStatus(form.cadunicoDate);
    const isBpc88Now = tipoBpc === 'BPC88';
    const finalLaudo = isBpc88Now ? 'N/A' : form.laudo;
    const finalCid = isBpc88Now ? 'N/A' : form.cid;
    const score = calcScore(rendaNum, cadSt, finalLaudo, tipoBpc, idade, finalCid, cidDb);
    const feedback = generateFeedback(score, rendaNum, cadSt, finalLaudo, tipoBpc, idade, finalCid, cidDb);
    const now = new Date();
    const id = Date.now();

    const entry = {
      id,
      name: form.name.trim().replace(/\s+/g, ' '),
      // Minimização: grava apenas a forma mascarada
      cpf: maskCPF(form.cpf),
      tipoBpc, birthDate: form.birthDate, idade, renda: rendaNum,
      cadunicoDate: form.cadunicoDate, cadunicoStatus: cadSt.status,
      laudo: finalLaudo, cid: finalCid, score,
      date: now.toISOString().split('T')[0],
      time: String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0'),
      obs: form.obs,
      // Rastreabilidade: quem realizou o atendimento
      atendente: session?.username || null,
    };

    setResult({ ...entry, feedback });
    setHistory((h) => [entry, ...h]);
    logAction('TRIAGEM_CREATE', { username: session?.username, ref: `#${id}` });
  };

  const clear = () => {
    setForm({ name: '', cpf: '', birthDate: '', renda: '', cadunicoDate: '', laudo: 'atualizado', cid: cidDb[0]?.code || 'F84.0', obs: '' });
    setResult(null);
    setErrors({});
  };

  // --- Formulário ---
  if (!result) {
    return (
      <div style={sCard(t)}>
        <h2 style={{ margin: '0 0 6px', color: t.text, fontSize: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={22} style={{ color: t.accent }} /> NOVA TRIAGEM DE BENEFÍCIO
        </h2>

        {/* Aviso de tratamento de dados */}
        <div style={{
          display: 'flex', gap: 8, padding: 11, marginBottom: 18,
          background: t.cardAlt, borderRadius: 9, fontSize: 12,
          color: t.textMuted, lineHeight: 1.5,
        }}>
          <Info size={15} style={{ color: t.accent, flexShrink: 0, marginTop: 1 }} />
          <span>
            Informe ao titular que os dados serão usados apenas para avaliar a
            viabilidade do benefício. O CPF é gravado de forma mascarada e o
            atendimento fica registrado em log de auditoria.
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={sLabel(t)}>NOME COMPLETO *</label>
            <input style={{ ...sInput(t), borderColor: errors.name ? t.danger : t.inputBorder }} value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="EX.: MARIA DA SILVA SANTOS" />
            {errors.name && <div style={sError(t)}>{errors.name}</div>}
          </div>
          <div>
            <label style={sLabel(t)}>CPF *</label>
            <input style={{ ...sInput(t), borderColor: errors.cpf ? t.danger : t.inputBorder }} value={form.cpf} onChange={(e) => handleChange('cpf', e.target.value)} placeholder="000.000.000-00" />
            {errors.cpf && <div style={sError(t)}>{errors.cpf}</div>}
            <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>
              Será gravado mascarado: {form.cpf.replace(/\D/g, '').length === 11 ? maskCPF(form.cpf) : '000.***.***-00'}
            </div>
          </div>
          <div>
            <label style={sLabel(t)}>DATA DE NASCIMENTO *</label>
            <input type="date" style={{ ...sInput(t), borderColor: errors.birthDate ? t.danger : t.inputBorder }} value={form.birthDate} onChange={(e) => handleChange('birthDate', e.target.value)} />
            {errors.birthDate && <div style={sError(t)}>{errors.birthDate}</div>}
            {formAge !== null && formAge >= 0 && (
              <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={sInfoTag(t.accent)}><Calendar size={12} /> {formAge} ANOS</span>
                <span style={sInfoTag(isBpc88 ? '#6366f1' : '#f59e0b')}>
                  {isBpc88 ? 'BPC 88 — IDOSO (≥65)' : 'BPC 87 — PESSOA COM DEFICIÊNCIA'}
                </span>
              </div>
            )}
          </div>
          <div>
            <label style={sLabel(t)}>RENDA PER CAPITA (R$) *</label>
            <input style={{ ...sInput(t), borderColor: errors.renda ? t.danger : t.inputBorder }} value={form.renda} onChange={(e) => handleChange('renda', e.target.value)} placeholder={'Limite: ' + formatMoney(LIMITE_RENDA)} />
            {errors.renda && <div style={sError(t)}>{errors.renda}</div>}
            <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>
              Máximo: ¼ do salário mínimo (R$ {SALARIO_MINIMO.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) = {formatMoney(LIMITE_RENDA)}
            </div>
          </div>
          <div>
            <label style={sLabel(t)}>ÚLTIMA ATUALIZAÇÃO DO CADÚNICO</label>
            <input type="date" style={sInput(t)} value={form.cadunicoDate} onChange={(e) => handleChange('cadunicoDate', e.target.value)} />
            {form.cadunicoDate && (
              <div style={{ marginTop: 6 }}>
                <span style={sInfoTag(formCadunico.status === 'ok' ? t.success : formCadunico.status === 'proximo' ? t.warning : t.danger)}>
                  {formCadunico.status === 'ok' ? <CheckCircle size={12} /> : formCadunico.status === 'proximo' ? <AlertTriangle size={12} /> : <XCircle size={12} />}
                  {formCadunico.msg}
                </span>
              </div>
            )}
            {!form.cadunicoDate && <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>Validade: 2 anos a partir da última atualização</div>}
          </div>
          <div>
            <label style={sLabel(t)}>SITUAÇÃO DO LAUDO MÉDICO {isBpc88 && <span style={{ color: t.textMuted, fontWeight: 400 }}>(N/A para Idoso)</span>}</label>
            <select style={isBpc88 ? sDisabled(t) : sInput(t)} value={isBpc88 ? 'N/A' : form.laudo} onChange={(e) => handleChange('laudo', e.target.value)} disabled={isBpc88}>
              {isBpc88 ? <option value="N/A">Não aplicável ao BPC Idoso</option> : <>
                <option value="atualizado">Atualizado (últimos 6 meses)</option>
                <option value="detalhado">Detalhado (com informações completas)</option>
                <option value="desatualizado">Desatualizado ou Incompleto</option>
              </>}
            </select>
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={sLabel(t)}>CID-10 PRINCIPAL {isBpc88 && <span style={{ color: t.textMuted, fontWeight: 400 }}>(N/A para Idoso)</span>}</label>
            <select style={isBpc88 ? sDisabled(t) : sInput(t)} value={isBpc88 ? 'N/A' : form.cid} onChange={(e) => handleChange('cid', e.target.value)} disabled={isBpc88}>
              {isBpc88 ? <option value="N/A">Não aplicável ao BPC Idoso</option> :
                cidDb.map((c) => {
                  const rate = c.total >= 5 ? (c.approved / c.total * 100).toFixed(0) + '%' : 'N/D';
                  return <option key={c.code} value={c.code}>{c.code} — {c.name} (Tx. Adm: {rate})</option>;
                })
              }
            </select>
          </div>
          {formBpcType === 'BPC87' && (
            <div style={{ gridColumn: '1/-1', padding: 12, background: t.cardAlt, borderRadius: 10, border: '1px dashed ' + t.warning }}>
              <div style={{ fontSize: 13, color: t.warning, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={14} /> BPC 87 (PCD): O laudo médico é peça fundamental. Deve descrever detalhadamente a limitação funcional.
              </div>
            </div>
          )}
          {isBpc88 && (
            <div style={{ gridColumn: '1/-1', padding: 12, background: t.cardAlt, borderRadius: 10, border: '1px dashed #6366f1' }}>
              <div style={{ fontSize: 13, color: '#6366f1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                BPC 88 (IDOSO): Análise baseada em miserabilidade (renda) e idade. CID e laudo não são necessários.
              </div>
            </div>
          )}
          <div style={{ gridColumn: '1/-1' }}>
            <label style={sLabel(t)}>OBSERVAÇÕES</label>
            <textarea style={{ ...sInput(t), minHeight: 60, resize: 'vertical' }} value={form.obs} onChange={(e) => handleChange('obs', e.target.value)} placeholder="Observações opcionais sobre o caso..." />
          </div>
        </div>
        <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
          <button style={sBtn(t.accent)} onClick={handleSubmit}><CheckCircle size={16} /> REALIZAR TRIAGEM</button>
          <button style={sBtn(t.textMuted, true)} onClick={clear}><RotateCcw size={16} /> LIMPAR</button>
        </div>
      </div>
    );
  }

  // --- Resultado ---
  const sc = getScoreColor(result.score);
  return (
    <div id="print-area">
      <div style={{ ...sCard(t), borderLeft: '5px solid ' + sc.bg }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ margin: '0 0 4px', color: t.text, fontSize: 20 }}>{result.name}</h2>
            <div style={{ color: t.textMuted, fontSize: 14 }}>
              CPF: {result.cpf} · {result.tipoBpc === 'BPC88' ? 'BPC 88 — IDOSO' : 'BPC 87 — PCD'} · {result.idade} ANOS
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 42, fontWeight: 800, color: sc.bg }}>{result.score}</div>
            <div style={sBadge(sc.bg)}>{sc.emoji} {sc.label}</div>
          </div>
        </div>
        <div style={{ marginTop: 16, padding: 16, background: t.cardAlt, borderRadius: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, fontSize: 13 }}>
            <div><span style={{ color: t.textMuted }}>Renda:</span> <strong style={{ color: result.renda > LIMITE_RENDA ? t.danger : t.success }}>{formatMoney(result.renda)}</strong></div>
            <div><span style={{ color: t.textMuted }}>CadÚnico:</span> <strong style={{ color: result.cadunicoStatus === 'vencido' ? t.danger : result.cadunicoStatus === 'proximo' ? t.warning : t.success }}>{result.cadunicoStatus === 'ok' ? 'Válido' : result.cadunicoStatus === 'proximo' ? 'Próx. Vencimento' : result.cadunicoStatus === 'vencido' ? 'Vencido' : 'Não informado'}</strong></div>
            {result.tipoBpc !== 'BPC88' && <div><span style={{ color: t.textMuted }}>Laudo:</span> <strong style={{ color: result.laudo === 'desatualizado' ? t.danger : t.text }}>{result.laudo.charAt(0).toUpperCase() + result.laudo.slice(1)}</strong></div>}
            {result.tipoBpc !== 'BPC88' && <div><span style={{ color: t.textMuted }}>CID:</span> <strong>{result.cid}</strong></div>}
            <div><span style={{ color: t.textMuted }}>Data:</span> <strong>{result.date} às {result.time}</strong></div>
            <div><span style={{ color: t.textMuted }}>Atendente:</span> <strong>@{result.atendente || '—'}</strong></div>
          </div>
        </div>
      </div>
      <div style={{ ...sCard(t), background: dark ? '#1a2332' : '#f0f9ff', border: '1px solid ' + (dark ? '#2563eb33' : '#bfdbfe') }}>
        <h3 style={{ margin: '0 0 12px', color: t.accent, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileText size={18} /> FEEDBACK E RECOMENDAÇÕES
        </h3>
        {result.feedback.map((line, i) => (
          <div key={i} style={{ padding: '8px 0', color: t.text, fontSize: 14, lineHeight: 1.6, borderBottom: i < result.feedback.length - 1 ? '1px solid ' + t.border : 'none' }}>{line}</div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12 }} data-no-print>
        <button style={sBtn(t.accent)} onClick={clear}><PlusCircle size={16} /> NOVA TRIAGEM</button>
        <button style={sBtn(t.textMuted, true)} onClick={handlePrint}><Printer size={16} /> IMPRIMIR</button>
      </div>
    </div>
  );
}
