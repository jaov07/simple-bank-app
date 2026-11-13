import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { configurarTestes } from './helpers/ambiente.js';
import { criarUsuarioLogado, depositar, requisitar } from './helpers/cliente.js';

configurarTestes();

describe('extrato', () => {
    it('começa vazio com saldo zero', async () => {
        const ana = await criarUsuarioLogado();

        const resposta = await requisitar('/users/extrato', { token: ana.token });

        assert.equal(resposta.status, 200);
        assert.equal(resposta.corpo.saldo, 0);
        assert.deepEqual(resposta.corpo.transacoes, []);
    });

    it('lista da transação mais recente para a mais antiga', async () => {
        const ana = await criarUsuarioLogado();

        await depositar(ana.token, 10);
        await depositar(ana.token, 20);
        await requisitar('/users/saque', {
            metodo: 'POST',
            token: ana.token,
            corpo: { valor: 5 }
        });

        const resposta = await requisitar('/users/extrato', { token: ana.token });
        const tipos = resposta.corpo.transacoes.map((t) => t.tipo);

        assert.deepEqual(tipos, ['saque', 'deposito', 'deposito']);
        assert.equal(resposta.corpo.transacoes[0].valor, 5);
        assert.equal(resposta.corpo.saldo, 25);
    });

    it('mostra o nome da outra pessoa nas transferências', async () => {
        const ana = await criarUsuarioLogado({ email: 'ana@teste.com' });
        await criarUsuarioLogado({ nome: 'Beatriz Lima', email: 'bea@teste.com' });
        await depositar(ana.token, 50);

        await requisitar('/users/transferencia', {
            metodo: 'POST',
            token: ana.token,
            corpo: { emailDestino: 'bea@teste.com', valor: 10 }
        });

        const resposta = await requisitar('/users/extrato', { token: ana.token });

        assert.equal(resposta.corpo.transacoes[0].outra_pessoa, 'Beatriz Lima');
        assert.equal(resposta.corpo.transacoes[1].outra_pessoa, null);
    });
});
