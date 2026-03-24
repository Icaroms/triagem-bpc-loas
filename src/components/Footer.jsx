/**
 * ============================================================================
 * COMPONENTE: Footer
 * ============================================================================
 * Rodapé com informações do projeto e ODS vinculadas.
 */
export default function Footer({ theme: t }) {
  return (
    <div style={{ textAlign: 'center', padding: 20, fontSize: 11, color: t.textMuted, borderTop: '1px solid ' + t.border }}>
      Projeto de Extensão II — Análise e Desenvolvimento de Sistemas · ODS 1, 10 e 16 · Protótipo v2.0
    </div>
  );
}
