/**
 * ============================================================================
 * ESTILOS COMPARTILHADOS ENTRE COMPONENTES
 * ============================================================================
 * Funções que geram objetos de estilo com base no tema ativo.
 * Centraliza a lógica de estilização para evitar repetição.
 */

/** Card padrão com sombra e borda arredondada */
export const sCard = (t) => ({
  background: t.card, borderRadius: 16, padding: 24,
  boxShadow: t.shadow, border: '1px solid ' + t.border, marginBottom: 16,
});

/** Input padrão */
export const sInput = (t) => ({
  width: '100%', padding: '10px 14px', borderRadius: 10,
  border: '1.5px solid ' + t.inputBorder, background: t.inputBg,
  color: t.text, fontSize: 14, outline: 'none', boxSizing: 'border-box',
});

/** Input desabilitado (para campos N/A do BPC 88) */
export const sDisabled = (t) => ({
  ...sInput(t), opacity: 0.45, cursor: 'not-allowed', background: t.cardAlt,
});

/** Label de campo */
export const sLabel = (t) => ({
  fontSize: 13, fontWeight: 600, color: t.textMuted, marginBottom: 4, display: 'block',
});

/** Botão (sólido ou outline) */
export const sBtn = (color, outline = false) => ({
  padding: '10px 20px', borderRadius: 10,
  border: outline ? '2px solid ' + color : 'none',
  background: outline ? 'transparent' : color,
  color: outline ? color : '#fff',
  fontWeight: 700, fontSize: 14, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 6,
});

/** Texto de erro abaixo de campos */
export const sError = (t) => ({
  color: t.danger, fontSize: 12, marginTop: 2,
});

/** Badge colorido (ex.: semáforo do score) */
export const sBadge = (bg) => ({
  display: 'inline-flex', alignItems: 'center', gap: 4,
  padding: '4px 12px', borderRadius: 20,
  fontSize: 12, fontWeight: 700, color: '#fff', background: bg,
});

/** Tag informativa (ex.: idade, tipo BPC, status CadÚnico) */
export const sInfoTag = (color) => ({
  display: 'inline-flex', alignItems: 'center', gap: 4,
  padding: '3px 10px', borderRadius: 8,
  fontSize: 12, fontWeight: 600, color,
  background: color + '18', border: '1px solid ' + color + '33',
});
