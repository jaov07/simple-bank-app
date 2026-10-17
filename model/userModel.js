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

export const buscarContaPorIdUsuario = async (id)=>{
    const sql = "SELECT saldo FROM contas WHERE id = ?";
    const [linhas] = await conexao.query(sql, [id]);
    return linhas;
}

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


export const depositarDinheiro = async (id, valor)=>{
    
    const con = await conexao.getConnection();
    try{
        con.beginTransaction();
        const [contas] =  await con.query(
            "SELECT id FROM contas WHERE usuario_id = ?",
            [id]
        );
        if (contas.length ===0){
            throw new Error("Conta Não Encontrada");
        }
        const contaId = contas[0].id;

        await con.query(
            "UPDATE contas SET saldo  = saldo + ? WHERE id = ?",
            [valor, contaId]
        )

         await con.query(
            "INSERT INTO transacoes (conta_id, tipo, valor) VALUES (?, 'deposito', ?)",
            [contaId, valor]
        );

         const [linhas] = await con.query(
            "SELECT saldo FROM contas WHERE id = ?",
            [contaId]
        );
        
        await con.commit()
        return linhas[0].saldo
    }catch(erro){
        await  con.rollback();
         throw erro;
    }finally{
        con.release()
    }
}

