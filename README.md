# ⚖️ Triagem BPC/LOAS — Sistema de Análise de Viabilidade

> **Projeto de Extensão II** — Curso de Análise e Desenvolvimento de Sistemas  
> Escritório: Advocacia Humanizada Dr. Egberto Frazão

---

## 📋 Sobre o Projeto

Sistema web de triagem para benefícios previdenciários **BPC/LOAS** (Benefício de Prestação Continuada / Lei Orgânica de Assistência Social), desenvolvido como Projeto de Extensão Universitária para um escritório de advocacia previdenciária.

O sistema realiza a análise de viabilidade do requerimento administrativo do BPC com base em critérios como renda per capita, situação do CadÚnico, laudo médico e histórico de deferimento por CID-10, gerando um **score de viabilidade** e **feedback inteligente** com recomendações — incluindo a sugestão de via judicial quando a taxa administrativa é baixa.

### Tipos de Benefício

| Benefício | Público | Critérios |
|-----------|---------|-----------|
| **BPC 87** | Pessoa com Deficiência | Renda + CadÚnico + Laudo Médico + CID-10 |
| **BPC 88** | Idoso (≥65 anos) | Renda + CadÚnico + Idade (miserabilidade) |

---

## 🎯 ODS da ONU Vinculadas

- **ODS 1** — Erradicação da Pobreza
- **ODS 10** — Redução das Desigualdades
- **ODS 16** — Paz, Justiça e Instituições Eficazes

---

## 🖥️ Funcionalidades

### Aba 1 — Triagem
- Formulário com validações (CPF formatado, nome em caixa alta, renda com limite de ¼ do salário mínimo)
- Data de nascimento com detecção automática do tipo de BPC (87 ou 88)
- Campos de CID e laudo **bloqueados automaticamente** para BPC 88 (idoso)
- Validação de CadÚnico com prazo de 2 anos e alerta de proximidade de vencimento (≤90 dias)
- Sistema de scoring (0-100) com semáforo visual 🟢🟡🔴
- Feedback inteligente com recomendações e sugestão de via judicial
- Botão de impressão do resultado

### Aba 2 — Histórico
- Lista de todos os clientes triados com busca por nome, CID ou data
- CPF mascarado para proteção de dados (ex.: 030.***.***-67)
- Badge "⚖️ VIA JUDICIAL" para clientes com CID de baixa taxa administrativa
- Horário de atendimento registrado
- Exclusão individual ou total
- Exportação para CSV (compatível com Excel)

### Aba 3 — Estatísticas
- Cards resumo: total, alta/média/baixa viabilidade, sugestões judiciais
- Gráfico de CIDs mais triados
- Distribuição por viabilidade (pizza)
- Triagens diárias (barras)
- Distribuição BPC 87 x 88 (pizza)
- Score médio geral
- Botão de impressão do relatório

### Aba 4 — Base CID-10
- 29 CIDs cadastrados com taxas de deferimento administrativo
- CRUD completo (adicionar, editar, excluir)
- Trava de mínimo 5 casos para consistência estatística
- Badge "PREFERIR JUDICIAL" para CIDs com taxa < 25%
- Busca por código ou nome

### Recursos Gerais
- Modo claro / escuro
- Interface responsiva
- Código 100% comentado

---

## 🧮 Sistema de Scoring

### BPC 87 (Pessoa com Deficiência) — Máximo: 100 pontos

| Critério | Pontuação |
|----------|-----------|
| Renda ≤ ¼ salário mínimo | +15 |
| CadÚnico válido | +12 |
| Laudo atualizado (6 meses) | +18 |
| Confirmação PcD | +10 |
| Taxa CID (proporcional) | até +35 |
| **Penalidade:** CID taxa < 25% | -10 |
| **Penalidade:** Laudo ruim + CID < 40% | -8 |
| **Penalidade:** Dupla falha documental | -5 |
| **Penalidade:** Renda acima do limite | -10 |

### BPC 88 (Idoso) — Máximo: 100 pontos

| Critério | Pontuação |
|----------|-----------|
| Renda ≤ ¼ salário mínimo | +40 |
| CadÚnico válido | +35 |
| Idade ≥ 65 anos | +25 |
| **Penalidade:** Renda acima do limite | -15 |
| **Penalidade:** CadÚnico inválido | -10 |

### Classificação

| Score | Classificação | Cor |
|-------|--------------|-----|
| ≥ 70 | Alta Viabilidade | 🟢 Verde |
| 45–69 | Média Viabilidade | 🟡 Amarelo |
| < 45 | Baixa Viabilidade | 🔴 Vermelho |

---

## 🛠️ Tecnologias Utilizadas

- **React** — Interface componentizada
- **Recharts** — Gráficos e visualizações
- **Lucide React** — Ícones
- **CSS-in-JS** — Estilização inline com suporte a temas

---

## 🚀 Como Executar

Este projeto foi desenvolvido como um componente React standalone. Para executar localmente:

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/triagem-bpc-loas.git
cd triagem-bpc-loas
```

2. Instale as dependências:
```bash
npm install react react-dom recharts lucide-react
```

3. Importe o componente no seu projeto React:
```jsx
import TriagemBPC from './triagem-bpc';

function App() {
  return <TriagemBPC />;
}
```

---

## 📊 Dados

> ⚠️ **Todos os dados contidos neste projeto são simulados para fins acadêmicos.**  
> CPFs são fictícios e não passam validação real. Nomes e informações de clientes  
> foram criados exclusivamente para demonstração do protótipo.  
> Taxas de deferimento por CID são estimativas baseadas em literatura e  
> experiência do escritório, não devendo ser utilizadas como referência jurídica.

---

## 🔮 Melhorias Futuras

- [ ] Backend com banco de dados (PostgreSQL / Firebase)
- [ ] Autenticação de usuários (login/senha)
- [ ] Persistência de dados em nuvem
- [ ] Notificações automáticas de vencimento do CadÚnico
- [ ] Integração com API do INSS para consulta de processos
- [ ] Dashboard avançado com filtros por período
- [ ] Relatórios PDF exportáveis
- [ ] Módulo de acompanhamento pós-triagem
- [ ] App mobile (React Native)
- [ ] Integração com IA para análise preditiva de jurisprudência

---

## 📄 Licença

Projeto acadêmico — Projeto de Extensão II  
Curso de Análise e Desenvolvimento de Sistemas

---

## 👤 Autor

Desenvolvido como Projeto de Extensão Universitária (PEX II)  
Escritório parceiro: **Advocacia Humanizada Dr. Egberto Frazão**
