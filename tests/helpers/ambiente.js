import { after, before, beforeEach } from 'node:test';
import { once } from 'node:events';
import mysql from 'mysql2/promise';
import app from '../../app.js';
import conexao from '../../database/conexao.js';
import { prepararBanco } from '../../database/preparar.js';

let servidor;
let urlBase;

const conectar = () =>
    mysql.createConnection({
        host: process.env.DBHOST,
        port: Number(process.env.DBPORT),
        user: process.env.DBUSER,
        password: process.env.DBPASSWORD,
        database: process.env.DATABASENAME
    });

// Cada arquivo de teste roda em um processo próprio (node --test) e recria o
// banco do zero, então o schema.sql é sempre validado de verdade.
async function limparBanco() {
    const con = await conectar();
    try {
        await con.query('SET FOREIGN_KEY_CHECKS = 0');
        for (const tabela of ['transacoes', 'contas', 'usuarios']) {
            await con.query(`TRUNCATE TABLE ${tabela}`);
        }
        await con.query('SET FOREIGN_KEY_CHECKS = 1');
    } finally {
        await con.end();
    }
}

export function configurarTestes() {
    before(async () => {
        await prepararBanco({ recriar: true });

        servidor = app.listen(0, '127.0.0.1');
        await once(servidor, 'listening');
        urlBase = `http://127.0.0.1:${servidor.address().port}`;
    });

    beforeEach(limparBanco);

    after(async () => {
        if (servidor) {
            await new Promise((resolver) => servidor.close(resolver));
        }
        await conexao.end();
    });
}

export const baseDaApi = () => urlBase;
