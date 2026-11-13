# SimpleBank

[![CI](https://github.com/jaov07/simple-bank-app/actions/workflows/ci.yml/badge.svg)](https://github.com/jaov07/simple-bank-app/actions/workflows/ci.yml)

API bancária de estudo com **Node.js + Express 5 + MySQL**, autenticação **JWT**, senhas com **bcrypt** e uma SPA em **React** consumindo a API.

> **EN (short):** A small banking API (deposits, withdrawals, transfers, statement) built with Express 5 and MySQL. Money is stored as `DECIMAL(15,2)` and every balance change runs inside a SQL transaction with row locking. Auth is JWT + bcrypt. Includes integration tests, CI, security middleware and a React SPA. Docs are in Portuguese.

---

## O que está implementado

- Cadastro com criação de conta na mesma transação
- Login com JWT (1h de validade)
- Consulta de saldo, extrato e dados do próprio usuário
- Depósito, saque e transferência entre contas
- Extrato com os dois lançamentos de uma transferência (`enviada` / `recebida`) e o nome da outra pessoa
- Frontend SPA com React Router: dashboard, depósito, saque, transferência e extrato
- Tratamento central de sessão expirada no frontend (401 → limpa token → `/login`)

## Stack

| Camada | Tecnologias |
|---|---|
| API | Node.js 22, Express 5, `mysql2/promise`, JWT, bcrypt, helmet, express-rate-limit |
| Banco | MySQL 8 (`DECIMAL(15,2)`, InnoDB, chaves estrangeiras) |
| Docs | Swagger (`swagger-autogen` + `swagger-ui-express`) em `/docs` |
| Frontend | React 19, Vite, React Router |
| Qualidade | `node:test`, ESLint, GitHub Actions |

## Estrutura

```
app.js                  monta o Express (middlewares, rotas, 404, erros)
server.js               valida env e sobe o servidor
routes/                 definição das rotas + anotações do Swagger
controllers/            validação de entrada e tradução para HTTP
model/                  SQL e transações (regra de negócio do dinheiro)
middlewares/            autenticação JWT, rate limit, tratamento de erros
lib/                    erros tipados e logger
database/               conexão, schema.sql, migrations e runner
tests/                  testes de integração da API
scripts/                CLI de preparação do banco
web/                    SPA em React
```

Fluxo de uma requisição: `rota → autenticar → controller (valida) → model (SQL + transação) → controller (resposta)`. Qualquer erro cai no middleware central `middlewares/tratarErros.js`.

## Como rodar

### Opção A — com Docker (MySQL pronto)

```bash
cp .env.example .env      # preencha DBUSER/DBPASSWORD/JWT_SECRET/DATABASENAME
docker compose up -d
npm install
npm run db:setup          # cria o banco e aplica schema + migrations
npm run seed              # cria usuários de teste
npm run dev
```

### Opção B — MySQL já instalado

```bash
cp .env.example .env
npm install
npm run db:setup
npm run seed
npm run dev
```

`npm run db:setup` cria o banco se não existir, aplica `database/schema.sql` e controla as migrations pela tabela `migracoes`.

> Se o banco já existia **antes** do runner de migrations, rode uma vez `npm run db:baseline` e depois `npm run db:setup` normalmente.

### Frontend

```bash
cd web
npm install
npm run dev      # http://localhost:5173 (proxy de /users para a API)
```

API em `http://localhost:3000` (ou o `PORT` do seu `.env`) · Swagger em `/docs`.

### Usuários do seed (senha `123456`)

| Nome | E-mail |
|---|---|
| Ana Silva | ana@teste.com |
| Carlos Souza | carlos@teste.com |
| Beatriz Lima | bea@teste.com |

## Testes

```bash
npm test              # 41 testes de integração
npm run test:watch
npm run test:coverage
npm run lint
```

Os testes sobem o app em uma porta aleatória, **recriam o banco `simplebank_test` a partir do `schema.sql`** e exercitam a API por HTTP. Isso valida de quebra que o schema consegue criar todas as funcionalidades do zero.

As credenciais do MySQL vêm do seu `.env`; o `.env.test` só troca o nome do banco, o segredo do JWT e desliga o rate limit.

Casos cobertos: token ausente/malformado/inválido/expirado, login inválido sem vazar existência de e-mail, validações de cadastro, e-mail duplicado, IDOR (leitura/edição/exclusão de outro usuário), depósito, arredondamento, saque sem saldo, **dois saques simultâneos**, transferência com rollback, destinatário inexistente, extrato ordenado.

## API

Todas as rotas de conta exigem `Authorization: Bearer <token>`.

| Método | Rota | Descrição |
|---|---|---|
| POST | `/users` | Cadastro (cria usuário + conta) |
| POST | `/users/login` | Login, devolve o token |
| GET | `/users` | Dados do próprio usuário |
| GET | `/users/:id` | Dados do próprio usuário (403 para outro id) |
| PUT | `/users/:id` | Atualiza o próprio usuário |
| DELETE | `/users/:id` | Remove o próprio usuário |
| GET | `/users/saldo` | Saldo da conta |
| GET | `/users/extrato` | Saldo + transações |
| POST | `/users/deposito` | `{ "valor": 100.00 }` |
| POST | `/users/saque` | `{ "valor": 50.00 }` |
| POST | `/users/transferencia` | `{ "emailDestino": "...", "valor": 25.00 }` |

### Formato de erro

Toda resposta de erro segue o mesmo contrato (`codigo` é estável para o cliente usar; `mensagem` é para humanos):

```json
{
    "codigo": "SALDO_INSUFICIENTE",
    "mensagem": "Saldo insuficiente"
}
```

| Código | Status |
|---|---|
| `DADOS_INVALIDOS`, `VALOR_INVALIDO`, `EMAIL_DESTINO_INVALIDO`, `TRANSFERENCIA_PARA_SI_MESMO`, `ID_INVALIDO`, `JSON_INVALIDO` | 400 |
| `TOKEN_NAO_ENVIADO`, `TOKEN_MALFORMADO`, `TOKEN_INVALIDO`, `CREDENCIAIS_INVALIDAS` | 401 |
| `SEM_PERMISSAO` | 403 |
| `USUARIO_NAO_ENCONTRADO`, `CONTA_NAO_ENCONTRADA`, `DESTINATARIO_NAO_ENCONTRADO`, `ROTA_NAO_ENCONTRADA` | 404 |
| `EMAIL_JA_CADASTRADO` | 409 |
| `MUITAS_TENTATIVAS` | 429 |
| `ERRO_INTERNO` | 500 |

## Decisões de projeto

**Dinheiro em `DECIMAL(15,2)` e comparação em centavos.** Valores monetários nunca são `FLOAT`. As comparações de saldo convertem para centavos (`Math.round(valor * 100)`) antes de comparar, para evitar erro de ponto flutuante em casos como `0.1 + 0.2`.

**Toda movimentação roda em transação.** Depósito, saque, transferência e cadastro usam `BEGIN`/`COMMIT`/`ROLLBACK`. Se algo falhar no meio, nada é gravado.

**Transferência trava as duas contas em ordem de id.** O `SELECT ... FOR UPDATE` é feito sempre do menor id para o maior. Isso evita que duas transferências cruzadas (A→B e B→A) fiquem travadas esperando uma à outra (deadlock).

**Teste de concorrência de verdade.** Dois saques simultâneos acima do saldo: um passa, o outro recebe 400, e o saldo nunca fica negativo.

**Erros tipados.** O model lança `ErroDominio` (`SALDO_INSUFICIENTE`, `CONTA_NAO_ENCONTRADA`) e o mapeamento para HTTP fica em um único lugar. Controllers não comparam mais strings de mensagem.

**Login não revela e-mails cadastrados.** Com e-mail inexistente, o `bcrypt.compare` roda contra um hash fictício, então o tempo de resposta é o mesmo de uma senha errada.

**Rate limit em login e cadastro** (10 tentativas por IP a cada 15 min, configurável).

**Frontend:** SPA com React Router (sem recarregar a página), tratamento central de 401 no `api.js` e nenhuma dependência além de React + Router.

## Segurança

Implementado: queries 100% parametrizadas, senhas com bcrypt, JWT com expiração, verificação de dono dos recursos (sem IDOR), `helmet` com CSP, rate limit, CORS restringível, erros internos não vazam stack para o cliente.

Não implementado (limitações conscientes para o escopo):

- Token em `localStorage` → exposto a XSS. Em produção, o padrão seria cookie `httpOnly` + `SameSite`, com refresh token e revogação.
- Sem idempotency key: um duplo clique pode gerar duas transferências.
- `DELETE /users/:id` usa `ON DELETE CASCADE` e apaga o histórico da conta. Um banco real usaria *soft delete* e manteria o histórico imutável.
- `GET /users/extrato` não tem paginação.
- Sem auditoria/observabilidade além do logger em JSON.

## Próximos passos

- Paginação no extrato
- Idempotency key nas transferências
- Refresh token + logout no servidor
- Testes de componente no frontend (Vitest + Testing Library)
- Deploy público com usuário de demonstração
- TypeScript na API

## Observações

- `npm audit --omit=dev` está limpo. O único aviso restante é `deepmerge` em `swagger-autogen`, dependência **de desenvolvimento** usada só para gerar o Swagger.
- O frontend não tem testes automatizados; a build é validada no CI.
