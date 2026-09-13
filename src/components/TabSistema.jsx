/**
 * ============================================================================
 * COMPONENTE: TabSistema
 * ============================================================================
 * Área administrativa. Restrita ao perfil "admin".
 *
 * Três seções:
 *   1. Usuários     — cadastro, ativação e remoção
 *   2. Auditoria    — quem fez o quê e quando
 *   3. Conformidade — bases legais e medidas adotadas (LGPD)
 */

import { useState } from 'react';
import {
  Users, ScrollText, ShieldCheck, PlusCircle, Trash2,
  CheckCircle, XCircle, Download, AlertTriangle, KeyRound,
} from 'lucide-react';
import {
  listUsers, createUser, deleteUser, setUserActive,
  changePassword, ROLES, SESSION_TIMEOUT_MS,
} from '../utils/auth';
import { getAuditLog, clearAuditLog, exportAuditCSV, logAction } from '../utils/audit';
import { evaluatePasswordStrength } from '../utils/crypto';
import { sCard, sInput, sLabel, sBtn } from '../styles/shared';

export default function TabSistema({ theme: t, session }) {
  const [section, setSection] = useState('usuarios');
  const [users, setUsers] = useState(() => listUsers());
  const [log, setLog] = useState(() => getAuditLog());
  const [addMode, setAddMode] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', name: '', role: 'atendente', password: '' });
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [feedback, setFeedback] = useState(null);

  const notify = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 5000);
  };

  const refresh = () => {
    setUsers(listUsers());
    setLog(getAuditLog());
  };

  /** Cadastra um novo usuário */
  const handleCreate = async () => {
    const result = await createUser(newUser);
    if (!result.ok) return notify('error', result.error);

    logAction('USER_CREATE', { username: session.username, ref: newUser.username });
    setAddMode(false);
    setNewUser({ username: '', name: '', role: 'atendente', password: '' });
    refresh();
    notify('success', 'Usuário cadastrado.');
  };

  /** Altera a própria senha */
  const handleChangePassword = async () => {
    if (pwForm.next !== pwForm.confirm) return notify('error', 'As senhas não conferem.');

    const result = await changePassword(session.userId, pwForm.current, pwForm.next);
    if (!result.ok) return notify('error', result.error);

    logAction('PASSWORD_CHANGE', { username: session.username });
    setPwForm({ current: '', next: '', confirm: '' });
    notify('success', 'Senha alterada com sucesso.');
  };

  const strength = newUser.password ? evaluatePasswordStrength(newUser.password) : null;

  const tabBtn = (id, icon, text) => (
    <button
      onClick={() => setSection(id)}
      style={{
        padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
        fontWeight: 700, fontSize: 13,
        background: section === id ? t.accent : 'transparent',
        color: section === id ? '#fff' : t.textMuted,
        display: 'inline-flex', alignItems: 'center', gap: 6,
      }}
    >
      {icon} {text}
    </button>
  );

  return (
    <div>
      {/* Navegação interna */}
      <div style={{
        ...sCard(t), padding: 10, display: 'flex',
        gap: 6, flexWrap: 'wrap', marginBottom: 12,
      }}>
        {tabBtn('usuarios', <Users size={15} />, 'USUÁRIOS')}
        {tabBtn('auditoria', <ScrollText size={15} />, 'AUDITORIA')}
        {tabBtn('lgpd', <ShieldCheck size={15} />, 'CONFORMIDADE')}
      </div>

      {/* Retorno das ações */}
      {feedback && (
        <div style={{
          ...sCard(t), padding: 12, marginBottom: 12,
          border: `1px solid ${feedback.type === 'success' ? t.success : t.danger}`,
          fontSize: 13, color: feedback.type === 'success' ? t.success : t.danger,
        }}>
          {feedback.text}
        </div>
      )}

      {/* ================= USUÁRIOS ================= */}
      {section === 'usuarios' && (
        <>
          <div style={{
            ...sCard(t), padding: 16, display: 'flex',
            justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
          }}>
            <div style={{ fontSize: 13, color: t.textMuted }}>
              {users.length} usuário(s) · sessão expira após {SESSION_TIMEOUT_MS / 60000} min de inatividade
            </div>
            <button style={sBtn(t.accent)} onClick={() => setAddMode(true)}>
              <PlusCircle size={16} /> NOVO USUÁRIO
            </button>
          </div>

          {/* Formulário de cadastro */}
          {addMode && (
            <div style={{ ...sCard(t), borderLeft: `4px solid ${t.accent}` }}>
              <h3 style={{ margin: '0 0 14px', color: t.accent, fontSize: 15 }}>NOVO USUÁRIO</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={sLabel(t)}>NOME COMPLETO</label>
                  <input
                    style={sInput(t)}
                    value={newUser.name}
                    onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={sLabel(t)}>USUÁRIO</label>
                  <input
                    style={sInput(t)}
                    value={newUser.username}
                    onChange={(e) => setNewUser((p) => ({
                      ...p, username: e.target.value.replace(/\s/g, '').toLowerCase(),
                    }))}
                    placeholder="nome.sobrenome"
                  />
                </div>
                <div>
                  <label style={sLabel(t)}>PERFIL</label>
                  <select
                    style={sInput(t)}
                    value={newUser.role}
                    onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value }))}
                  >
                    {Object.entries(ROLES).map(([key, r]) => (
                      <option key={key} value={key}>{r.label}</option>
                    ))}
                  </select>
                  <div style={{ fontSize: 11, color: t.textMuted, marginTop: 3 }}>
                    {ROLES[newUser.role].description}
                  </div>
                </div>
                <div>
                  <label style={sLabel(t)}>SENHA</label>
                  <input
                    style={sInput(t)}
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))}
                  />
                  {strength && (
                    <div style={{
                      fontSize: 11, marginTop: 3,
                      color: strength.level === 'forte' ? t.success
                        : strength.level === 'média' ? t.warning : t.danger,
                    }}>
                      Senha {strength.level}
                      {strength.issues.length > 0 && ` — ${strength.issues[0]}`}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                <button style={sBtn(t.accent)} onClick={handleCreate}>
                  <CheckCircle size={14} /> SALVAR
                </button>
                <button style={sBtn(t.textMuted, true)} onClick={() => setAddMode(false)}>
                  <XCircle size={14} /> CANCELAR
                </button>
              </div>
            </div>
          )}

          {/* Lista de usuários */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
            {users.map((u) => (
              <div key={u.id} style={{
                ...sCard(t), padding: 14, marginBottom: 0,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                opacity: u.active ? 1 : 0.55,
              }}>
                <div>
                  <div style={{ fontWeight: 700, color: t.text, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {u.name}
                    <span style={{
                      fontSize: 10, padding: '2px 8px', borderRadius: 6, fontWeight: 700,
                      background: u.role === 'admin' ? '#7c3aed22' : t.cardAlt,
                      color: u.role === 'admin' ? '#7c3aed' : t.textMuted,
                    }}>
                      {ROLES[u.role].label.toUpperCase()}
                    </span>
                    {!u.active && (
                      <span style={{ fontSize: 10, color: t.danger, fontWeight: 700 }}>DESATIVADO</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>
                    @{u.username}
                    {u.lastLogin && ` · último acesso ${new Date(u.lastLogin).toLocaleString('pt-BR')}`}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: u.active ? t.warning : t.success, padding: 4 }}
                    title={u.active ? 'Desativar' : 'Reativar'}
                    onClick={() => {
                      const r = setUserActive(u.id, !u.active);
                      if (!r.ok) return notify('error', r.error);
                      logAction('USER_UPDATE', { username: session.username, ref: u.username });
                      refresh();
                    }}
                  >
                    {u.active ? <XCircle size={16} /> : <CheckCircle size={16} />}
                  </button>
                  <button
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.danger, padding: 4 }}
                    title="Excluir"
                    onClick={() => {
                      if (!confirm(`Excluir o usuário ${u.name}?`)) return;
                      const r = deleteUser(u.id);
                      if (!r.ok) return notify('error', r.error);
                      logAction('USER_DELETE', { username: session.username, ref: u.username });
                      refresh();
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Alterar a própria senha */}
          <div style={sCard(t)}>
            <h3 style={{ margin: '0 0 14px', fontSize: 15, color: t.text, display: 'flex', alignItems: 'center', gap: 8 }}>
              <KeyRound size={17} style={{ color: t.accent }} /> ALTERAR MINHA SENHA
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <label style={sLabel(t)}>SENHA ATUAL</label>
                <input style={sInput(t)} type="password" value={pwForm.current}
                  onChange={(e) => setPwForm((p) => ({ ...p, current: e.target.value }))} />
              </div>
              <div>
                <label style={sLabel(t)}>NOVA SENHA</label>
                <input style={sInput(t)} type="password" value={pwForm.next}
                  onChange={(e) => setPwForm((p) => ({ ...p, next: e.target.value }))} />
              </div>
              <div>
                <label style={sLabel(t)}>CONFIRMAR</label>
                <input style={sInput(t)} type="password" value={pwForm.confirm}
                  onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))} />
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <button style={sBtn(t.accent)} onClick={handleChangePassword}>
                <CheckCircle size={14} /> ALTERAR SENHA
              </button>
            </div>
          </div>
        </>
      )}

      {/* ================= AUDITORIA ================= */}
      {section === 'auditoria' && (
        <>
          <div style={{
            ...sCard(t), padding: 16, display: 'flex',
            justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
          }}>
            <div style={{ fontSize: 13, color: t.textMuted }}>
              {log.length} evento(s) · o log não armazena dados pessoais
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={sBtn(t.accent, true)} onClick={exportAuditCSV}>
                <Download size={16} /> EXPORTAR CSV
              </button>
              <button
                style={sBtn(t.danger, true)}
                onClick={() => {
                  if (!confirm('Limpar o log de auditoria?')) return;
                  clearAuditLog();
                  logAction('USER_UPDATE', { username: session.username, note: 'Log de auditoria limpo' });
                  refresh();
                }}
              >
                <Trash2 size={16} /> LIMPAR
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {log.length === 0 && (
              <div style={{ ...sCard(t), textAlign: 'center', color: t.textMuted }}>
                Nenhum evento registrado.
              </div>
            )}
            {log.slice(0, 100).map((e) => {
              const isAlert = e.action === 'LOGIN_FAILED' || e.action.includes('DELETE') || e.action === 'DATA_CLEAR';
              return (
                <div key={e.id} style={{
                  ...sCard(t), padding: '10px 14px', marginBottom: 0,
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', gap: 12,
                  borderLeft: `3px solid ${isAlert ? t.danger : t.border}`,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: t.text, fontWeight: 600 }}>
                      {e.label}
                      {e.ref && <span style={{ color: t.textMuted, fontWeight: 400 }}> · {e.ref}</span>}
                    </div>
                    {e.note && (
                      <div style={{ fontSize: 11, color: t.textMuted, marginTop: 1 }}>{e.note}</div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: 12, color: t.text }}>@{e.username}</div>
                    <div style={{ fontSize: 11, color: t.textMuted }}>
                      {new Date(e.at).toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>
              );
            })}
            {log.length > 100 && (
              <div style={{ textAlign: 'center', fontSize: 12, color: t.textMuted, padding: 8 }}>
                Exibindo 100 de {log.length} eventos. Exporte o CSV para ver o histórico completo.
              </div>
            )}
          </div>
        </>
      )}

      {/* ================= CONFORMIDADE LGPD ================= */}
      {section === 'lgpd' && (
        <>
          <div style={sCard(t)}>
            <h3 style={{ margin: '0 0 6px', fontSize: 16, color: t.text, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={18} style={{ color: t.accent }} /> TRATAMENTO DE DADOS PESSOAIS
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: t.textMuted, lineHeight: 1.6 }}>
              O sistema trata dados pessoais e dados pessoais sensíveis de saúde
              (CID-10), enquadrados no Art. 5º, II da Lei nº 13.709/2018.
            </p>

            <div style={{ display: 'grid', gap: 10 }}>
              {[
                {
                  titulo: 'Base legal',
                  texto: 'Art. 11, II, "a" e "d" — tratamento necessário ao cumprimento de obrigação legal e ao exercício regular de direitos em processo administrativo e judicial.',
                },
                {
                  titulo: 'Finalidade',
                  texto: 'Avaliar a viabilidade do requerimento de benefício assistencial e orientar o titular sobre a via mais adequada. Nenhum uso secundário.',
                },
                {
                  titulo: 'Minimização',
                  texto: 'O CPF é gravado de forma mascarada. O log de auditoria não replica nome, CPF ou CID — registra apenas identificador interno e ação.',
                },
                {
                  titulo: 'Segurança',
                  texto: 'Acesso restrito por autenticação com PBKDF2 e salt individual, perfis de permissão, bloqueio após 5 tentativas e encerramento automático de sessão.',
                },
                {
                  titulo: 'Rastreabilidade',
                  texto: 'Todas as operações sobre a base de atendimentos ficam registradas em log com autor e data (Art. 6º, X — responsabilização).',
                },
                {
                  titulo: 'Eliminação',
                  texto: 'O titular pode ter seu registro excluído individualmente pelo histórico, ou a base inteira pode ser eliminada (Art. 18, VI).',
                },
              ].map((item, i) => (
                <div key={i} style={{ padding: 14, background: t.cardAlt, borderRadius: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 4 }}>
                    {item.titulo}
                  </div>
                  <div style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.55 }}>
                    {item.texto}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Limitações reconhecidas — honestidade técnica */}
          <div style={{ ...sCard(t), border: `1px dashed ${t.warning}` }}>
            <h3 style={{
              margin: '0 0 10px', fontSize: 15, color: t.warning,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <AlertTriangle size={17} /> LIMITAÇÕES DESTA VERSÃO
            </h3>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: t.textMuted, lineHeight: 1.7 }}>
              <li>A autenticação é validada no navegador. Não protege contra quem tenha acesso ao console de desenvolvedor da máquina.</li>
              <li>Os dados residem no armazenamento local do navegador, sem criptografia em repouso e sem sincronização entre estações.</li>
              <li>Não há registro formal de consentimento assinado pelo titular dentro do sistema.</li>
              <li>Backups exportados em JSON saem sem cifragem e devem ser guardados em local controlado.</li>
            </ul>
            <p style={{ margin: '12px 0 0', fontSize: 12, color: t.textMuted, lineHeight: 1.6 }}>
              A superação dessas limitações depende de backend com banco de dados,
              autenticação server-side e criptografia em repouso — previstos nas
              melhorias futuras do projeto.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
