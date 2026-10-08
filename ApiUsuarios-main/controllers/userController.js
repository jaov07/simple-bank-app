import { inserirUsuarioComConta, listarUsuarios, buscarUsuarioPorId, deletarUsuarioPorId, atualizarUsuarioPorId, buscarUsuarioPorEmail } from '../model/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
export const postUsuario = async (req, res) => {
    try {
        const { nome, senha, email } = req.body;
        if (!nome || !senha || !email) {
            return res.status(400).json({ mensagem: "Dados Inválidos" })
        }
        const emailExistente = await buscarUsuarioPorEmail(email);
        if (emailExistente.length > 0) {
            return res.status(409).json({ mensagem: "Email já cadastrado" })

        }
        const senhaHash = await bcrypt.hash(senha, 10);
        const usuarioId = await inserirUsuarioComConta(nome, senhaHash, email);
        const token = jwt.sign({ id: usuarioId }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token });
    } catch (erro) {
        console.log(erro);
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
    const { nome, email, senha } = req.body
    try {
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({ mensagem: "Id Inválido" })
        }
        if (id !== req.usuarioId) {
            return res.status(403).json({ mensagem: "Sem permissão" })
        }
        if (!nome || !email || !senha) {
            return res.status(400).json({ mensagem: "Dados Inválidos" })
        }

        const usuario = await buscarUsuarioPorId(id)
        if (usuario.length === 0) {
            return res.status(404).json({ mensagem: "Usuário não encontrado" })
        }

        const senhaHash = await bcrypt.hash(senha, 10)
        await atualizarUsuarioPorId(id, nome, email, senhaHash)
        const [atualizado] = await buscarUsuarioPorId(id)
        return res.status(200).json(atualizado)
    } catch (erro) {
        console.log(erro)
        return res.status(500).json({ mensagem: "Erro Interno" })
    }
};

export const executaLogin = async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ mensagem: "email e senha são obrigatórios" });
        }

        const usuarios = await buscarUsuarioPorEmail(email);
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