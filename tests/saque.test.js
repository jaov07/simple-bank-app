import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { configurarTestes } from './helpers/ambiente.js';
import { criarUsuarioLogado, depositar, requisitar } from './helpers/cliente.js';

configurarTestes();

const sacar = (token, valor) =>
    requisitar('/users/saque', { metodo: 'POST', token, corpo: { valor } });

describe('saque', () => {
    it('desconta do saldo e registra transação do tipo saque', async () => {
        const ana = await criarUsuarioLogado();
        await depositar(ana.token, 100);

        const saque = await sacar(ana.token, 30.5);
        const extrato = await requisitar('/users/extrato', { token: ana.token });

        assert.equal(saque.status, 200);
        assert.equal(saque.corpo.saldo, 69.5);
        assert.equal(extrato.corpo.transacoes[0].tipo, 'saque');
        assert.equal(extrato.corpo.transacoes[0].valor, 30.5);
    });

    it('permite sacar o saldo inteiro', async () => {
        const ana = await criarUsuarioLogado();
        await depositar(ana.token, 50);

        const saque = await sacar(ana.token, 50);

        assert.equal(saque.status, 200);
        assert.equal(saque.corpo.saldo, 0);
    });

    it('recusa saque maior que o saldo sem alterar nada', async () => {
        const ana = await criarUsuarioLogado();
        await depositar(ana.token, 50);

        const saque = await sacar(ana.token, 50.01);
        const extrato = await requisitar('/users/extrato', { token: ana.token });

        assert.equal(saque.status, 400);
        assert.equal(saque.corpo.codigo, 'SALDO_INSUFICIENTE');
        assert.equal(extrato.corpo.saldo, 50);
        assert.equal(extrato.corpo.transacoes.length, 1);
    });

    it('recusa saque de conta zerada', async () => {
        const ana = await criarUsuarioLogado();

        const saque = await sacar(ana.token, 1);

        assert.equal(saque.status, 400);
        assert.equal(saque.corpo.codigo, 'SALDO_INSUFICIENTE');
    });

    it('nunca deixa o saldo negativo com dois saques simultâneos', async () => {
        const ana = await criarUsuarioLogado();
        await depositar(ana.token, 100);

        const [primeiro, segundo] = await Promise.all([
            sacar(ana.token, 60),
            sacar(ana.token, 60)
        ]);
        const extrato = await requisitar('/users/extrato', { token: ana.token });

        const aceitos = [primeiro, segundo].filter((r) => r.status === 200);
        const recusados = [primeiro, segundo].filter((r) => r.status === 400);

        assert.equal(aceitos.length, 1);
        assert.equal(recusados.length, 1);
        assert.equal(extrato.corpo.saldo, 40);
    });

    for (const valor of [0, -1, 'abc', null]) {
        it(`recusa valor inválido: ${JSON.stringify(valor)}`, async () => {
            const ana = await criarUsuarioLogado();
            await depositar(ana.token, 10);

            const resposta = await sacar(ana.token, valor);

            assert.equal(resposta.status, 400);
            assert.equal(resposta.corpo.codigo, 'VALOR_INVALIDO');
        });
    }
});
