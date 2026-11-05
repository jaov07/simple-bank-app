# SimpleBank API

API de banco simples feita com **Node.js**, **Express 5** e **MySQL**, com autenticação via **JWT** e senhas criptografadas com **bcrypt**.

## Tecnologias

- Node.js (ES Modules)
- Express 5
- MySQL (`mysql2/promise`)
- JWT (`jsonwebtoken`)
- bcrypt
- Swagger (`swagger-autogen` + `swagger-ui-express`)

## Estrutura

```
controllers/       regras de entrada/saída das requisições
database/          conexão com o MySQL, schema.sql e migrations
middlewares/       autenticação JWT
model/             consultas SQL e transações
routes/            definição das rotas
server.js          inicialização do servidor
seed.js            popula o banco com usuários de teste
swagger.js         gera a documentação
```

## Como rodar

### 1. Pré-requisitos

- Node.js 18+
- MySQL 8+

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar o ambiente

Copie `.env.example` para `.env` e preencha:

```env
DBHOST=localhost
DBPORT=3306
DBUSER=root
DBPASSWORD=sua_senha
DATABASENAME=simplebank
JWT_SECRET=uma_chave_bem_segura
PORT=3000

# Opcional (padrão: permite todas as origens)
CORS_ORIGIN=http://localhost:5173
```

### 4. Criar as tabelas

```bash
mysql -u <usuario> -p -e "CREATE DATABASE simplebank CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u <usuario> -p simplebank < database/schema.sql
```

> O arquivo `database/schema.sql` cria `usuarios`, `contas` e `transacoes`, com as chaves estrangeiras em `ON DELETE CASCADE`/`SET NULL` e valores monetários em `DECIMAL(15,2)`.

### 4.1. Atualizando um banco já existente

Se o banco foi criado antes destas correções (saldo/valor como `BIGINT` e sem cascade), rode a migration uma única vez:

```bash
mysql -u <usuario> -p simplebank < database/migrations/001_saldo_decimal_e_cascade.sql
```

### 5. Popular o banco (opcional)

```bash
npm run seed
```

Usuários criados (senha `123456`):

| Nome | E-mail |
|---|---|
| Ana Silva | ana@teste.com |
| Carlos Souza | carlos@teste.com |
| Beatriz Lima | bea@teste.com |

### 6. Subir o servidor

```bash
npm start       # produção
npm run dev     # desenvolvimento (watch)
```

Documentação: `http://localhost:3000/docs`

Para regenerar a documentação após alterar rotas:

```bash
npm run swagger
```

## Autenticação

Rotas protegidas exigem o header:

```
Authorization: Bearer <token>
```

O token é retornado no cadastro (`POST /users`) e no login (`POST /users/login`) e expira em 1 hora.

## Endpoints

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| POST | `/users` | Não | Cadastro (cria usuário + conta) |
| POST | `/users/login` | Não | Login, retorna o token |
| GET | `/users` | Sim | Lista usuários |
| GET | `/users/saldo` | Sim | Saldo da conta do usuário logado |
| POST | `/users/deposito` | Sim | Deposita um valor na própria conta |
| GET | `/users/:id` | Sim | Busca usuário por ID |
| PUT | `/users/:id` | Sim | Atualiza o próprio usuário |
| DELETE | `/users/:id` | Sim | Deleta o próprio usuário |

### Exemplos

**Cadastro**

```http
POST /users
Content-Type: application/json

{
  "nome": "Ana Silva",
  "email": "ana@teste.com",
  "senha": "123456"
}
```

Resposta `201`:

```json
{ "token": "..." }
```

**Login**

```http
POST /users/login
Content-Type: application/json

{
  "email": "ana@teste.com",
  "senha": "123456"
}
```

**Depósito**

```http
POST /users/deposito
Authorization: Bearer <token>
Content-Type: application/json

{ "valor": 150.75 }
```

Resposta `200`:

```json
{ "saldo": 150.75 }
```

## Regras de validação

- `nome`: obrigatório e não vazio
- `email`: formato válido e único (normalizado para minúsculas)
- `senha`: mínimo de 6 caracteres
- `valor` do depósito: número maior que zero, com até 2 casas decimais

## Observações

- O cadastro e o depósito usam transações no banco (`BEGIN`/`COMMIT`/`ROLLBACK`).
- O saldo é `DECIMAL(15,2)` e é retornado como número.
- O CORS pode ser restringido pela variável `CORS_ORIGIN`.
- Para produção, recomenda-se também usar `helmet`, rate limiting e HTTPS.
