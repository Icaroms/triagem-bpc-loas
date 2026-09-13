/**
 * ============================================================================
 * COMPONENTE: BackupPanel
 * ============================================================================
 * Painel de gerenciamento dos dados persistidos.
 *
 * Funções:
 *   - Exportar backup completo em JSON
 *   - Restaurar a partir de um arquivo de backup
 *   - Exibir espaço ocupado e estado da persistência
 *   - Excluir todos os dados (requisito de eliminação — LGPD, Art. 18, VI)
 *
 * Observação: a restauração substitui os dados atuais. A confirmação
 * explícita do usuário é exigida antes de qualquer operação destrutiva.
 */

import { useState, useRef } from 'react';
import {
  Download, Upload, Trash2, Database,
  AlertTriangle, CheckCircle, HardDrive,
} from 'lucide-react';
import {
  exportBackup, parseBackupFile, clearAll,
  getStorageSize, isStorageAvailable,
} from '../utils/storage';
import { sCard, sBtn } from '../styles/shared';

export default function BackupPanel({ theme: t, onRestore, onClearAll }) {
  const [feedback, setFeedback] = useState(null);
  const fileInputRef = useRef(null);

  const available = isStorageAvailable();
  const size = getStorageSize();

  /** Exibe uma mensagem temporária ao usuário */
  const notify = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 5000);
  };

  /** Handler do input de arquivo — lê, valida e pede confirmação */
  const handleFileSelected = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const backup = await parseBackupFile(file);
      const dataStr = new Date(backup.exportedAt).toLocaleString('pt-BR');
      const confirmed = window.confirm(
        `Restaurar backup de ${dataStr}?\n\n` +
        `${backup.history.length} atendimentos e ${backup.cidDb.length} CIDs.\n\n` +
        'Os dados atuais serão substituídos.'
      );

      if (confirmed) {
        onRestore(backup.history, backup.cidDb);
        notify('success', 'Backup restaurado com sucesso.');
      }
    } catch (err) {
      notify('error', err.message);
    } finally {
      // Permite reselecionar o mesmo arquivo depois
      event.target.value = '';
    }
  };

  /** Exclusão total — dupla confirmação por ser irreversível */
  const handleClearAll = () => {
    const first = window.confirm(
      'Excluir TODOS os dados do sistema?\n\n' +
      'Atendimentos, base CID-10 e configurações serão apagados permanentemente.'
    );
    if (!first) return;

    const second = window.confirm(
      'Esta ação é irreversível.\n\n' +
      'Recomenda-se exportar um backup antes. Deseja prosseguir mesmo assim?'
    );
    if (!second) return;

    clearAll();
    onClearAll();
    notify('success', 'Todos os dados foram excluídos.');
  };

  return (
    <div style={sCard(t)}>
      <h3 style={{
        margin: '0 0 4px', color: t.text, fontSize: 16,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <Database size={18} style={{ color: t.accent }} /> DADOS E BACKUP
      </h3>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>
        Os dados são gravados localmente neste navegador. Exporte backups
        periodicamente para não depender de uma única máquina.
      </p>

      {/* Estado da persistência */}
      <div style={{
        display: 'flex', gap: 12, flexWrap: 'wrap',
        padding: 14, background: t.cardAlt, borderRadius: 10, marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          {available
            ? <CheckCircle size={15} style={{ color: t.success }} />
            : <AlertTriangle size={15} style={{ color: t.danger }} />}
          <span style={{ color: t.textMuted }}>Persistência:</span>
          <strong style={{ color: available ? t.success : t.danger }}>
            {available ? 'Ativa' : 'Indisponível'}
          </strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <HardDrive size={15} style={{ color: t.textMuted }} />
          <span style={{ color: t.textMuted }}>Espaço usado:</span>
          <strong style={{ color: t.text }}>{size.readable}</strong>
        </div>
      </div>

      {/* Aviso quando o navegador bloqueia o armazenamento */}
      {!available && (
        <div style={{
          padding: 12, marginBottom: 16, borderRadius: 10,
          background: t.cardAlt, border: `1px dashed ${t.danger}`,
          fontSize: 13, color: t.danger, lineHeight: 1.5,
        }}>
          O navegador está bloqueando o armazenamento local. Os dados funcionarão
          apenas nesta sessão e serão perdidos ao fechar a aba. Verifique se o
          modo de navegação privada está ativo.
        </div>
      )}

      {/* Mensagem de retorno das operações */}
      {feedback && (
        <div style={{
          padding: 12, marginBottom: 16, borderRadius: 10,
          background: t.cardAlt,
          border: `1px solid ${feedback.type === 'success' ? t.success : t.danger}`,
          fontSize: 13,
          color: feedback.type === 'success' ? t.success : t.danger,
        }}>
          {feedback.text}
        </div>
      )}

      {/* Ações */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button style={sBtn(t.accent)} onClick={exportBackup}>
          <Download size={16} /> EXPORTAR BACKUP
        </button>

        <button style={sBtn(t.accent, true)} onClick={() => fileInputRef.current?.click()}>
          <Upload size={16} /> RESTAURAR BACKUP
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileSelected}
          style={{ display: 'none' }}
        />

        <button style={sBtn(t.danger, true)} onClick={handleClearAll}>
          <Trash2 size={16} /> EXCLUIR TODOS OS DADOS
        </button>
      </div>
    </div>
  );
}
