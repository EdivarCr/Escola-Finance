# Plano do Projeto — MVP Gestão Escolar e Financeira

## 1. Objetivo

Construir um MVP simples para gerenciamento de uma escola de reforço, com foco em:

- cadastro da escola;
- usuários com diferentes papéis;
- cadastro de responsáveis;
- cadastro de alunos;
- controle de mensalidades;
- registro e confirmação de pagamentos;
- registro de despesas;
- visão financeira por período;
- geração futura de carnê em PDF.

O projeto será desenvolvido inicialmente para uma única escola, mas a modelagem já considera a entidade `Escola` para facilitar uma futura evolução para SaaS.

## 2. Escopo atual do MVP

### Entidades principais

- Escola
- Usuário
- Responsável
- Aluno
- Mensalidade
- Pagamento
- Despesa

### Papéis de usuário

- `OWNER`
- `ADMIN`
- `RESPONSAVEL`

No futuro poderão ser adicionados outros papéis, como `PROFESSOR`.

### Regra de identidade e acesso

`Usuario` representa autenticação e autorização.

Dados específicos de domínio ficam em entidades próprias.

```
Usuario
├── OWNER
├── ADMIN
└── RESPONSAVEL
       |
       └── Responsavel
              |
              └── Alunos
```

`OWNER` e `ADMIN` inicialmente não precisam de tabelas próprias.

## 3. Stack

### Backend

- TypeScript
- NestJS
- Zod
- Prisma ORM
- PostgreSQL

### Infraestrutura

- Docker para PostgreSQL local
- Neon posteriormente para PostgreSQL em produção
- Deploy posteriormente

### Testes

- Jest
- Supertest para testes E2E

## 4. Organização do código

Arquitetura adotada:

**Monólito modular organizado por feature, com separação de infraestrutura.**

```
apps/api/
├── docs/
│   └── specs/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── config/
│   ├── infra/
│   │   └── database/
│   │       └── prisma/
│   │           ├── prisma.module.ts
│   │           └── prisma.service.ts
│   ├── modules/
│   │   ├── schools/
│   │   ├── users/
│   │   ├── guardians/
│   │   ├── students/
│   │   ├── monthly-fees/
│   │   ├── payments/
│   │   └── expenses/
│   ├── app.module.ts
│   └── main.ts
└── test/
```

Os módulos devem ser criados conforme as funcionalidades forem entrando em desenvolvimento.

## 5. Modelo financeiro simplificado

### Mensalidade

Representa o valor que deveria ser recebido.

Principais informações:

- aluno;
- competência;
- valor original;
- valor cobrado;
- vencimento;
- status.

### Pagamento

Representa uma entrada financeira informada pelo responsável.

```
Mensalidade PENDENTE
        |
        v
Responsável informa pagamento
        |
        v
AGUARDANDO_CONFIRMACAO
        |
        v
OWNER / ADMIN verifica
      /       \
     v         v
CONFIRMADO   REJEITADO
     |
     v
Mensalidade PAGA
```

O pagamento preserva:

- valor;
- data do pagamento;
- forma de pagamento;
- comprovante;
- usuário que informou;
- usuário que confirmou;
- usuário que realizou eventual estorno;
- datas dos eventos.

### Despesa

Representa saída financeira da escola.

### Dashboard

Não haverá tabela específica de dashboard.

```
Previsto = soma das mensalidades
Recebido = soma dos pagamentos confirmados
Despesas = soma das despesas
Resultado = Recebido - Despesas
```

## 6. Estratégia de desenvolvimento

Será utilizada uma abordagem de **especificação leve + TDD**, com foco também em aprendizado de NestJS.

```
1. Escrever/revisar a spec
2. Definir critérios de aceitação
3. Criar os testes
4. Executar e confirmar falha
5. Implementar a funcionalidade
6. Executar novamente até passar
7. Refatorar
8. Validar a feature
9. Commit
```

A IA pode auxiliar na escrita dos testes e da implementação, mas o objetivo é compreender as estruturas e conceitos utilizados no NestJS.

## 7. Estrutura das specs

As specs ficam versionadas em:

```
apps/api/docs/specs/
```

Cada spec deve conter, quando aplicável:

- contexto;
- objetivo;
- requisitos funcionais;
- regras de negócio;
- fluxo esperado;
- critérios de aceitação;
- não objetivos.

As specs **não devem ser colocadas no `.gitignore`**.

## 8. Ordem inicial das funcionalidades

### 001 — Bootstrap da escola e OWNER

- criar escola;
- criar OWNER;
- vincular OWNER à escola;
- e-mail único;
- senha em hash;
- rollback caso uma parte da operação falhe.

### 002 — Autenticação

- login;
- validação de senha;
- JWT ou mecanismo equivalente;
- contexto do usuário;
- escola;
- papel.

### 003 — Cadastro de responsável

- criar responsável;
- criar ou vincular usuário com papel `RESPONSAVEL`;
- consultar;
- atualizar.

### 004 — Cadastro de aluno

- criar aluno;
- gerar/registrar matrícula;
- vincular à escola;
- vincular ao responsável;
- definir série;
- tipo de escola;
- valor padrão.

### 005 — Listagem e atualização de alunos

- listar;
- buscar;
- atualizar;
- inativar.

### 006 — Mensalidades

- criar mensalidade;
- definir competência;
- definir vencimento;
- valor original;
- valor cobrado;
- status.

### 007 — Área financeira do responsável

- listar mensalidades dos próprios alunos;
- consultar situação;
- informar pagamento.

### 008 — Informar pagamento

- responsável informa pagamento;
- pagamento inicia como `AGUARDANDO_CONFIRMACAO`;
- mensalidade permanece pendente até confirmação.

### 009 — Confirmar pagamento

- OWNER ou ADMIN confirma;
- pagamento vira `CONFIRMADO`;
- mensalidade vira `PAGA`;
- operação deve ser consistente.

### 010 — Rejeitar pagamento

- OWNER ou ADMIN rejeita;
- registrar motivo;
- mensalidade não é marcada como paga.

### 011 — Estornar pagamento

- OWNER ou ADMIN estorna;
- preservar histórico;
- atualizar situação da mensalidade quando necessário.

### 012 — Despesas

- registrar;
- listar;
- filtrar por período.

### 013 — Dashboard financeiro

Exibir por período:

- valor previsto;
- valor recebido;
- valor pendente;
- despesas;
- resultado.

### 014 — Carnê

- consultar mensalidades do aluno;
- gerar documento anual em PDF;
- incluir dados da escola, aluno e cobranças necessárias.

## 9. Infraestrutura atual

Etapas já realizadas ou previstas:

- monorepo criado;
- API NestJS criada;
- dependências principais instaladas;
- PostgreSQL configurado com Docker;
- `.env` configurado;
- Prisma inicializado;
- schema Prisma criado;
- migration inicial;
- `PrismaService`;
- `PrismaModule`;
- estrutura inicial de `schools` e `users`.

## 10. Próxima etapa

1. refazer/revisar o documento de requisitos;
2. alinhar os requisitos com as futuras specs;
3. revisar a `Spec 001`;
4. derivar os testes da `Spec 001`;
5. iniciar a implementação do bootstrap da escola e OWNER.

## 11. Fora do escopo atual

- turmas;
- professores;
- horários;
- presença;
- regras avançadas de precificação;
- gateway de pagamento;
- PIX automático;
- WhatsApp API;
- assinatura SaaS;
- planos comerciais;
- múltiplas unidades por cliente;
- white-label;
- relatórios avançados.