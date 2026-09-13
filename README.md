# Triagem BPC/LOAS

Sistema web de triagem para benefícios assistenciais, desenvolvido como Projeto de Extensão do curso de Análise e Desenvolvimento de Sistemas em parceria com a Advocacia Humanizada Dr. Egberto Frazão, em Manaus.

O escritório atende principalmente idosos e pessoas com deficiência que buscam o BPC/LOAS. Boa parte dos requerimentos acabava indeferida pelo INSS, e a triagem inicial era feita apenas com base na experiência de quem atendia, sem critério objetivo. O sistema nasceu para dar esse critério.

## O que ele faz

Coleta os dados do cliente durante o atendimento e calcula um score de viabilidade de 0 a 100, indicando se o caso tem chance real pela via administrativa ou se vale considerar a via judicial desde o início.

O cálculo leva em conta renda per capita, situação do CadÚnico, qualidade do laudo médico e a taxa histórica de deferimento do CID informado. Combinações ruins recebem penalidade cumulativa, para que o score não gere falsa confiança.

### Os dois tipos de benefício

O sistema identifica automaticamente qual benefício se aplica a partir da data de nascimento.

**BPC 87** vale para pessoa com deficiência. Exige laudo médico e CID, e o histórico de deferimento daquele CID pesa bastante no resultado.

**BPC 88** vale para idoso a partir de 65 anos. Aqui a análise é só de miserabilidade e idade, então os campos de CID e laudo ficam bloqueados. Não faz sentido pedir laudo para quem se enquadra por idade.

## Funcionalidades

**Triagem.** Formulário com validação de CPF, nome e renda. Verifica se o CadÚnico está dentro do prazo de dois anos e avisa quando falta menos de 90 dias para vencer. Ao final entrega o score com semáforo visual e um parecer explicando cada ponto que pesou.

**Histórico.** Lista todos os atendimentos com busca por nome, CID ou data. Marca com um selo os casos em que a via judicial tende a ser mais efetiva. Exporta para CSV.

**Estatísticas.** Painel com os CIDs mais frequentes, distribuição por viabilidade, volume diário e proporção entre os dois tipos de benefício.

**Base CID-10.** Vinte e nove CIDs com taxas de deferimento administrativo, editáveis pelo escritório conforme novos casos são resolvidos. CIDs com menos de cinco casos não entram na análise, porque um caso deferido em um total de um geraria uma taxa de 100% que não significa nada.

**Sistema.** Área restrita ao administrador, com gestão de usuários, log de auditoria e a documentação de conformidade com a LGPD.

## Segurança e proteção de dados

O sistema lida com CPF e diagnóstico médico, que a LGPD classifica como dado pessoal sensível. As medidas adotadas:

O acesso exige autenticação. As senhas passam por PBKDF2 com SHA-256, 150 mil iterações e salt individual, usando a Web Crypto API do próprio navegador. A senha em si nunca é gravada. Cinco tentativas erradas bloqueiam o usuário por cinco minutos.

Não existe senha padrão no código. Na primeira execução o sistema pede a criação do administrador. Deixar `admin/admin` em um repositório público seria abrir a porta antes de instalar a fechadura.

Há dois perfis. O administrador vê tudo, o atendente trabalha nas triagens e consultas mas não acessa a área de sistema.

A sessão encerra sozinha depois de quinze minutos parada. São dez estações no escritório, e tela destravada é o jeito mais provável de alguém ver o que não deveria.

O CPF é gravado mascarado, no formato `030.***.***-67`. O número completo continua no contrato e nos autos, que é onde ele precisa estar.

Toda operação sobre a base fica registrada em log com autor e data. O log não copia nome, CPF nem CID. Ele guarda quem fez, o que fez e o identificador interno do registro, o que basta para auditar sem espalhar dado sensível por mais um lugar.

O backup exportado não inclui usuários nem senhas.

## Limitações conhecidas

Vale ser direto sobre o que este protótipo não resolve.

A autenticação roda inteiramente no navegador. Ela separa o acesso entre colegas de um ambiente de confiança, mas não segura quem sabe abrir o console do desenvolvedor. Segurança de verdade exige um servidor validando as credenciais.

Os dados ficam no armazenamento local do navegador, sem criptografia em repouso. Cada máquina tem sua própria base, então as dez estações não compartilham informação.

Não há registro formal de consentimento assinado pelo titular dentro do sistema.

Os backups saem em JSON sem cifragem e precisam ficar guardados em local controlado.

Resolver esses pontos depende de backend com banco de dados e autenticação no servidor, que está no plano de evolução.

## Como rodar

Precisa do Node.js instalado.

```bash
git clone https://github.com/Icaroms/triagem-bpc-loas.git
cd triagem-bpc-loas
npm install
npm run dev
```

O navegador abre em `http://localhost:3000`. Na primeira vez o sistema pede a criação do usuário administrador.

Para gerar a versão de produção:

```bash
npm run build
```

## Stack

React 18 com Vite, Recharts para os gráficos e Lucide para os ícones. A persistência usa a API de armazenamento local do navegador, isolada em uma camada própria para que a migração futura para banco de dados mexa em um arquivo só.

## Estrutura

```
src/
├── components/     Interface e abas do sistema
├── utils/          Regras de negócio, scoring, segurança e persistência
├── hooks/          Estado persistido e controle de sessão
├── data/           Base CID-10 e histórico de referência
├── styles/         Temas e estilos compartilhados
└── constants/      Valores de referência
```

A lógica de cálculo fica separada da interface. O arquivo `scoring.js` concentra as regras dos dois tipos de benefício e pode ser alterado sem tocar em nenhum componente.

## Sobre os dados

Os CPFs no histórico de referência são fictícios e não passam validação. Os nomes e as taxas por CID foram construídos para demonstração acadêmica e não devem ser usados como referência jurídica.

## Próximos passos

Backend com banco de dados para que as estações compartilhem a base. Autenticação no servidor. Criptografia em repouso. Notificação automática quando o CadÚnico de um cliente estiver perto de vencer. Acompanhamento pós-triagem, para que o resultado final de cada requerimento volte e atualize sozinho as taxas por CID, fechando o ciclo que hoje ainda depende de alguém editar na mão.

## Sistema no ar

https://triagem-bpc-loas.vercel.app

## Licença

MIT. Projeto acadêmico desenvolvido para o Projeto de Extensão do curso de Análise e Desenvolvimento de Sistemas.
