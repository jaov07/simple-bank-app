import { inserirUsuarioComConta, listarUsuarios, buscarUsuarioPorId, deletarUsuarioPorId, atualizarUsuarioPorId, buscarUsuarioPorEmail, buscarContaPorIdUsuario, depositarDinheiro, transferirDinheiro, sacarDinheiro, obterExtrato } from '../model/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENHA_MINIMA = 6;

const normalizarEmail = (email) => String(email).trim().toLowerCase();

const validarDadosUsuario = ({ nome, senha, email }) => {
    if (typeof nome !== 'string' || !nome.trim()) {
        return "Nome é obrigatório";
    }
    if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
        return "Email inválido";
    }
    if (typeof senha !== 'string' || senha.length < SENHA_MINIMA) {
        return `A senha deve ter no mínimo ${SENHA_MINIMA} caracteres`;
    }
    return null;
};

export const postUsuario = async (req, res) => {
    try {
        const { nome, senha, email } = req.body ?? {};
        const erroValidacao = validarDadosUsuario({ nome, senha, email });
        if (erroValidacao) {
            return res.status(400).json({ mensagem: erroValidacao });
        }

        const emailNormalizado = normalizarEmail(email);
        const emailExistente = await buscarUsuarioPorEmail(emailNormalizado);
        if (emailExistente.length > 0) {
            return res.status(409).json({ mensagem: "Email já cadastrado" })

        }
        const senhaHash = await bcrypt.hash(senha, 10);
        const usuarioId = await inserirUsuarioComConta(nome.trim(), senhaHash, emailNormalizado);
        const token = jwt.sign({ id: usuarioId }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token });
    } catch (erro) {
        console.log(erro);
        if (erro.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ mensagem: "Email já cadastrado" });
        }
        res.status(500).json({ mensagem: "Erro ao inserir usuário" });
    }
};

export const getUsuarios = async (req, res) => {
    try {
        const usuarios = await listarUsuarios();
        res.status(200).json(usuarios);
    } catch (erro) {
        console.log(erro);
        res.status(500).json({ mensagem: "Erro ao listar usuários" });
    }
};
export const getExtrato = async(req, res) =>{
    try {
        const id = req.usuarioId
        if (!Number.isInteger(id) || id <= 0){
            return res.status(400).json({mensagem: "ID Inválido"});
        }
        const extrato = await obterExtrato(id);
        return res.status(200).json(extrato);

    } catch (error) {
        if(error.message == "CONTA_NAO_ENCONTRADA" ){
            return res.status(404).json({mensagem:"Conta não encontrada"})
        }
        return res.status(500).json({mensagem: "Erro interno do servidor"})
        
    }
}





export const getContaPorIdUsuario = async(req, res) =>{
    try{
        const id = req.usuarioId;
        if (!Number.isInteger(id) || id <= 0){
            return res.status(400).json({mensagem: "ID Inválido"});
        }
        const contas = await buscarContaPorIdUsuario(id);
        if(contas.length ===0){
            return res.status(404).json({mensagem:"Conta não encontrada"})
        }

        return res.status(200).json({saldo: contas[0].saldo})

    }catch(erro){
        console.log(erro);
        return res.status(500).json({mensagem:"Erro ao Buscar conta por ID"})

    }
}

export const getUsuarioPorId = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({ mensagem: "ID Inválido" })
        }
        const usuarios = await buscarUsuarioPorId(id);

        if (usuarios.length === 0) {
            return res.status(404).json({ mensagem: "Usuário não encontrado" });
        }
        res.status(200).json(usuarios[0]);
    } catch (erro) {
        res.status(500).json({ mensagem: "Erro ao buscar usuário por ID" });
    }
};





export const deleteUsuarioPorId = async (req, res) => {
    try {
        const id = parseInt(req.params.id)

        if (isNaN(id) || id <= 0) {
            return res.status(400).json({ mensagem: "Id Inválido" });
        }
        if (id !== req.usuarioId) {
            return res.status(403).json({ mensagem: "Sem permissão" });
        }

        const usuarios = await buscarUsuarioPorId(id);
        if (usuarios.length === 0) {
            return res.status(404).json({ mensagem: "Usuário não encontrado" });
        }

        await deletarUsuarioPorId(id);
        res.status(200).json({ mensagem: "Usuário deletado com sucesso" });
    } catch (erro) {
        console.log(erro);
        res.status(500).json({ mensagem: "Erro ao deletar usuário" });
    }
};

export const atualizaUsuarioPorId = async (req, res) => {
    const id = parseInt(req.params.id)
    const { nome, email, senha } = req.body ?? {}
    try {
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({ mensagem: "Id Inválido" })
        }
        if (id !== req.usuarioId) {
            return res.status(403).json({ mensagem: "Sem permissão" })
        }

        const erroValidacao = validarDadosUsuario({ nome, senha, email })
        if (erroValidacao) {
            return res.status(400).json({ mensagem: erroValidacao })
        }

        const usuario = await buscarUsuarioPorId(id)
        if (usuario.length === 0) {
            return res.status(404).json({ mensagem: "Usuário não encontrado" })
        }

        const emailNormalizado = normalizarEmail(email)
        const emailExistente = await buscarUsuarioPorEmail(emailNormalizado)
        if (emailExistente.length > 0 && emailExistente[0].id !== id) {
            return res.status(409).json({ mensagem: "Email já cadastrado" })
        }

        const senhaHash = await bcrypt.hash(senha, 10)
        await atualizarUsuarioPorId(id, nome.trim(), emailNormalizado, senhaHash)
        const [atualizado] = await buscarUsuarioPorId(id)
        return res.status(200).json(atualizado)
    } catch (erro) {
        console.log(erro)
        if (erro.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ mensagem: "Email já cadastrado" })
        }
        return res.status(500).json({ mensagem: "Erro Interno" })
    }
};

export const executaLogin = async (req, res) => {
    try {
        const { email, senha } = req.body ?? {};

        if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim()) || typeof senha !== 'string' || !senha) {
            return res.status(400).json({ mensagem: "email e senha são obrigatórios" });
        }

        const usuarios = await buscarUsuarioPorEmail(normalizarEmail(email));
        if (usuarios.length === 0) {
            return res.status(401).json({ mensagem: "Email ou senha inválidos" });
        }

        const usuario = usuarios[0];
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if (!senhaCorreta) {
            return res.status(401).json({ mensagem: "Email ou senha inválidos" });
        }

        const token = jwt.sign(
            { id: usuario.id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );


        res.status(200).json({ token });
    } catch (erro) {
        console.log(erro);
        res.status(500).json({ mensagem: "Erro interno" });
    }
};

export const postSaque = async(req, res) =>{
    try{
        const usuarioId = req.usuarioId;
        const valor = Number(req.body?.valor)
        
        if(!Number.isFinite(valor) || valor<= 0 || valor > 100000000){
            return res.status(400).json({ mensagem: "Valor inválido" });
        }
        const valorArredondado = Math.round(valor * 100)/ 100;
        if (valorArredondado <= 0){
            return res.status(400).json({mensagem: "Valor inválido"})
        }

        const saldo = await sacarDinheiro(usuarioId, valorArredondado)
        return res.status(200).json({saldo})
        

    }catch(erro){
        console.log(erro);
        if (erro.message === "SALDO_INSUFICIENTE") {
            return res.status(400).json({ mensagem: "Saldo insuficiente" });
        }
        if (erro.message === "CONTA_NAO_ENCONTRADA") {
            return res.status(404).json({ mensagem: "Conta não encontrada" });
        }
        return res.status(500).json({ mensagem: "Erro ao sacar" })
    }

}
export const postDeposito = async (req, res) => {
    try {
        const usuarioId = req.usuarioId;         
        const valor = Number(req.body?.valor);

        if (!Number.isFinite(valor) || valor <= 0 || valor > 100000000) {
            return res.status(400).json({ mensagem: "Valor inválido" });
        }

        
        const valorArredondado = Math.round(valor * 100) / 100;
        if (valorArredondado <= 0) {
            return res.status(400).json({ mensagem: "Valor inválido" });
        }

        const saldo = await depositarDinheiro(usuarioId, valorArredondado);
        return res.status(200).json({ saldo });
    } catch (erro) {
        console.log(erro);
        if (erro.message === "CONTA_NAO_ENCONTRADA") {
            return res.status(404).json({ mensagem: "Conta não encontrada" });
        }
        return res.status(500).json({ mensagem: "Erro ao depositar" });
    }
};

export const postTransferencia = async (req, res) => {
    try {
        const origemUsuarioId = req.usuarioId;
        const { emailDestino, valor } = req.body ?? {};

        const valorNumerico = Number(valor);
        if (!Number.isFinite(valorNumerico) || valorNumerico <= 0 || valorNumerico > 100000000) {
            return res.status(400).json({ mensagem: "Valor inválido" });
        }

        const valorArredondado = Math.round(valorNumerico * 100) / 100;
        if (valorArredondado <= 0) {
            return res.status(400).json({ mensagem: "Valor inválido" });
        }

        if (typeof emailDestino !== 'string' || !EMAIL_REGEX.test(emailDestino.trim())) {
            return res.status(400).json({ mensagem: "Email do destinatário inválido" });
        }

        const destinatarios = await buscarUsuarioPorEmail(normalizarEmail(emailDestino));
        if (destinatarios.length === 0) {
            return res.status(404).json({ mensagem: "Destinatário não encontrado" });
        }

        const destino = destinatarios[0];
        if (destino.id === origemUsuarioId) {
            return res.status(400).json({ mensagem: "Não é possível transferir para si mesmo" });
        }

        const saldo = await transferirDinheiro(origemUsuarioId, destino.id, valorArredondado);

        return res.status(200).json({
            saldo,
            destino: {
                nome: destino.nome,
                email: destino.email
            }
        });
    } catch (erro) {
        if (erro.message === "SALDO_INSUFICIENTE") {
            return res.status(400).json({ mensagem: "Saldo insuficiente" });
        }
        if (erro.message === "CONTA_NAO_ENCONTRADA") {
            return res.status(404).json({ mensagem: "Conta não encontrada" });
        }
        if (erro.message === "TRANSFERENCIA_PARA_SI_MESMO") {
            return res.status(400).json({ mensagem: "Não é possível transferir para si mesmo" });
        }
        console.log(erro);
        return res.status(500).json({ mensagem: "Erro ao transferir" });
    }
};