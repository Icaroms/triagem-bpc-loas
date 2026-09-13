/**
 * ============================================================================
 * CRIPTOGRAFIA — Derivação de chave para senhas
 * ============================================================================
 * Usa a Web Crypto API nativa do navegador (SubtleCrypto). Nenhuma
 * biblioteca externa é necessária.
 *
 * Algoritmo: PBKDF2 com SHA-256, 150.000 iterações e salt aleatório de
 * 16 bytes por usuário. O custo computacional torna ataques de força bruta
 * inviáveis na prática, e o salt individual impede o uso de rainbow tables.
 *
 * ---------------------------------------------------------------------------
 * LIMITAÇÃO ARQUITETURAL — LEIA ANTES DE USAR EM PRODUÇÃO
 * ---------------------------------------------------------------------------
 * A verificação ocorre no cliente. Isso significa que:
 *   - O hash e o salt ficam acessíveis no armazenamento do navegador
 *   - Um usuário com acesso ao console pode manipular o estado da sessão
 *   - Não há proteção contra quem tenha acesso físico à máquina destravada
 *
 * O controle implementado aqui cumpre o papel de SEGREGAÇÃO DE ACESSO entre
 * colaboradores em um ambiente de confiança (o escritório), não de defesa
 * contra atacante determinado. Autenticação com garantia real exige servidor
 * validando credenciais e emitindo token assinado — previsto nas melhorias
 * futuras junto com a migração para banco de dados remoto.
 * ---------------------------------------------------------------------------
 */

/** Número de iterações do PBKDF2. Maior = mais lento para atacar e para logar. */
const ITERATIONS = 150000;

/** Tamanho do salt em bytes */
const SALT_BYTES = 16;

/** Tamanho da chave derivada em bits */
const KEY_BITS = 256;

/**
 * Converte um ArrayBuffer em string hexadecimal.
 * @param {ArrayBuffer} buffer
 * @returns {string}
 */
function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Converte string hexadecimal de volta para Uint8Array.
 * @param {string} hex
 * @returns {Uint8Array}
 */
function hexToBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Gera um salt criptograficamente aleatório.
 * @returns {string} Salt em hexadecimal
 */
export function generateSalt() {
  const salt = new Uint8Array(SALT_BYTES);
  crypto.getRandomValues(salt);
  return bufferToHex(salt.buffer);
}

/**
 * Deriva o hash de uma senha usando PBKDF2.
 * @param {string} password — Senha em texto plano
 * @param {string} saltHex — Salt em hexadecimal
 * @returns {Promise<string>} Hash em hexadecimal
 */
export async function hashPassword(password, saltHex) {
  const encoder = new TextEncoder();

  // Importa a senha como material de chave
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  // Deriva os bits aplicando o salt e as iterações
  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: hexToBuffer(saltHex),
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    KEY_BITS
  );

  return bufferToHex(derived);
}

/**
 * Verifica se uma senha corresponde ao hash armazenado.
 * A comparação é feita em tempo constante para não vazar informação
 * por diferença de tempo de resposta.
 *
 * @param {string} password — Senha digitada
 * @param {string} saltHex — Salt do usuário
 * @param {string} expectedHash — Hash armazenado
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password, saltHex, expectedHash) {
  const actual = await hashPassword(password, saltHex);
  return constantTimeEquals(actual, expectedHash);
}

/**
 * Compara duas strings sem sair mais cedo na primeira diferença.
 * Evita que o tempo de resposta revele quantos caracteres estão corretos.
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
function constantTimeEquals(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Avalia a robustez de uma senha e devolve os problemas encontrados.
 * Usado para orientar o usuário no cadastro, não para bloquear rigidamente.
 *
 * @param {string} password
 * @returns {{score: number, level: string, issues: string[]}}
 */
export function evaluatePasswordStrength(password) {
  const issues = [];
  let score = 0;

  if (password.length < 8) issues.push('Use ao menos 8 caracteres');
  else score += 30;

  if (password.length >= 12) score += 15;

  if (!/[a-z]/.test(password)) issues.push('Inclua letras minúsculas');
  else score += 15;

  if (!/[A-Z]/.test(password)) issues.push('Inclua letras maiúsculas');
  else score += 15;

  if (!/[0-9]/.test(password)) issues.push('Inclua números');
  else score += 15;

  if (!/[^A-Za-z0-9]/.test(password)) issues.push('Inclua um símbolo');
  else score += 10;

  const level = score >= 75 ? 'forte' : score >= 45 ? 'média' : 'fraca';
  return { score: Math.min(100, score), level, issues };
}
