import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { configurarTestes } from './helpers/ambiente.js';
import { cadastrarUsuario, criarUsuarioLogado, requisitar } from './helpers/cliente.js';

configurarTestes();

describe('cadastro e dados do usuário', () => {
    it('cria usuário com conta zerada', async () => {
        const cadastro = await cadastrarUsuario();
        assert.equal(cadastro.status, 201);
        assert.ok(cadastro.corpo.token);

        const login = await requisitar('/users/login', {
            metodo: 'POST',
            corpo: { email: 'ana@teste.com', senha: '123456' }
        });
        const saldo = await requisitar('/users/saldo', { token: login.corpo.token });

        assert.equal(saldo.status, 200);
        assert.equal(saldo.corpo.saldo, 0);
    });

    it('recusa cadastro sem nome', async () => {
        const resposta = await cadastrarUsuario({ nome: '   ' });

        assert.equal(resposta.status, 400);
        assert.equal(resposta.corpo.codigo, 'DADOS_INVALIDOS');
    });

    it('recusa e-mail inválido', async () => {
        const resposta = await cadastrarUsuario({ email: 'sem-arroba' });

        assert.equal(resposta.status, 400);
        assert.equal(resposta.corpo.codigo, 'DADOS_INVALIDOS');
    });

    it('recusa senha com menos de 6 caracteres', async () => {
        const resposta = await cadastrarUsuario({ senha: '123' });

        assert.equal(resposta.status, 400);
        assert.equal(resposta.corpo.codigo, 'DADOS_INVALIDOS');
    });

    it('recusa e-mail duplicado', async () => {
        await cadastrarUsuario();
        const resposta = await cadastrarUsuario({ nome: 'Outra Pessoa' });

        assert.equal(resposta.status, 409);
        assert.equal(resposta.corpo.codigo, 'EMAIL_JA_CADASTRADO');
    });

    it('normaliza o e-mail para minúsculas', async () => {
        await cadastrarUsuario({ email: 'Ana.Teste@Email.com' });

        const login = await requisitar('/users/login', {
            metodo: 'POST',
            corpo: { email: 'ana.teste@email.com', senha: '123456' }
        });

        assert.equal(login.status, 200);
    });

    it('listagem devolve apenas o próprio usuário', async () => {
        const ana = await criarUsuarioLogado({ nome: 'Ana Silva', email: 'ana@teste.com' });
        await criarUsuarioLogado({ nome: 'Carlos Souza', email: 'carlos@teste.com' });

        const resposta = await requisitar('/users', { token: ana.token });

        assert.equal(resposta.status, 200);
        assert.equal(resposta.corpo.length, 1);
        assert.equal(resposta.corpo[0].email, 'ana@teste.com');
    });

    it('bloqueia leitura dos dados de outro usuário', async () => {
        const ana = await criarUsuarioLogado({ email: 'ana@teste.com' });
        const carlos = await criarUsuarioLogado({ email: 'carlos@teste.com' });

        const propria = await requisitar(`/users/${ana.id}`, { token: ana.token });
        const alheia = await requisitar(`/users/${carlos.id}`, { token: ana.token });

        assert.equal(propria.status, 200);
        assert.equal(alheia.status, 403);
        assert.equal(alheia.corpo.codigo, 'SEM_PERMISSAO');
    });

    it('bloqueia alteração e exclusão de outro usuário', async () => {
        const ana = await criarUsuarioLogado({ email: 'ana@teste.com' });
        const carlos = await criarUsuarioLogado({ email: 'carlos@teste.com' });

        const alteracao = await requisitar(`/users/${carlos.id}`, {
            metodo: 'PUT',
            token: ana.token,
            corpo: { nome: 'Invasor', email: 'invasor@teste.com', senha: '123456' }
        });
        const exclusao = await requisitar(`/users/${carlos.id}`, {
            metodo: 'DELETE',
            token: ana.token
        });

        assert.equal(alteracao.status, 403);
        assert.equal(exclusao.status, 403);
    });
});
