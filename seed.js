import 'dotenv/config';
import conexao from './database/conexao.js';
import bcrypt from 'bcrypt';
import { buscarUsuarioPorEmail, inserirUsuarioComConta } from './model/userModel.js';

const SENHA_PADRAO = "123456";

const usuariosFake = [
    { nome: "Ana Silva", email: "ana@teste.com" },
    { nome: "Carlos Souza", email: "carlos@teste.com" },
    { nome: "Beatriz Lima", email: "bea@teste.com" }
];

const popularBanco = async () => {
    try {
        console.log("Populando o banco...");

        const senhaPadraoHash = await bcrypt.hash(SENHA_PADRAO, 10);

        for (const usuario of usuariosFake) {
            const existente = await buscarUsuarioPorEmail(usuario.email);

            if (existente.length > 0) {
                console.log(`- ${usuario.email} já existe, pulando.`);
                continue;
            }

            // Cria o usuário e a conta dele na mesma transação.
            const usuarioId = await inserirUsuarioComConta(
                usuario.nome,
                senhaPadraoHash,
                usuario.email
            );

            console.log(`- Usuário ${usuario.nome} (id ${usuarioId}) criado.`);
        }

        console.log("Banco de dados populado com sucesso!");
        console.log(`Login de teste: ${usuariosFake[0].email} / ${SENHA_PADRAO}`);
    } catch (erro) {
        console.error("Erro ao popular o banco:", erro);
        process.exitCode = 1;
    } finally {
        await conexao.end();
    }
};

popularBanco();
