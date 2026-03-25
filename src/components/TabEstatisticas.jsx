/**
 * ============================================================================
 * COMPONENTE: TabEstatisticas
 * ============================================================================
 * Dashboard com gráficos e métricas do escritório.
 * Inclui: CIDs mais triados, distribuição por score, triagens diárias,
 * proporção BPC 87/88 e contagem de sugestões judiciais.
 */
import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, Legend,
} from 'recharts';
import {
  ClipboardList, CheckCircle, AlertTriangle, XCircle, Scale, Printer,
} from 'lucide-react';
import { getScoreColor, handlePrint } from '../utils';
import { sCard, sBtn } from '../styles/shared';

export default function TabEstatisticas({ theme: t, history, cidDb }) {
  /** Calcula todas as estatísticas do período */
  const stats = useMemo(() => {
    const total = history.length;
    const alta = history.filter((h) => h.score >= 70).length;
    const media = history.filter((h) => h.score >= 45 && h.score < 70).length;
    const baixa = history.filter((h) => h.score < 45).length;

    // CIDs mais frequentes (ignora N/A dos idosos)
    const cidCount = {};
    history.forEach((h) => { if (h.cid !== 'N/A') cidCount[h.cid] = (cidCount[h.cid] || 0) + 1; });
    const topCids = Object.entries(cidCount)
      .sort((a, b) => b[1] - a[1]).slice(0, 10)
      .map(([code, count]) => {
        const c = cidDb.find((x) => x.code === code);
        return { code, name: c ? c.name : code, count };
      });

    // Distribuição BPC
    const bpcDist = [
      { name: 'BPC 88 (Idoso)', value: history.filter((h) => h.tipoBpc === 'BPC88').length },
      { name: 'BPC 87 (PcD)', value: history.filter((h) => h.tipoBpc === 'BPC87').length },
    ];

    const scoreAvg = total ? (history.reduce((a, h) => a + h.score, 0) / total).toFixed(1) : 0;

    // Triagens diárias
    const dailyData = {};
    history.forEach((h) => {
      if (!dailyData[h.date]) dailyData[h.date] = { date: h.date, total: 0, alta: 0, baixa: 0 };
      dailyData[h.date].total++;
      if (h.score >= 70) dailyData[h.date].alta++;
      if (h.score < 45) dailyData[h.date].baixa++;
    });
    const daily = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));

    // Sugestões judiciais
    const judicialCount = history.filter((h) => {
      if (h.cid === 'N/A') return false;
      const cd = cidDb.find((x) => x.code === h.cid);
      return cd && cd.total >= 5 && (cd.approved / cd.total) < 0.30;
    }).length;

    return { total, alta, media, baixa, topCids, bpcDist, scoreAvg, daily, judicialCount };
  }, [history, cidDb]);

  const PIE_SCORE = [t.success, t.warning, t.danger];
  const PIE_BPC = ['#6366f1', '#f59e0b'];
  const tooltipStyle = { background: t.card, border: '1px solid ' + t.border, borderRadius: 8, color: t.text };

  return (
    <div id="print-area">
      {/* Botão imprimir */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }} data-no-print>
        <button style={sBtn(t.textMuted, true)} onClick={handlePrint}><Printer size={16} /> IMPRIMIR RELATÓRIO</button>
      </div>

      {/* Cards resumo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'TOTAL', value: stats.total, icon: <ClipboardList size={20} />, color: t.accent },
          { label: 'ALTA', value: stats.alta, icon: <CheckCircle size={20} />, color: t.success },
          { label: 'MÉDIA', value: stats.media, icon: <AlertTriangle size={20} />, color: t.warning },
          { label: 'BAIXA', value: stats.baixa, icon: <XCircle size={20} />, color: t.danger },
          { label: 'SUGEST. JUDICIAL', value: stats.judicialCount, icon: <Scale size={20} />, color: '#7c3aed' },
        ].map((s, i) => (
          <div key={i} style={{ ...sCard(t), textAlign: 'center', padding: 16, marginBottom: 0 }}>
            <div style={{ color: s.color, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: t.text }}>{s.value}</div>
            <div style={{ fontSize: 10, color: t.textMuted, fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={sCard(t)}>
          <h3 style={{ margin: '0 0 16px', color: t.text, fontSize: 15 }}>CIDS MAIS TRIADOS</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.topCids} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
              <XAxis type="number" tick={{ fill: t.textMuted, fontSize: 11 }} />
              <YAxis type="category" dataKey="code" width={50} tick={{ fill: t.textMuted, fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v, n, props) => [v + ' triagens', props.payload.name]} />
              <Bar dataKey="count" fill={t.accent} radius={[0, 6, 6, 0]} name="Triagens" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={sCard(t)}>
          <h3 style={{ margin: '0 0 16px', color: t.text, fontSize: 15 }}>DISTRIBUIÇÃO POR VIABILIDADE</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={[{ name: 'Alta', value: stats.alta }, { name: 'Média', value: stats.media }, { name: 'Baixa', value: stats.baixa }]} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => name + ': ' + (percent * 100).toFixed(0) + '%'}>
                {PIE_SCORE.map((c, i) => <Cell key={i} fill={c} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={sCard(t)}>
          <h3 style={{ margin: '0 0 16px', color: t.text, fontSize: 15 }}>TRIAGENS DIÁRIAS (FEV/2026)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.daily} margin={{ left: 0, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
              <XAxis dataKey="date" tick={{ fill: t.textMuted, fontSize: 9 }} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{ fill: t.textMuted, fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="total" fill={t.accent} name="Total" radius={[4, 4, 0, 0]} />
              <Bar dataKey="alta" fill={t.success} name="Alta" radius={[4, 4, 0, 0]} />
              <Bar dataKey="baixa" fill={t.danger} name="Baixa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={sCard(t)}>
          <h3 style={{ margin: '0 0 16px', color: t.text, fontSize: 15 }}>DISTRIBUIÇÃO BPC 87 X 88</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={stats.bpcDist} cx="50%" cy="50%" innerRadius={55} outerRadius={95} dataKey="value" label={({ name, percent }) => name + ': ' + (percent * 100).toFixed(0) + '%'}>
                {PIE_BPC.map((c, i) => <Cell key={i} fill={c} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Score médio */}
      <div style={{ ...sCard(t), textAlign: 'center', marginTop: 8 }}>
        <div style={{ fontSize: 13, color: t.textMuted, fontWeight: 600 }}>SCORE MÉDIO GERAL</div>
        <div style={{ fontSize: 36, fontWeight: 800, color: getScoreColor(Number(stats.scoreAvg)).bg }}>{stats.scoreAvg}</div>
        <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>Scores altos NÃO garantem deferimento. A decisão final é sempre do INSS ou do Judiciário.</div>
      </div>
    </div>
  );
}
