# Spec 002 — Autenticação

## Contexto
Após o cadastro do Owner, é necessário permitir que usuários
cadastrados realizem login de forma segura, recebendo uma credencial
que identifique seu contexto de acesso (usuário, escola e papel).

## Objetivo
Permitir logar em uma conta cadastrada do Owner de forma segura e
consistente, recusando autenticações incorretas.

## Requisitos Funcionais

### RF-002 — Realizar login

O sistema deverá permitir que usuários autenticáveis realizem login
utilizando e-mail e senha.

#### História de usuário

**Como** usuário cadastrado,
**quero** realizar login,
**para** acessar as funcionalidades permitidas para minha conta.

#### Dados de entrada

- email;
- senha.

#### Fluxo correto

#### Fluxo correto

1. Usuário informa e-mail e senha.
2. Sistema localiza o usuário pelo e-mail informado.
3. Sistema verifica a senha informada contra o hash armazenado.
4. Sistema verifica se a conta do usuário está ativa.
5. Sistema cria o contexto de autenticação.
6. Sistema retorna um token de acesso assinado (JWT), contendo o
   contexto de autenticação no payload.

O contexto de autenticação deverá permitir identificar:

- usuário (id);
- escola (id);
- papel.

##### Conta inativa
1. Usuário informa e-mail e senha corretos.
2. Sistema identifica que a conta está com `ativo = false`.
3. Sistema rejeita a autenticação.
4. Sistema retorna erro informando que a conta está inativa
   (diferente do erro genérico de "credenciais inválidas" — aqui
   não há risco de enumeração, pois a existência da conta já é
   irrelevante para um e-mail/senha corretos).

#### Formato da credencial

- Tipo: JWT assinado.
- Tempo de expiração: **360minutios** — sugestão inicial de 1h,
  a confirmar antes da implementação.
- O token não deve conter a senha nem o hash da senha em nenhuma
  hipótese.
- Payload mínimo: id do usuário (`sub`), id da escola (`escolaId`),
  papel (`papel`).

#### Fluxos incorretos

##### Conta inativa
1. Usuário informa e-mail e senha corretos.
2. Sistema identifica que a conta está com `ativo = false`.
3. Sistema rejeita a autenticação.
4. Sistema retorna erro informando que a conta está inativa
   (diferente do erro genérico de "credenciais inválidas" — aqui
   não há risco de enumeração, pois a existência da conta já é
   irrelevante para um e-mail/senha corretos).

##### Usuário inexistente
1. Usuário informa um e-mail não cadastrado.
2. Sistema rejeita a autenticação.
3. Sistema retorna erro genérico de credenciais inválidas (sem
   indicar se o e-mail existe ou não, para evitar enumeração de
   usuários).

##### Senha incorreta
1. Usuário informa e-mail válido, mas senha incorreta.
2. Sistema rejeita a autenticação.
3. Sistema retorna o mesmo erro genérico do cenário anterior
   (usuário inexistente e senha incorreta devem ser
   indistinguíveis pela resposta).

##### Credencial inválida em rota protegida
1. Requisição chega em uma rota protegida sem token, com token
   malformado, com assinatura inválida, ou com token expirado.
2. Sistema rejeita o acesso.
3. Rota protegida não é executada.

##### Usuário sem permissão (autorização)
1. Usuário está autenticado (token válido).
2. Usuário tenta executar uma operação para a qual seu papel não
   tem permissão.
3. Sistema rejeita a operação por autorização, não por autenticação.

### Nota de escopo — acesso entre escolas

O critério "usuários não podem acessar recursos de outra escola" não
é resolvido pelo login em si. Esta spec garante apenas que o token
emitido carrega `escolaId` suficiente para essa verificação ser feita.
A aplicação da regra (comparar `escolaId` do token com o `escolaId`
do recurso acessado) é responsabilidade de cada endpoint/módulo que
expõe recursos vinculados a uma escola, e será coberta pelas specs
desses módulos.

#### Critérios de aceitação

- [ ]  Usuário com e-mail e senha válidos consegue autenticar.
- [ ]  Senha inválida não permite autenticação.
- [ ]  Usuário inexistente não permite autenticação.
- [ ]  Erros de "usuário inexistente" e "senha incorreta" retornam
      resposta indistinguível entre si.
- [ ]  O token gerado não expõe senha nem hash da senha.
- [ ]  O token gerado contém id do usuário, id da escola e papel.
- [ ]  Rotas protegidas exigem token válido para serem acessadas.
- [ ]  Requisição sem token não acessa rota protegida.
- [ ]  Token malformado ou com assinatura inválida não acessa rota
      protegida.
- [ ]  Token expirado não acessa rota protegida.
- [ ]  O backend consegue identificar o usuário autenticado a partir
      do token.
- [ ]  O backend consegue identificar a escola do usuário autenticado
      a partir do token.
- [ ]  O backend consegue identificar o papel do usuário autenticado
      a partir do token.
- [ ]  Conta com `ativo = false` não permite autenticação, mesmo
      com e-mail e senha corretos.
- [ ]  O erro de conta inativa é distinto do erro de credenciais
      inválidas.    

## Funcionalidades relacionadas (roadmap — fora do escopo do RF-002)

As funcionalidades abaixo fazem parte do domínio de autenticação/
autorização de forma mais ampla, mas não fazem parte desta spec.
Cada uma deverá ser tratada como spec própria quando priorizada:

- Refresh token / renovação de sessão.
- Logout / invalidação de token (JWT stateless não possui "logout"
  no servidor por padrão; se necessário, requer spec própria
  definindo estratégia, ex: blacklist de tokens).
- Recuperação de senha ("esqueci minha senha").
- Bloqueio de conta por tentativas de login incorretas (rate
  limiting).
- Verificação/confirmação de e-mail no cadastro.
- Autorização granular por recurso (RBAC completo) — nesta spec,
  apenas o papel (role) é identificado no token; a aplicação da
  regra de autorização é responsabilidade de cada módulo.