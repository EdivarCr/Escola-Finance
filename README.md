# 🏫 Escola Finance - Gerenciador de Escola de Reforço

Um MVP (Minimum Viable Product) voltado para a gestão financeira e administrativa de escolas de reforço. O sistema foi projetado para modernizar o controle de mensalidades, emissão de recibos e a saúde financeira do negócio, com uma arquitetura escalável que permite futura evolução para um modelo SaaS (Software as a Service).

## 🎯 Objetivos do Projeto

Este projeto nasceu de uma necessidade real (facilitar a gestão da escola de reforço da minha sogra) aliada ao propósito de **aprimorar conhecimentos técnicos e práticos** nas seguintes áreas:

- **Engenharia de Software & Arquitetura**: Práticas avançadas de desenvolvimento.
- **NestJS**: Construção de um backend robusto e escalável.
- **TDD (Test-Driven Development)**: Garantia de qualidade e confiabilidade através de testes.
- **SDD (Spec-Driven Development)** e **Escrita de Specs**: Planejamento e desenvolvimento guiado por especificações claras.
- **Prompt Engineering e Inteligência Artificial**: Uso de IA no fluxo de desenvolvimento para otimização de código e arquitetura.

## 🚀 Funcionalidades Principais (MVP)

- 💰 **Controle de Mensalidades**: Acompanhamento de pagamentos pendentes, atrasados e quitados.
- 🧾 **Emissão de Recibos**: Geração automática de recibos de pagamento para os alunos/responsáveis.
- 📊 **Controle Financeiro**: Visão geral do fluxo de caixa e gestão de pagamentos.

## 🛠️ Tecnologias Utilizadas

A stack do projeto foi baseada na estrutura do repositório para proporcionar uma fundação sólida, moderna e alinhada com padrões de mercado:

- **[NestJS](https://nestjs.com/)**: Framework Node.js para o backend (TypeScript).
- **[Prisma ORM](https://www.prisma.io/)**: Modelagem e interação com o banco de dados (configurado no diretório `prisma/`).
- **[Docker](https://www.docker.com/)**: Containerização da aplicação e do banco de dados configurado no `compose.yaml`.
- **[Jest](https://jestjs.io/)**: Framework de testes para garantir a cobertura do TDD (configurado via `jest-e2e.json` e arquivos `.spec.ts`).

## 📂 Estrutura do Projeto

A base do repositório está organizada da seguinte forma:
- `apps/api/`: Aplicação principal em NestJS.
- `apps/api/prisma/`: Arquivos de configuração, migrações e `schema.prisma`.
- `apps/api/src/`: Código-fonte da API, incluindo Controladores, Módulos e Serviços (`app.controller.ts`, `app.service.ts`, `main.ts`).
- `apps/api/test/`: Testes automatizados E2E e unitários.
- `compose.yaml`: Configuração dos containers via Docker Compose.
- `Diagrama.md`: Documentação inicial da estrutura de dados/arquitetura.

## ⚙️ Como Executar o Projeto

### Pré-requisitos
- Node.js (v18+)
- Docker e Docker Compose

### Passos para rodar localmente

1. **Clone o repositório e acesse a pasta da API:**
   ```bash
   cd apps/api
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Suba os serviços via Docker:**
   ```bash
   docker compose up -d
   ```

4. **Execute as migrations do Prisma para o banco de dados:**
   ```bash
   npx prisma migrate dev
   ```

5. **Inicie a aplicação em ambiente de desenvolvimento:**
   ```bash
   npm run start:dev
   ```

## 👨‍💻 Autor

**Edivar Cruz Carvalho Filho**  
*Estudante de Engenharia de Software na UFC*  
Focado na criação de soluções reais através de código limpo, arquitetura escalável e engenharia de software aplicada.
