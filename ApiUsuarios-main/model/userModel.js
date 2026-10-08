import conexao from '../database/conexao.js';

export const inserirUsuario = async (nome, estado, senha, email) => {
    const sql = "INSERT INTO users (nome, estado, senha, email) VALUES (?, ?, ?, ?)";
    const [resultado] = await conexao.query(sql, [nome, estado, senha, email]);
    return resultado;
};

export const listarUsuarios = async () => {
    const [linhas] = await conexao.query("SELECT id, nome, estado FROM users");
    return linhas;
};

export const buscarUsuarioPorId = async (id) => {
    const sql = "SELECT id, nome, estado FROM users WHERE id = ?";
    const [linhas] = await conexao.query(sql, [id]);
    return linhas;
};

export const deletarUsuarioPorId = async (id) => {
    const sql = "DELETE FROM users WHERE id = ?"
    const [linhas] = await conexao.query(sql, [id]);
    return linhas
};

export const atualizarUsuarioPorId = async (id, nome, estado, senhaHash) => {
    const sql = "UPDATE users SET nome = ?, estado = ?, senha = ?, email = ? WHERE id = ?";
    const [linhas] = await conexao.query(sql, [nome, estado, senhaHash, id]);
    return linhas;
};

export const buscarUsuarioPorEmail = async (email) => {
    const sql = "SELECT id, nome, estado, senha FROM users WHERE email = ?";
    const [linhas] = await conexao.query(sql, [email]);
    return linhas;
};