/**
 * ============================================================================
 * COMPONENTE: LoginScreen
 * ============================================================================
 * Porta de entrada do sistema. Assume dois modos:
 *
 *   setup — nenhum usuário cadastrado ainda. Solicita a criação do primeiro
 *           administrador. Evita a prática insegura de embutir credenciais
 *           padrão ("admin/admin") no código-fonte.
 *
 *   login — autenticação normal.
 */

import { useState } from 'react';
import { Scale, Lock, User, ShieldCheck, AlertTriangle, Loader } from 'lucide-react';
import { authenticate, createUser, needsSetup } from '../utils/auth';
import { evaluatePasswordStrength } from '../utils/crypto';
import { logAction } from '../utils/audit';

export default function LoginScreen({ theme: t, onAuthenticated }) {
  const [mode] = useState(() => (needsSetup() ? 'setup' : 'login'));
  const [form, setForm] = useState({ username: '', password: '', name: '', confirm: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const strength = mode === 'setup' ? evaluatePasswordStrength(form.password) : null;

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setError(null);
  };

  /** Autentica um usuário existente */
  const handleLogin = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const result = await authenticate(form.username, form.password);

    if (result.ok) {
      logAction('LOGIN', { username: result.session.username });
      onAuthenticated(result.session);
    } else {
      logAction('LOGIN_FAILED', { username: form.username.trim().toLowerCase() || 'desconhecido' });
      setError(result.error);
      setBusy(false);
    }
  };

  /** Cria o primeiro administrador e já entra com ele */
  const handleSetup = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirm) {
      setError('As senhas não conferem.');
      return;
    }

    setBusy(true);
    setError(null);

    const created = await createUser({
      username: form.username,
      name: form.name,
      role: 'admin',
      password: form.password,
    });

    if (!created.ok) {
      setError(created.error);
      setBusy(false);
      return;
    }

    logAction('USER_CREATE', { username: 'sistema', note: 'Administrador inicial' });

    const result = await authenticate(form.username, form.password);
    if (result.ok) {
      logAction('LOGIN', { username: result.session.username });
      onAuthenticated(result.session);
    } else {
      setError('Usuário criado, mas houve falha ao entrar. Tente fazer login.');
      setBusy(false);
    }
  };

  // --- Estilos locais ---
  const input = {
    width: '100%', padding: '11px 14px 11px 40px', borderRadius: 10,
    border: `1.5px solid ${t.inputBorder}`, background: t.inputBg,
    color: t.text, fontSize: 14, outline: 'none', boxSizing: 'border-box',
  };
  const label = {
    fontSize: 13, fontWeight: 600, color: t.textMuted,
    marginBottom: 5, display: 'block',
  };
  const iconWrap = { position: 'relative', marginBottom: 14 };
  const iconStyle = {
    position: 'absolute', left: 13, top: '50%',
    transform: 'translateY(-50%)', color: t.textMuted, pointerEvents: 'none',
  };

  const strengthColor = strength?.level === 'forte'
    ? t.success
    : strength?.level === 'média' ? t.warning : t.danger;

  return (
    <div style={{
      minHeight: '100vh', background: t.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Identidade do sistema */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Scale size={40} style={{ color: '#fbbf24' }} />
          <div style={{ fontSize: 22, fontWeight: 800, color: t.text, marginTop: 8 }}>
            TRIAGEM BPC/LOAS
          </div>
          <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>
            Advocacia Humanizada Dr. Egberto Frazão
          </div>
        </div>

        {/* Cartão de autenticação */}
        <form
          onSubmit={mode === 'setup' ? handleSetup : handleLogin}
          style={{
            background: t.card, borderRadius: 16, padding: 28,
            boxShadow: t.shadow, border: `1px solid ${t.border}`,
          }}
        >
          <h2 style={{
            margin: '0 0 6px', fontSize: 17, color: t.text,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <ShieldCheck size={19} style={{ color: t.accent }} />
            {mode === 'setup' ? 'CONFIGURAÇÃO INICIAL' : 'ACESSO AO SISTEMA'}
          </h2>
          <p style={{ margin: '0 0 20px', fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>
            {mode === 'setup'
              ? 'Nenhum usuário cadastrado. Crie a conta do administrador para começar.'
              : 'Informe suas credenciais para continuar.'}
          </p>

          {/* Nome completo — apenas no setup */}
          {mode === 'setup' && (
            <div style={iconWrap}>
              <label style={label}>NOME COMPLETO</label>
              <User size={16} style={{ ...iconStyle, top: 'calc(50% + 9px)' }} />
              <input
                style={input}
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Seu nome"
                autoComplete="name"
              />
            </div>
          )}

          {/* Usuário */}
          <div style={iconWrap}>
            <label style={label}>USUÁRIO</label>
            <User size={16} style={{ ...iconStyle, top: 'calc(50% + 9px)' }} />
            <input
              style={input}
              value={form.username}
              onChange={(e) => set('username', e.target.value.replace(/\s/g, '').toLowerCase())}
              placeholder="nome.sobrenome"
              autoComplete="username"
            />
          </div>

          {/* Senha */}
          <div style={iconWrap}>
            <label style={label}>SENHA</label>
            <Lock size={16} style={{ ...iconStyle, top: 'calc(50% + 9px)' }} />
            <input
              style={input}
              type="password"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === 'setup' ? 'new-password' : 'current-password'}
            />
            {/* Medidor de robustez — só no cadastro */}
            {mode === 'setup' && form.password && (
              <div style={{ marginTop: 7 }}>
                <div style={{ height: 4, background: t.cardAlt, borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    width: `${strength.score}%`, height: '100%',
                    background: strengthColor, transition: 'width .2s',
                  }} />
                </div>
                <div style={{ fontSize: 11, color: strengthColor, marginTop: 4 }}>
                  Senha {strength.level}
                  {strength.issues.length > 0 && ` — ${strength.issues[0]}`}
                </div>
              </div>
            )}
          </div>

          {/* Confirmação — apenas no setup */}
          {mode === 'setup' && (
            <div style={iconWrap}>
              <label style={label}>CONFIRMAR SENHA</label>
              <Lock size={16} style={{ ...iconStyle, top: 'calc(50% + 9px)' }} />
              <input
                style={input}
                type="password"
                value={form.confirm}
                onChange={(e) => set('confirm', e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
          )}

          {/* Erro */}
          {error && (
            <div style={{
              padding: 11, marginBottom: 14, borderRadius: 9,
              background: t.cardAlt, border: `1px solid ${t.danger}`,
              fontSize: 13, color: t.danger,
              display: 'flex', alignItems: 'center', gap: 7,
            }}>
              <AlertTriangle size={15} /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            style={{
              width: '100%', padding: '12px', borderRadius: 10, border: 'none',
              background: busy ? t.textMuted : t.accent, color: '#fff',
              fontWeight: 700, fontSize: 14,
              cursor: busy ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {busy && <Loader size={16} />}
            {busy
              ? 'PROCESSANDO...'
              : mode === 'setup' ? 'CRIAR E ENTRAR' : 'ENTRAR'}
          </button>
        </form>

        {/* Aviso de tratamento de dados */}
        <p style={{
          fontSize: 11, color: t.textMuted, textAlign: 'center',
          marginTop: 18, lineHeight: 1.6,
        }}>
          Este sistema trata dados pessoais sensíveis de titulares em situação de
          vulnerabilidade. O acesso é registrado em log de auditoria conforme a
          Lei nº 13.709/2018 (LGPD).
        </p>
      </div>
    </div>
  );
}
