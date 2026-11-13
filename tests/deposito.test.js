import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { configurarTestes } from './helpers/ambiente.js';
import { criarUsuarioLogado, depositar, requisitar } from './helpers/cliente.js';

configurarTestes();

describe('depósito', () => {
    it('soma o valor ao saldo e registra a transação', async () => {
        const ana = await criarUsuarioLogado();

        const deposito = await depositar(ana.token, 150.75);
        const extrato = await requisitar('/users/extrato', { token: ana.token });

        assert.equal(deposito.status, 200);
        assert.equal(deposito.corpo.saldo, 150.75);
        assert.equal(extrato.corpo.transacoes.length, 1);
        assert.equal(extrato.corpo.transacoes[0].tipo, 'deposito');
        assert.equal(extrato.corpo.transacoes[0].valor, 150.75);
    });

    it('soma depósitos sucessivos', async () => {
        const ana = await criarUsuarioLogado();

        await depositar(ana.token, 10);
        const segundo = await depositar(ana.token, 0.25);

        assert.equal(segundo.corpo.saldo, 10.25);
    });

    it('arredonda para duas casas decimais', async () => {
        const ana = await criarUsuarioLogado();

        const resposta = await depositar(ana.token, 10.999);

        assert.equal(resposta.status, 200);
        assert.equal(resposta.corpo.saldo, 11);
    });

    for (const valor of [0, -10, 'abc', null, 100000001]) {
        it(`recusa valor inválido: ${JSON.stringify(valor)}`, async () => {
            const ana = await criarUsuarioLogado();

            const resposta = await depositar(ana.token, valor);
            const extrato = await requisitar('/users/extrato', { token: ana.token });

            assert.equal(resposta.status, 400);
            assert.equal(resposta.corpo.codigo, 'VALOR_INVALIDO');
            assert.equal(extrato.corpo.saldo, 0);
            assert.equal(extrato.corpo.transacoes.length, 0);
        });
    }
});
