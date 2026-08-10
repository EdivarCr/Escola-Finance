┌─────────────────┐
│   RESPONSAVEL   │
├─────────────────┤
│ PK id           │
│ nome            │
│ email           │
│ telefone        │
│ endereco        │
│ senha_hash      │
└────────┬────────┘
         │
         │ 1
         │
         │ N
┌────────▼────────┐
│      ALUNO      │
├─────────────────┤
│ PK id           │
│ FK responsavel  │
│ matricula       │
│ nome            │
│ serie           │
│ tipo_escola     │
│ valor_padrao    │
│ data_matricula  │
│ ativo           │
└────────┬────────┘
         │
         │ 1
         │
         │ N
┌────────▼──────────────┐
│     MENSALIDADE       │
├───────────────────────┤
│ PK id                 │
│ FK aluno_id           │
│ competencia           │
│ valor_original        │
│ valor_cobrado         │
│ data_vencimento       │
│ status                │
│ observacao            │
└──────────┬────────────┘
           │
           │ 1
           │
           │ N
┌──────────▼────────────┐
│      PAGAMENTO        │
├───────────────────────┤
│ PK id                 │
│ FK mensalidade_id     │
│ FK registrado_por     │──────┐
│ valor_pago            │      │
│ data_pagamento        │      │
│ forma_pagamento       │      │
│ status                │      │
│ observacao            │      │
└───────────────────────┘      │
                               │
                        ┌──────▼──────┐
                        │    ADMIN    │
                        ├─────────────┤
                        │ PK id       │
                        │ nome        │
                        │ email       │
                        │ senha_hash  │
                        └──────┬──────┘
                               │
                               │ 1
                               │
                               │ N
                        ┌──────▼──────┐
                        │   DESPESA   │
                        ├─────────────┤
                        │ PK id       │
                        │ FK admin_id │
                        │ descricao   │
                        │ categoria   │
                        │ valor       │
                        │ data        │
                        │ observacao  │
                        └─────────────┘


Mensalidade
R$ 300
Vencimento: 10/08
Status: PENDENTE
        ↓
Responsável realiza PIX/dinheiro/etc.
        ↓
Na área do responsável:
[Informar pagamento]
        ↓
Informa:
- data do pagamento
- forma de pagamento
- comprovante (opcional ou obrigatório)
        ↓
Pagamento:
AGUARDANDO_CONFIRMACAO
        ↓
Admin verifica
       ↙          ↘
 CONFIRMAR       REJEITAR
    ↓               ↓
CONFIRMADO       REJEITADO
    ↓
Mensalidade = PAGA


PAGAMENTO
--------------------------------
id                      PK
mensalidade_id          FK

valor
forma_pagamento
data_pagamento

status
comprovante_url

informado_em

confirmado_por          FK → Admin, NULL
confirmado_em           NULL

rejeitado_em            NULL
motivo_rejeicao         NULL

created_at
updated_at