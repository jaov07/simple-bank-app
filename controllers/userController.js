import { inserirUsuarioComConta, listarUsuarios, buscarUsuarioPorId, deletarUsuarioPorId, atualizarUsuarioPorId, buscarUsuarioPorEmail, buscarContaPorIdUsuario, depositarDinheiro, transferirDinheiro, sacarDinheiro, obterExtrato } from '../model/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ErroHttp } from '../lib/erros.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENHA_MINIMA = 6;
const VALOR_MAXIMO = 100000000;

// Hash válido de uma senha que ninguém usa. Serve para gastar o mesmo tempo de
// bcrypt quando o e-mail não existe (evita descobrir e-mails cadastrados pelo relógio).
const HASH_FICTICIO = '$2b$10$WUB3bSK7LPi1mnXgbZWQl.7I/9cboy9IdlF/1F4Q0ihWSV3dtJRcK';

const normalizarEmail = (email) => String(email).trim().toLowerCase();

const validarDadosUsuario = ({ nome, senha, email }) => {
    if (typeof nome !== 'string' || !nome.trim()) {
        return 'Nome é obrigatório';
    }
    if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
        return 'Email inválido';
    }
    if (typeof senha !== 'string' || senha.length < SENHA_MINIMA) {
        return `A senha deve ter no mínimo ${SENHA_MINIMA} caracteres`;
    }
    return null;
};

// Valida e arredonda valores monetários em um único lugar:
// antes esse bloco era copiado em depósito, saque e transferência.
const normalizarValor = (valor) => {
    const numero = Number(valor);

    if (!Number.isFinite(numero) || numero <= 0 || numero > VALOR_MAXIMO) {
        throw new ErroHttp(400, 'VALOR_INVALIDO', 'Valor inválido');
    }

    const arredondado = Math.round(numero * 100) / 100;
    if (arredondado <= 0) {
        throw new ErroHttp(400, 'VALOR_INVALIDO', 'Valor inválido');
    }

    return arredondado;
};

const assinarToken = (usuarioId) =>
    jwt.sign({ id: usuarioId }, process.env.JWT_SECRET, { expiresIn: '1h' });

export const postUsuario = async (req, res) => {
    const { nome, senha, email } = req.body ?? {};

    const erroValidacao = validarDadosUsuario({ nome, senha, email });
    if (erroValidacao) {
        throw new ErroHttp(400, 'DADOS_INVALIDOS', erroValidacao);
    }

    const emailNormalizado = normalizarEmail(email);
    const emailExistente = await buscarUsuarioPorEmail(emailNormalizado);
    if (emailExistente.length > 0) {
        throw new ErroHttp(409, 'EMAIL_JA_CADASTRADO', 'Email já cadastrado');
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const usuarioId = await inserirUsuarioComConta(nome.trim(), senhaHash, emailNormalizado);

    res.status(201).json({ token: assinarToken(usuarioId) });
};

export const getUsuarios = async (req, res) => {
    const usuarios = await listarUsuarios();
    res.status(200).json(usuarios);
};

export const getExtrato = async (req, res) => {
    const id = req.usuarioId;
    if (!Number.isInteger(id) || id <= 0) {
        throw new ErroHttp(400, 'ID_INVALIDO', 'ID inválido');
    }

    const extrato = await obterExtrato(id);
    return res.status(200).json(extrato);
};

export const getContaPorIdUsuario = async (req, res) => {
    const id = req.usuarioId;
    if (!Number.isInteger(id) || id <= 0) {
        throw new ErroHttp(400, 'ID_INVALIDO', 'ID inválido');
    }

    const contas = await buscarContaPorIdUsuario(id);
    if (contas.length === 0) {
        throw new ErroHttp(404, 'CONTA_NAO_ENCONTRADA', 'Conta não encontrada');
    }

    return res.status(200).json({ saldo: contas[0].saldo });
};

export const getUsuarioPorId = async (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id) || id <= 0) {
        throw new ErroHttp(400, 'ID_INVALIDO', 'ID inválido');
    }

    const usuarios = await buscarUsuarioPorId(id);
    if (usuarios.length === 0) {
        throw new ErroHttp(404, 'USUARIO_NAO_ENCONTRADO', 'Usuário não encontrado');
    }

    res.status(200).json(usuarios[0]);
};

export const deleteUsuarioPorId = async (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id) || id <= 0) {
        throw new ErroHttp(400, 'ID_INVALIDO', 'ID inválido');
    }
    if (id !== req.usuarioId) {
        throw new ErroHttp(403, 'SEM_PERMISSAO', 'Sem permissão');
    }

    const usuarios = await buscarUsuarioPorId(id);
    if (usuarios.length === 0) {
        throw new ErroHttp(404, 'USUARIO_NAO_ENCONTRADO', 'Usuário não encontrado');
    }

    await deletarUsuarioPorId(id);
    res.status(200).json({ mensagem: 'Usuário deletado com sucesso' });
};

export const atualizaUsuarioPorId = async (req, res) => {
    const id = parseInt(req.params.id);
    const { nome, email, senha } = req.body ?? {};

    if (isNaN(id) || id <= 0) {
        throw new ErroHttp(400, 'ID_INVALIDO', 'ID inválido');
    }
    if (id !== req.usuarioId) {
        throw new ErroHttp(403, 'SEM_PERMISSAO', 'Sem permissão');
    }

    const erroValidacao = validarDadosUsuario({ nome, senha, email });
    if (erroValidacao) {
        throw new ErroHttp(400, 'DADOS_INVALIDOS', erroValidacao);
    }

    const usuario = await buscarUsuarioPorId(id);
    if (usuario.length === 0) {
        throw new ErroHttp(404, 'USUARIO_NAO_ENCONTRADO', 'Usuário não encontrado');
    }

    const emailNormalizado = normalizarEmail(email);
    const emailExistente = await buscarUsuarioPorEmail(emailNormalizado);
    if (emailExistente.length > 0 && emailExistente[0].id !== id) {
        throw new ErroHttp(409, 'EMAIL_JA_CADASTRADO', 'Email já cadastrado');
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    await atualizarUsuarioPorId(id, nome.trim(), emailNormalizado, senhaHash);

    const [atualizado] = await buscarUsuarioPorId(id);
    return res.status(200).json(atualizado);
};

export const executaLogin = async (req, res) => {
    const { email, senha } = req.body ?? {};

    if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim()) || typeof senha !== 'string' || !senha) {
        throw new ErroHttp(400, 'DADOS_INVALIDOS', 'email e senha são obrigatórios');
    }

    const usuarios = await buscarUsuarioPorEmail(normalizarEmail(email));
    const usuario = usuarios[0];

    // Comparamos sempre a senha, mesmo com e-mail inexistente, para o tempo de
    // resposta não revelar quais e-mails estão cadastrados.
    const senhaHash = usuario?.senha ?? HASH_FICTICIO;
    const senhaCorreta = await bcrypt.compare(senha, senhaHash);

    if (!usuario || !senhaCorreta) {
        throw new ErroHttp(401, 'CREDENCIAIS_INVALIDAS', 'Email ou senha inválidos');
    }

    res.status(200).json({ token: assinarToken(usuario.id) });
};

export const postSaque = async (req, res) => {
    const valor = normalizarValor(req.body?.valor);
    const saldo = await sacarDinheiro(req.usuarioId, valor);

    return res.status(200).json({ saldo });
};

export const postDeposito = async (req, res) => {
    const valor = normalizarValor(req.body?.valor);
    const saldo = await depositarDinheiro(req.usuarioId, valor);

    return res.status(200).json({ saldo });
};

export const postTransferencia = async (req, res) => {
    const { emailDestino, valor } = req.body ?? {};
    const valorArredondado = normalizarValor(valor);

    if (typeof emailDestino !== 'string' || !EMAIL_REGEX.test(emailDestino.trim())) {
        throw new ErroHttp(400, 'EMAIL_DESTINO_INVALIDO', 'Email do destinatário inválido');
    }

    const destinatarios = await buscarUsuarioPorEmail(normalizarEmail(emailDestino));
    if (destinatarios.length === 0) {
        throw new ErroHttp(404, 'DESTINATARIO_NAO_ENCONTRADO', 'Destinatário não encontrado');
    }

    const destino = destinatarios[0];
    if (destino.id === req.usuarioId) {
        throw new ErroHttp(400, 'TRANSFERENCIA_PARA_SI_MESMO', 'Não é possível transferir para si mesmo');
    }

    const saldo = await transferirDinheiro(req.usuarioId, destino.id, valorArredondado);

    return res.status(200).json({
        saldo,
        destino: {
            nome: destino.nome,
            email: destino.email
        }
    });
};
