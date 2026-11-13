import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import jwt from 'jsonwebtoken';
import { configurarTestes } from './helpers/ambiente.js';
import { criarUsuarioLogado, requisitar } from './helpers/cliente.js';

configurarTestes();

describe('autenticação', () => {
    it('recusa requisição sem token', async () => {
        const resposta = await requisitar('/users/saldo');

        assert.equal(resposta.status, 401);
        assert.equal(resposta.corpo.codigo, 'TOKEN_NAO_ENVIADO');
    });

    it('recusa header com formato diferente de "Bearer <token>"', async () => {
        const resposta = await requisitar('/users/saldo', {
            cabecalhos: { Authorization: 'Basic abc' }
        });

        assert.equal(resposta.status, 401);
        assert.equal(resposta.corpo.codigo, 'TOKEN_MALFORMADO');
    });

    it('recusa token com assinatura inválida', async () => {
        const tokenFalso = jwt.sign({ id: 1 }, 'outro-segredo', { expiresIn: '1h' });
        const resposta = await requisitar('/users/saldo', { token: tokenFalso });

        assert.equal(resposta.status, 401);
        assert.equal(resposta.corpo.codigo, 'TOKEN_INVALIDO');
    });

    it('recusa token expirado', async () => {
        const tokenExpirado = jwt.sign({ id: 1 }, process.env.JWT_SECRET, { expiresIn: '-1h' });
        const resposta = await requisitar('/users/saldo', { token: tokenExpirado });

        assert.equal(resposta.status, 401);
        assert.equal(resposta.corpo.codigo, 'TOKEN_INVALIDO');
    });

    it('rejeita senha errada sem revelar se o e-mail existe', async () => {
        await criarUsuarioLogado({ email: 'ana@teste.com' });

        const senhaErrada = await requisitar('/users/login', {
            metodo: 'POST',
            corpo: { email: 'ana@teste.com', senha: 'senha-errada' }
        });
        const emailInexistente = await requisitar('/users/login', {
            metodo: 'POST',
            corpo: { email: 'ninguem@teste.com', senha: 'senha-errada' }
        });

        assert.equal(senhaErrada.status, 401);
        assert.equal(emailInexistente.status, 401);
        assert.equal(senhaErrada.corpo.mensagem, emailInexistente.corpo.mensagem);
        assert.equal(senhaErrada.corpo.codigo, 'CREDENCIAIS_INVALIDAS');
    });

    it('devolve token válido no login correto', async () => {
        const { token } = await criarUsuarioLogado();

        const dados = jwt.verify(token, process.env.JWT_SECRET);
        assert.ok(dados.id > 0);
    });
});
