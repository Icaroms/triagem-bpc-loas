/**
 * ============================================================================
 * AUTENTICAÇÃO E GESTÃO DE USUÁRIOS
 * ============================================================================
 * Controle de acesso baseado em perfis (RBAC simplificado).
 *
 * Perfis:
 *   admin     — acesso total, incluindo gestão de usuários e auditoria
 *   atendente — realiza triagens e consulta histórico e estatísticas
 *
 * A senha nunca é armazenada. Guarda-se apenas salt + hash PBKDF2.
 * Ver crypto.js para a limitação arquitetural da autenticação client-side.
 */

import { readItem, writeItem, KEYS } from './storage';
import { generateSalt, hashPassword, verifyPassword } from './crypto';

/** Perfis disponíveis e o que cada um pode fazer */
export const ROLES = {
  admin: {
    label: 'Administrador',
    description: 'Acesso total, incluindo usuários e auditoria',
    can: ['triagem', 'historico', 'estatisticas', 'cid', 'sistema'],
  },
  atendente: {
    label: 'Atendente',
    description: 'Realiza triagens e consulta dados',
    can: ['triagem', 'historico', 'estatisticas', 'cid'],
  },
};

/** Tempo de inatividade até a sessão expirar (milissegundos) */
export const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutos

/** Número de tentativas falhas antes do bloqueio temporário */
const MAX_ATTEMPTS = 5;

/** Duração do bloqueio após exceder as tentativas (milissegundos) */
const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutos

/**
 * Verifica se um perfil tem permissão para acessar uma área.
 * @param {string} role
 * @param {string} area
 * @returns {boolean}
 */
export function can(role, area) {
  return ROLES[role]?.can.includes(area) ?? false;
}

/**
 * Retorna a lista de usuários cadastrados (sem os hashes).
 * @returns {Array}
 */
export function listUsers() {
  const users = readItem(KEYS.USERS, []);
  return users.map(({ salt, hash, ...safe }) => safe);
}

/** Retorna a lista bruta, com credenciais. Uso interno apenas. */
function listUsersRaw() {
  return readItem(KEYS.USERS, []);
}

/**
 * Indica se o sistema ainda não tem nenhum usuário.
 * Nesse caso a UI deve exibir a tela de configuração inicial.
 * @returns {boolean}
 */
export function needsSetup() {
  return listUsersRaw().length === 0;
}

/**
 * Cria um usuário.
 * @param {{username: string, name: string, role: string, password: string}} data
 * @returns {Promise<{ok: boolean, error?: string, user?: Object}>}
 */
export async function createUser({ username, name, role, password }) {
  const users = listUsersRaw();
  const normalized = username.trim().toLowerCase();

  if (!normalized) return { ok: false, error: 'Informe o nome de usuário.' };
  if (!name.trim()) return { ok: false, error: 'Informe o nome completo.' };
  if (!ROLES[role]) return { ok: false, error: 'Perfil inválido.' };
  if (password.length < 8) return { ok: false, error: 'A senha precisa ter ao menos 8 caracteres.' };
  if (users.some((u) => u.username === normalized)) {
    return { ok: false, error: 'Já existe um usuário com esse nome.' };
  }

  const salt = generateSalt();
  const hash = await hashPassword(password, salt);

  const user = {
    id: `u-${Date.now()}`,
    username: normalized,
    name: name.trim(),
    role,
    salt,
    hash,
    active: true,
    createdAt: new Date().toISOString(),
    lastLogin: null,
    failedAttempts: 0,
    lockedUntil: null,
  };

  writeItem(KEYS.USERS, [...users, user]);
  const { salt: _s, hash: _h, ...safe } = user;
  return { ok: true, user: safe };
}

/**
 * Autentica um usuário.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{ok: boolean, error?: string, session?: Object}>}
 */
export async function authenticate(username, password) {
  const users = listUsersRaw();
  const normalized = username.trim().toLowerCase();
  const idx = users.findIndex((u) => u.username === normalized);

  // Usuário inexistente: mensagem genérica para não revelar quais logins existem
  if (idx === -1) {
    return { ok: false, error: 'Usuário ou senha incorretos.' };
  }

  const user = users[idx];

  if (!user.active) {
    return { ok: false, error: 'Este usuário está desativado.' };
  }

  // Bloqueio temporário por excesso de tentativas
  if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
    const restam = Math.ceil((new Date(user.lockedUntil) - new Date()) / 60000);
    return { ok: false, error: `Acesso bloqueado. Tente novamente em ${restam} min.` };
  }

  const valid = await verifyPassword(password, user.salt, user.hash);

  if (!valid) {
    const attempts = (user.failedAttempts || 0) + 1;
    users[idx] = {
      ...user,
      failedAttempts: attempts,
      lockedUntil: attempts >= MAX_ATTEMPTS
        ? new Date(Date.now() + LOCKOUT_MS).toISOString()
        : null,
    };
    writeItem(KEYS.USERS, users);

    const restantes = MAX_ATTEMPTS - attempts;
    return {
      ok: false,
      error: restantes > 0
        ? `Usuário ou senha incorretos. ${restantes} tentativa(s) restante(s).`
        : 'Muitas tentativas. Acesso bloqueado por 5 minutos.',
    };
  }

  // Sucesso: zera contadores e registra o acesso
  users[idx] = {
    ...user,
    failedAttempts: 0,
    lockedUntil: null,
    lastLogin: new Date().toISOString(),
  };
  writeItem(KEYS.USERS, users);

  const session = {
    userId: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    startedAt: new Date().toISOString(),
    lastActivity: Date.now(),
  };
  writeItem(KEYS.SESSION, session);

  return { ok: true, session };
}

/**
 * Recupera a sessão ativa, validando o timeout de inatividade.
 * @returns {{session: Object|null, expired: boolean}}
 */
export function getSession() {
  const session = readItem(KEYS.SESSION, null);
  if (!session) return { session: null, expired: false };

  const idle = Date.now() - (session.lastActivity || 0);
  if (idle > SESSION_TIMEOUT_MS) {
    writeItem(KEYS.SESSION, null);
    return { session: null, expired: true };
  }

  return { session, expired: false };
}

/** Renova o carimbo de atividade da sessão */
export function touchSession() {
  const session = readItem(KEYS.SESSION, null);
  if (!session) return;
  writeItem(KEYS.SESSION, { ...session, lastActivity: Date.now() });
}

/** Encerra a sessão atual */
export function endSession() {
  writeItem(KEYS.SESSION, null);
}

/**
 * Altera a senha de um usuário, exigindo a senha atual.
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function changePassword(userId, currentPassword, newPassword) {
  const users = listUsersRaw();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return { ok: false, error: 'Usuário não encontrado.' };

  const user = users[idx];
  const valid = await verifyPassword(currentPassword, user.salt, user.hash);
  if (!valid) return { ok: false, error: 'Senha atual incorreta.' };
  if (newPassword.length < 8) return { ok: false, error: 'A nova senha precisa ter ao menos 8 caracteres.' };

  const salt = generateSalt();
  const hash = await hashPassword(newPassword, salt);
  users[idx] = { ...user, salt, hash };
  writeItem(KEYS.USERS, users);

  return { ok: true };
}

/**
 * Ativa ou desativa um usuário. Impede desativar o último administrador.
 * @returns {{ok: boolean, error?: string}}
 */
export function setUserActive(userId, active) {
  const users = listUsersRaw();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return { ok: false, error: 'Usuário não encontrado.' };

  if (!active) {
    const activeAdmins = users.filter((u) => u.role === 'admin' && u.active);
    if (activeAdmins.length === 1 && activeAdmins[0].id === userId) {
      return { ok: false, error: 'É necessário manter ao menos um administrador ativo.' };
    }
  }

  users[idx] = { ...users[idx], active };
  writeItem(KEYS.USERS, users);
  return { ok: true };
}

/**
 * Remove um usuário. Impede remover o último administrador.
 * @returns {{ok: boolean, error?: string}}
 */
export function deleteUser(userId) {
  const users = listUsersRaw();
  const target = users.find((u) => u.id === userId);
  if (!target) return { ok: false, error: 'Usuário não encontrado.' };

  const admins = users.filter((u) => u.role === 'admin');
  if (target.role === 'admin' && admins.length === 1) {
    return { ok: false, error: 'É necessário manter ao menos um administrador.' };
  }

  writeItem(KEYS.USERS, users.filter((u) => u.id !== userId));
  return { ok: true };
}
