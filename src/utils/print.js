/**
 * ============================================================================
 * IMPRESSÃO
 * ============================================================================
 * Imprime a área com id="print-area", escondendo o restante da página.
 * Elementos com atributo data-no-print são ocultados na impressão.
 */

/** Aciona a impressão da área identificada por #print-area */
export function handlePrint() {
  const css = document.createElement('style');
  css.textContent = `
    @media print {
      body * { visibility: hidden; }
      #print-area, #print-area * { visibility: visible; }
      #print-area { position: absolute; left: 0; top: 0; width: 100%; }
      [data-no-print] { display: none !important; }
    }
  `;
  document.head.appendChild(css);
  window.print();
  // Remove o CSS de impressão após 1 segundo
  setTimeout(() => css.remove(), 1000);
}
