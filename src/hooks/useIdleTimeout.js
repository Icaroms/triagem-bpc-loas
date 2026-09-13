/**
 * ============================================================================
 * HOOK: useIdleTimeout
 * ============================================================================
 * Encerra a sessão após um período sem interação do usuário.
 *
 * Justificativa: em um escritório com 10 estações compartilhadas, uma tela
 * destravada é o vetor de acesso indevido mais provável. O timeout reduz a
 * janela de exposição sem depender de disciplina do colaborador.
 *
 * A atividade é detectada por eventos de mouse, teclado, toque e rolagem.
 * O carimbo de atividade é gravado no armazenamento com throttle para não
 * escrever a cada movimento do cursor.
 */

import { useEffect, useRef } from 'react';
import { touchSession, SESSION_TIMEOUT_MS } from '../utils/auth';

/** Intervalo mínimo entre gravações do carimbo de atividade */
const THROTTLE_MS = 30000; // 30 segundos

/** Frequência da verificação de expiração */
const CHECK_INTERVAL_MS = 20000; // 20 segundos

/**
 * @param {boolean} active — Só monitora quando há sessão ativa
 * @param {Function} onTimeout — Chamado quando o tempo se esgota
 */
export function useIdleTimeout(active, onTimeout) {
  const lastActivity = useRef(Date.now());
  const lastWrite = useRef(0);

  useEffect(() => {
    if (!active) return;

    /** Marca atividade, gravando no armazenamento com throttle */
    const registerActivity = () => {
      const now = Date.now();
      lastActivity.current = now;
      if (now - lastWrite.current > THROTTLE_MS) {
        lastWrite.current = now;
        touchSession();
      }
    };

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'mousemove'];
    events.forEach((e) => window.addEventListener(e, registerActivity, { passive: true }));

    // Verifica periodicamente se o limite foi ultrapassado
    const timer = setInterval(() => {
      if (Date.now() - lastActivity.current > SESSION_TIMEOUT_MS) {
        onTimeout();
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      events.forEach((e) => window.removeEventListener(e, registerActivity));
      clearInterval(timer);
    };
  }, [active, onTimeout]);
}
