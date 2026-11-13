import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { configurarTestes } from './helpers/ambiente.js';
import { criarUsuarioLogado, depositar, requisitar } from './helpers/cliente.js';

configurarTestes();

const transferir = (token, emailDestino, valor) =>
    requisitar('/users/transferencia', {
        metodo: 'POST',
        token,
        corpo: { emailDestino, valor }
    });

describe('transferência', () => {
    it('debita da origem, credita no destino e registra os dois lançamentos', async () => {
        const ana = await criarUsuarioLogado({ email: 'ana@teste.com' });
        const carlos = await criarUsuarioLogado({ nome: 'Carlos Souza', email: 'carlos@teste.com' });

        await depositar(ana.token, 100);
        const resposta = await transferir(ana.token, 'carlos@teste.com', 40.25);

        assert.equal(resposta.status, 200);
        assert.equal(resposta.corpo.saldo, 59.75);
        assert.deepEqual(resposta.corpo.destino, {
            nome: 'Carlos Souza',
            email: 'carlos@teste.com'
        });

        const extratoCarlos = await requisitar('/users/extrato', { token: carlos.token });
        assert.equal(extratoCarlos.corpo.saldo, 40.25);
        assert.equal(extratoCarlos.corpo.transacoes[0].tipo, 'transferencia_recebida');
        assert.equal(extratoCarlos.corpo.transacoes[0].outra_pessoa, 'Ana Silva');
    });

    it('recusa transferência para si mesmo', async () => {
        const ana = await criarUsuarioLogado({ email: 'ana@teste.com' });
        await depositar(ana.token, 100);

        const resposta = await transferir(ana.token, 'ana@teste.com', 10);

        assert.equal(resposta.status, 400);
        assert.equal(resposta.corpo.codigo, 'TRANSFERENCIA_PARA_SI_MESMO');
    });

    it('recusa destinatário inexistente', async () => {
        const ana = await criarUsuarioLogado({ email: 'ana@teste.com' });
        await depositar(ana.token, 100);

        const resposta = await transferir(ana.token, 'ninguem@teste.com', 10);

        assert.equal(resposta.status, 404);
        assert.equal(resposta.corpo.codigo, 'DESTINATARIO_NAO_ENCONTRADO');
    });

    it('recusa e-mail de destino inválido', async () => {
        const ana = await criarUsuarioLogado({ email: 'ana@teste.com' });
        await depositar(ana.token, 100);

        const resposta = await transferir(ana.token, 'sem-arroba', 10);

        assert.equal(resposta.status, 400);
        assert.equal(resposta.corpo.codigo, 'EMAIL_DESTINO_INVALIDO');
    });

    it('não mexe em nenhum saldo quando falta saldo (rollback)', async () => {
        const ana = await criarUsuarioLogado({ email: 'ana@teste.com' });
        const carlos = await criarUsuarioLogado({ email: 'carlos@teste.com' });
        await depositar(ana.token, 20);

        const resposta = await transferir(ana.token, 'carlos@teste.com', 20.01);

        const extratoAna = await requisitar('/users/extrato', { token: ana.token });
        const extratoCarlos = await requisitar('/users/extrato', { token: carlos.token });

        assert.equal(resposta.status, 400);
        assert.equal(resposta.corpo.codigo, 'SALDO_INSUFICIENTE');
        assert.equal(extratoAna.corpo.saldo, 20);
        assert.equal(extratoAna.corpo.transacoes.length, 1);
        assert.equal(extratoCarlos.corpo.saldo, 0);
        assert.equal(extratoCarlos.corpo.transacoes.length, 0);
    });

    it('dois débitos simultâneos não estouram o saldo', async () => {
        const ana = await criarUsuarioLogado({ email: 'ana@teste.com' });
        const carlos = await criarUsuarioLogado({ email: 'carlos@teste.com' });
        await depositar(ana.token, 100);

        const [primeira, segunda] = await Promise.all([
            transferir(ana.token, 'carlos@teste.com', 70),
            transferir(ana.token, 'carlos@teste.com', 70)
        ]);

        const aceitas = [primeira, segunda].filter((r) => r.status === 200);

        assert.equal(aceitas.length, 1);
        assert.equal(aceitas[0].corpo.saldo, 30);
    });
});
