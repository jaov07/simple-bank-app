import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PASTA_MIGRACOES = path.join(RAIZ, 'database', 'migrations');

const configuracaoBase = () => ({
    host: process.env.DBHOST,
    port: Number(process.env.DBPORT),
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD
});

const lerArquivo = (caminho) => fs.readFile(path.join(RAIZ, caminho), 'utf8');

async function listarMigracoes() {
    const arquivos = await fs.readdir(PASTA_MIGRACOES).catch(() => []);
    return arquivos.filter((nome) => nome.endsWith('.sql')).sort();
}

async function bancoExiste(conexao, nome) {
    const [linhas] = await conexao.query(
        'SELECT 1 FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?',
        [nome]
    );
    return linhas.length > 0;
}

async function registrarMigracoes(conexao, nomes) {
    for (const nome of nomes) {
        await conexao.query('INSERT IGNORE INTO migracoes (nome) VALUES (?)', [nome]);
    }
}

/**
 * Cria/atualiza o banco configurado em DATABASENAME.
 *
 * - banco novo: aplica database/schema.sql e marca as migrations como já refletidas
 * - banco existente: aplica somente as migrations pendentes
 * - baseline: registra as migrations sem aplicar (para bancos anteriores ao runner)
 */
export async function prepararBanco({ recriar = false, baseline = false } = {}) {
    const nomeBanco = process.env.DATABASENAME;

    if (!nomeBanco) {
        throw new Error('DATABASENAME não configurado no .env');
    }

    const migracoes = await listarMigracoes();
    const conexaoBase = await mysql.createConnection({ ...configuracaoBase(), multipleStatements: true });

    let bancoNovo;
    try {
        bancoNovo = !(await bancoExiste(conexaoBase, nomeBanco));

        if (recriar) {
            await conexaoBase.query(`DROP DATABASE IF EXISTS \`${nomeBanco}\``);
            bancoNovo = true;
        }

        await conexaoBase.query(
            `CREATE DATABASE IF NOT EXISTS \`${nomeBanco}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
        );
    } finally {
        await conexaoBase.end();
    }

    const conexao = await mysql.createConnection({
        ...configuracaoBase(),
        database: nomeBanco,
        multipleStatements: true
    });

    try {
        const [tabelas] = await conexao.query(
            "SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'migracoes'",
            [nomeBanco]
        );
        const runnerJaExistia = tabelas.length > 0;

        await conexao.query(`
            CREATE TABLE IF NOT EXISTS migracoes (
                nome VARCHAR(255) NOT NULL,
                aplicada_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (nome)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        if (bancoNovo) {
            await conexao.query(await lerArquivo('database/schema.sql'));
            await registrarMigracoes(conexao, migracoes);
            return { banco: nomeBanco, modo: 'criado' };
        }

        if (baseline) {
            await registrarMigracoes(conexao, migracoes);
            return { banco: nomeBanco, modo: 'baseline' };
        }

        if (!runnerJaExistia) {
            throw new Error(
                `O banco "${nomeBanco}" já existia antes do runner de migrations. ` +
                    'Rode uma vez com --baseline para registrar o estado atual e depois use db:setup normalmente.'
            );
        }

        const [aplicadas] = await conexao.query('SELECT nome FROM migracoes');
        const nomesAplicados = new Set(aplicadas.map((linha) => linha.nome));
        const pendentes = migracoes.filter((nome) => !nomesAplicados.has(nome));

        for (const nome of pendentes) {
            await conexao.query(await lerArquivo(path.join('database', 'migrations', nome)));
            await registrarMigracoes(conexao, [nome]);
        }

        return { banco: nomeBanco, modo: 'atualizado', aplicadas: pendentes };
    } finally {
        await conexao.end();
    }
}
