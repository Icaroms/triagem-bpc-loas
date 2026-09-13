/**
 * ============================================================================
 * HOOK: usePersistedState
 * ============================================================================
 * Substituto direto do useState que grava automaticamente no localStorage.
 * A assinatura é idêntica à do useState, então trocar um pelo outro não
 * exige mudanças no restante do componente.
 *
 * Exemplo:
 *   const [history, setHistory] = usePersistedState(KEYS.HISTORY, []);
 *
 * Comportamento:
 *   - Na montagem, tenta carregar o valor persistido
 *   - Se não houver valor salvo, usa o inicial (que pode ser uma função)
 *   - A cada alteração, grava de volta
 *   - Se o armazenamento falhar, o estado continua funcionando em memória
 */

import { useState, useEffect, useRef } from 'react';
import { readItem, writeItem, isStorageAvailable } from '../utils/storage';

/**
 * @param {string} key — Chave de armazenamento (usar constantes de KEYS)
 * @param {*|Function} initialValue — Valor inicial ou função que o produz
 * @returns {[*, Function, {persisted: boolean}]} Estado, setter e metadados
 */
export function usePersistedState(key, initialValue) {
  // Indica se a persistência está operando — exposto para a UI avisar o usuário
  const available = useRef(isStorageAvailable());

  const [value, setValue] = useState(() => {
    // Sem armazenamento disponível, comporta-se como useState comum
    if (!available.current) {
      return typeof initialValue === 'function' ? initialValue() : initialValue;
    }

    const stored = readItem(key, undefined);

    // Já existe dado persistido — usa ele
    if (stored !== undefined && stored !== null) {
      return stored;
    }

    // Primeira execução — semeia com o valor inicial
    return typeof initialValue === 'function' ? initialValue() : initialValue;
  });

  // Grava sempre que o valor mudar
  useEffect(() => {
    if (!available.current) return;
    writeItem(key, value);
  }, [key, value]);

  return [value, setValue, { persisted: available.current }];
}
