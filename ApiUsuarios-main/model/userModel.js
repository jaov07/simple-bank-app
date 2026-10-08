import conexao from '../database/conexao.js';


export const inserirUsuarioComConta = async (nome, senhaHash, email) => {
    const con = await conexao.getConnection();   // pega uma conexão do pool
    try {
        await con.beginTransaction();            // começa o "tudo ou nada"

        const [resultado] = await con.query(
            "INSERT INTO usuarios (nome, senha, email) VALUES (?, ?, ?)",
            [nome, senhaHash, email]
        );
        const usuarioId = resultado.insertId;    // id do usuário que acabou de ser criado

        
        await con.query("INSERT INTO contas (usuario_id) VALUES (?)", [usuarioId]);

        await con.commit();                      
        return usuarioId;
    } catch (erro) {
        await con.rollback();                    
        throw erro;
    } finally {
        con.release();                           
    }
};

export const listarUsuarios = async () => {
    const [linhas] = await conexao.query("SELECT id, nome FROM usuarios");
    return linhas;
};

export const buscarUsuarioPorId = async (id) => {
    const sql = "SELECT id, nome, email FROM usuarios WHERE id = ?";
    const [linhas] = await conexao.query(sql, [id]);
    return linhas;
};

export const deletarUsuarioPorId = async (id) => {
    const sql = "DELETE FROM usuarios WHERE id = ?";
    const [linhas] = await conexao.query(sql, [id]);
    return linhas;
};


export const atualizarUsuarioPorId = async (id, nome, email, senhaHash) => {
    const sql = "UPDATE usuarios SET nome = ?, email = ?, senha = ? WHERE id = ?";
    const [linhas] = await conexao.query(sql, [nome, email, senhaHash, id]);
    return linhas;
};


export const buscarUsuarioPorEmail = async (email) => {
    const sql = "SELECT id, nome, email, senha FROM usuarios WHERE email = ?";
    const [linhas] = await conexao.query(sql, [email]);
    return linhas;
};