/**
 * ============================================================================
 * HISTÓRICO DE ATENDIMENTOS — DADOS REAIS + SIMULADOS
 * ============================================================================
 * 27 registros reais (04/02 a 13/02/2026) + 22 simulados (16/02 a 27/02).
 * Padrão do escritório: 8h-15h, ter/qui/sex = 3-4 clientes, seg/qua = 1-2.
 * CPFs são fictícios. BPC 88 não usa CID/laudo (marcados "N/A").
 */

import { calcAge } from '../utils/age';
import { cadunicoStatus } from '../utils/cadunico';
import { calcScore } from '../utils/scoring';

/**
 * Constrói o histórico completo de atendimentos.
 * @param {Array} cidDb — Base de dados CID-10
 * @returns {Array} Histórico ordenado do mais recente ao mais antigo
 */
export function buildHistory(cidDb) {
  function entry(id, name, cpf, birthDate, date, time, renda, cadunicoDate, laudo, cid) {
    const refDate = new Date(date);
    const idade = calcAge(birthDate, refDate);
    const tipoBpc = idade >= 65 ? 'BPC88' : 'BPC87';
    const cadSt = cadunicoStatus(cadunicoDate, refDate);
    const finalLaudo = tipoBpc === 'BPC88' ? 'N/A' : laudo;
    const finalCid = tipoBpc === 'BPC88' ? 'N/A' : cid;
    const score = calcScore(renda, cadSt, finalLaudo, tipoBpc, idade, finalCid, cidDb);
    return { id, name, cpf, tipoBpc, birthDate, idade, renda, cadunicoDate, cadunicoStatus: cadSt.status, laudo: finalLaudo, cid: finalCid, score, date, time, obs: '' };
  }

  return [
    // === DADOS REAIS (04/02 a 13/02/2026) ===
    entry(1, 'ANTONIO FRANCISCO VIANA', '030.456.789-12', '1958-03-15', '2026-02-04', '10:54', 180, '2025-06-10', 'N/A', 'N/A'),
    entry(2, 'ISAAC DOS SANTOS VALERIANO', '045.678.901-23', '2020-05-22', '2026-02-04', '12:14', 200, '2025-08-20', 'atualizado', 'F84.0'),
    entry(3, 'MARIA DE NAZARE DE SOUZA MELO', '067.890.123-45', '1976-11-08', '2026-02-04', '13:20', 520, '2025-04-15', 'detalhado', 'M54'),
    entry(4, 'NERCILIO DA SILVA CRAVEIRO', '078.901.234-56', '1961-01-20', '2026-02-05', '09:50', 150, '2025-09-12', 'N/A', 'N/A'),
    entry(5, 'EDILENE BRASIL FERNANDES', '089.012.345-67', '1990-07-14', '2026-02-05', '12:22', 280, '2023-06-01', 'atualizado', 'F84.0'),
    entry(6, 'AFONSO JOSE DE MELO', '090.123.456-78', '1960-04-03', '2026-02-05', '12:54', 100, '2023-11-20', 'N/A', 'N/A'),
    entry(7, 'FRANCISCA LOPES DE SOUZA', '012.345.678-90', '1983-09-27', '2026-02-05', '14:05', 250, '2025-07-08', 'atualizado', 'E11'),
    entry(8, 'NILSON JOSE FERREIRA PACHECO', '023.456.789-01', '1960-02-11', '2026-02-06', '09:03', 190, '2025-10-05', 'N/A', 'N/A'),
    entry(9, 'ANA BEATRIZ POJO OLIVEIRA', '034.567.890-12', '2002-06-30', '2026-02-06', '11:13', 300, '2025-05-18', 'atualizado', 'F84.0'),
    entry(10, 'GUILHERME RAFAEL SANTOS DA ROCHA', '045.678.901-34', '2016-08-12', '2026-02-06', '11:45', 120, '2025-11-22', 'atualizado', 'F84.0'),
    entry(11, 'IDENIZE VIEIRA DE MENEZES', '056.789.012-45', '1986-03-19', '2026-02-06', '12:19', 550, '2025-09-30', 'detalhado', 'M51'),
    entry(12, 'KELLY SIMAO DA SILVA', '067.890.123-56', '1996-12-05', '2026-02-06', '14:33', 310, '2025-08-14', 'desatualizado', 'F32'),
    entry(13, 'LORRANY VITORIA SANTANA BARROS', '078.901.234-67', '2007-04-17', '2026-02-06', '15:52', 270, '2025-07-20', 'desatualizado', 'F41'),
    entry(14, 'ANACLETO ALVES MENDONÇA', '089.012.345-78', '1980-10-25', '2026-02-09', '12:16', 480, '2025-06-28', 'detalhado', 'M47'),
    entry(15, 'ELICILDE MIGUEL DE SOUZA', '090.123.456-89', '1988-08-09', '2026-02-09', '14:48', 200, '2025-10-10', 'atualizado', 'F84.1'),
    entry(16, 'PEDRO HENRIQUE SANTOS BARROSO', '012.345.678-01', '2021-03-30', '2026-02-10', '15:23', 150, '2025-12-01', 'atualizado', 'F84.0'),
    entry(17, 'DEUSANIRA DE MOURA MARINHO', '023.456.789-12', '2004-06-18', '2026-02-11', '14:01', 180, '2025-09-15', 'atualizado', 'G40'),
    entry(18, 'LUIZ GONZAGA DE OLIVEIRA', '034.567.890-23', '1959-11-02', '2026-02-11', '15:04', 220, '2025-08-20', 'N/A', 'N/A'),
    entry(19, 'JADE LUANDA SOUZA VIEIRA', '045.678.901-45', '2019-01-14', '2026-02-11', '16:09', 460, '2025-07-05', 'atualizado', 'F84.0'),
    entry(20, 'MARIA RAIMUNDA PEREIRA DOS SANTOS', '056.789.012-56', '1961-02-28', '2026-02-12', '12:32', 160, '2023-08-10', 'N/A', 'N/A'),
    entry(21, 'TEODORA DA SILVA PACHECO', '067.890.123-67', '1959-05-22', '2026-02-12', '13:05', 200, '2025-11-18', 'N/A', 'N/A'),
    entry(22, 'ANDREW YAN SOUZA NUNES', '078.901.234-78', '2021-07-08', '2026-02-12', '14:45', 100, '2025-10-25', 'atualizado', 'F84.0'),
    entry(23, 'CELIO SANTOS CRUZ', '089.012.345-89', '1978-09-14', '2026-02-12', '15:05', 290, '2025-05-30', 'desatualizado', 'M65'),
    entry(24, 'DORISNEI ARAUJO DE VASCONCELOS', '090.123.456-90', '1978-04-03', '2026-02-12', '16:37', 250, '2025-09-08', 'atualizado', 'M54'),
    entry(25, 'ANETE MARIA TELES DE SOUZA', '012.345.678-12', '1978-12-20', '2026-02-13', '13:02', 310, '2025-06-12', 'desatualizado', 'E11'),
    entry(26, 'DEMETRIUS SILVA BOTELHO', '023.456.789-23', '1991-08-07', '2026-02-13', '13:33', 510, '2025-10-20', 'detalhado', 'M19'),
    entry(27, 'GREGORIO SIQUEIRA VOGT', '034.567.890-34', '1961-01-15', '2026-02-13', '14:35', 170, '2025-07-22', 'N/A', 'N/A'),

    // === DADOS SIMULADOS (16/02 a 27/02/2026) ===
    entry(28, 'RAIMUNDA NASCIMENTO DE OLIVEIRA', '045.678.901-56', '1954-09-10', '2026-02-16', '09:15', 140, '2025-11-05', 'N/A', 'N/A'),
    entry(29, 'MARCOS ANTONIO DA SILVA LIMA', '056.789.012-67', '1984-02-28', '2026-02-16', '13:40', 280, '2025-08-18', 'atualizado', 'M51'),
    entry(30, 'JOAO PEDRO ALMEIDA COSTA', '067.890.123-78', '2018-04-05', '2026-02-17', '08:30', 180, '2025-12-10', 'atualizado', 'F84.0'),
    entry(31, 'SEBASTIAO MOREIRA DA CRUZ', '078.901.234-89', '1957-06-20', '2026-02-17', '10:15', 490, '2025-09-25', 'N/A', 'N/A'),
    entry(32, 'ROSANGELA BATISTA FERREIRA', '089.012.345-90', '1993-10-12', '2026-02-17', '14:00', 260, '2025-07-14', 'desatualizado', 'F32'),
    entry(33, 'MANOEL PEREIRA DO NASCIMENTO', '090.123.456-01', '1956-03-18', '2026-02-18', '11:20', 200, '2025-10-08', 'N/A', 'N/A'),
    entry(34, 'ENZO GABRIEL SOUZA MONTEIRO', '012.345.678-23', '2022-08-14', '2026-02-19', '08:45', 100, '2026-01-05', 'atualizado', 'F84.0'),
    entry(35, 'MARIA JOSE DA CONCEICAO', '023.456.789-34', '1960-07-22', '2026-02-19', '10:30', 180, '2023-09-15', 'N/A', 'N/A'),
    entry(36, 'CARLOS EDUARDO PINTO RAMOS', '034.567.890-45', '1974-11-30', '2026-02-19', '14:20', 350, '2025-08-22', 'atualizado', 'M47'),
    entry(37, 'LUCAS RYAN OLIVEIRA SANTOS', '045.678.901-67', '2020-01-25', '2026-02-20', '09:10', 130, '2025-11-18', 'atualizado', 'F84.0'),
    entry(38, 'TEREZA MARIA CARDOSO BRAGA', '056.789.012-78', '1955-05-08', '2026-02-20', '12:45', 160, '2025-06-30', 'N/A', 'N/A'),
    entry(39, 'BENEDITO SOUZA MAGALHAES', '067.890.123-89', '1982-09-17', '2026-02-20', '14:30', 300, '2025-10-12', 'detalhado', 'G56'),
    entry(40, 'JOSE RIBAMAR FONSECA NETO', '078.901.234-90', '1971-12-04', '2026-02-23', '13:15', 520, '2025-09-08', 'atualizado', 'E10'),
    entry(41, 'HEITOR MIGUEL CASTRO SOUZA', '089.012.345-01', '2023-03-11', '2026-02-24', '08:20', 90, '2026-01-15', 'atualizado', 'F84.0'),
    entry(42, 'AURORA CELESTE DIAS MENDES', '090.123.456-12', '1958-08-26', '2026-02-24', '11:00', 175, '2025-12-20', 'N/A', 'N/A'),
    entry(43, 'VALDIMAR SANTOS DE FREITAS', '012.345.678-34', '1979-04-15', '2026-02-24', '14:30', 330, '2025-07-10', 'desatualizado', 'M75'),
    entry(44, 'FRANCISCA HELENA SOUZA VALE', '023.456.789-45', '1987-06-09', '2026-02-25', '10:45', 240, '2023-10-20', 'atualizado', 'F84.1'),
    entry(45, 'ANDERSON LUIS PINHEIRO COSTA', '034.567.890-56', '1975-01-22', '2026-02-25', '14:10', 290, '2025-08-05', 'detalhado', 'M54'),
    entry(46, 'MIGUEL ARTHUR ROCHA TAVARES', '045.678.901-78', '2019-06-30', '2026-02-26', '09:30', 110, '2025-11-25', 'atualizado', 'F84.0'),
    entry(47, 'BENEDITA MARIA SILVA ARAUJO', '056.789.012-89', '1953-10-14', '2026-02-26', '13:50', 190, '2025-10-18', 'N/A', 'N/A'),
    entry(48, 'CLEVERTON SOUZA DE ANDRADE', '067.890.123-90', '1982-07-21', '2026-02-27', '08:50', 220, '2025-09-30', 'atualizado', 'M65'),
    entry(49, 'ANA LUCIA MONTEIRO PIRES', '078.901.234-01', '1959-11-08', '2026-02-27', '12:30', 480, '2025-08-12', 'N/A', 'N/A'),
  ].reverse(); // Mais recente primeiro
}
