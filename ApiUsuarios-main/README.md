# API de Usuários

API REST para cadastro e autenticação de usuários, feita com Node.js, Express e MySQL. Tem login com JWT, senhas criptografadas e rotas protegidas: cada usuário só consegue editar ou apagar a própria conta.

**API online:** https://apiusuarios-h9bg.onrender.com

> A API roda em um plano gratuito e "adormece" quando fica sem uso. A primeira requisição pode demorar cerca de um minuto.

## Tecnologias

- Node.js (ES Modules)
- Express
- MySQL (`mysql2` com promises)
- JWT (`jsonwebtoken`) para autenticação
- bcrypt para criptografar senhas
- dotenv para variáveis de ambiente

## Estrutura do projeto

```
├── controllers/     # lógica de cada rota
├── database/        # conexão com o MySQL
├── middlewares/     # verificação do token JWT
├── model/           # consultas SQL
├── routes/          # definição das rotas
├── .env.example     # modelo das variáveis de ambiente
└── server.js        # ponto de entrada
```

## Como rodar localmente

**1. Clone o repositório**

```bash
git clone https://github.com/jaov07/ApiUsuarios.git
cd ApiUsuarios
```

**2. Instale as dependências**

```bash
npm install
```

**3. Crie o banco de dados**

No MySQL, rode:

```sql
CREATE DATABASE IF NOT EXISTS projeto_github;
USE projeto_github;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
);
```

**4. Configure as variáveis de ambiente**

Copie o `.env.example` para `.env` e preencha com os seus dados:

```
DBHOST=
DBPORT=
DBUSER=
DBPASSWORD=
DATABASENAME=
JWT_SECRET=
```
**5. Se quiser popular o banco de dados com dados falsos para fins de teste**
```bash
  npm run seed
```


**6. Inicie o servidor**

```bash
npm start
```

A API sobe em `http://localhost:3000`.

## Rotas

| Método | Rota | Protegida? | Descrição |
|---|---|---|---|
| POST | `/users` | Não | Cadastra um usuário |
| POST | `/login` | Não | Faz login e devolve um token |
| GET | `/users` | Sim | Lista os usuários |
| GET | `/users/:id` | Sim | Busca um usuário pelo id |
| PUT | `/users/:id` | Sim (só o próprio) | Atualiza o usuário |
| DELETE | `/users/:id` | Sim (só o próprio) | Apaga o usuário |

### Como usar o token

Nas rotas protegidas, envie o token no header `Authorization`:

```
Authorization: Bearer seu_token_aqui
```

O token expira em 1 hora. Depois disso, faça login de novo.

## Exemplos

### Cadastrar usuário

`POST /users`

```json
{
  "nome": "Ana",
  "estado": "SP",
  "email": "ana@email.com",
  "senha": "123456"
}
```

Resposta (`201`):

```json
{
  "id": 1,
  "nome": "Ana",
  "estado": "SP",
  "email": "ana@email.com"
}
```

### Login

`POST /login`

```json
{
  "email": "ana@email.com",
  "senha": "123456"
}
```

Resposta (`200`):

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

### Listar usuários

`GET /users` com o header `Authorization: Bearer <token>`

Resposta (`200`):

```json
[
  { "id": 1, "nome": "Ana", "estado": "SP" }
]
```

### Atualizar usuário

`PUT /users/1` com o header `Authorization: Bearer <token>`

```json
{
  "nome": "Ana Souza",
  "estado": "RJ",
  "senha": "novaSenha123"
}
```

### Apagar usuário

`DELETE /users/1` com o header `Authorization: Bearer <token>`

Resposta (`200`):

```json
{ "mensagem": "Usuário deletado com sucesso" }
```

## Códigos de resposta

| Código | Significado |
|---|---|
| 200 | Deu certo |
| 201 | Usuário criado |
| 400 | Dados ou id inválidos |
| 401 | Sem login, token inválido/expirado ou email/senha incorretos |
| 403 | Logado, mas sem permissão para mexer nessa conta |
| 404 | Usuário não encontrado |
| 500 | Erro interno do servidor |

## Segurança

- As senhas são salvas com hash (bcrypt) e nunca aparecem nas respostas.
- O `.env` não vai para o GitHub. Use o `.env.example` como modelo.
- O login devolve a mesma mensagem para email inexistente e senha errada, para não revelar quais emails estão cadastrados.

## Próximos passos

- [ ] Testes automáticos
- [ ] Validação mais completa de email e senha
- [ ] Retornar `409` ao cadastrar email repetido
- [ ] Documentação com Swagger

## Autor

Feito por [@jaov07](https://github.com/jaov07).
