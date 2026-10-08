import 'dotenv/config'; 
import conexao from './database/conexao.js'; 
import bcrypt from 'bcrypt';

const popularBanco = async () => {
    try {
        console.log("Populando o banco");

        const senhaPadraoHash = await bcrypt.hash("123456", 10);

        const usuariosFake = [
            { nome: "Ana Silva", estado: "SP", email: "ana@teste.com", senha: senhaPadraoHash },
            { nome: "Carlos Souza", estado: "RJ", email: "carlos@teste.com", senha: senhaPadraoHash },
            { nome: "Beatriz Lima", estado: "MG", email: "bea@teste.com", senha: senhaPadraoHash }
        ];

        
       

        for (const usuario of usuariosFake) {
            await conexao.query(
                "INSERT INTO users (nome, estado, email, senha) VALUES (?, ?, ?, ?)",
                [usuario.nome, usuario.estado, usuario.email, usuario.senha]
            );
        }

        console.log("banco de dados populado com sucesso!");
        process.exit(0);
    } catch (erro) {
        console.error("erro ao popular o banco:", erro);
        process.exit(1);
    }
};

popularBanco();