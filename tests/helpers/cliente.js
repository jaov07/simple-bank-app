import { baseDaApi } from './ambiente.js';

export async function requisitar(caminho, { metodo = 'GET', corpo, token, cabecalhos = {} } = {}) {
    const resposta = await fetch(`${baseDaApi()}${caminho}`, {
        method: metodo,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...cabecalhos
        },
        body: corpo === undefined ? undefined : JSON.stringify(corpo)
    });

    const texto = await resposta.text();

    return {
        status: resposta.status,
        corpo: texto ? JSON.parse(texto) : null,
        cabecalhos: resposta.headers
    };
}

export function idDoToken(token) {
    const payload = token.split('.')[1];
    return JSON.parse(Buffer.from(payload, 'base64url').toString()).id;
}

export async function cadastrarUsuario({
    nome = 'Ana Silva',
    email = 'ana@teste.com',
    senha = '123456'
} = {}) {
    const resposta = await requisitar('/users', {
        metodo: 'POST',
        corpo: { nome, email, senha }
    });

    return resposta;
}

export async function criarUsuarioLogado(opcoes = {}) {
    const { email = 'ana@teste.com', senha = '123456', nome = 'Ana Silva' } = opcoes;

    const cadastro = await cadastrarUsuario({ nome, email, senha });
    const login = await requisitar('/users/login', {
        metodo: 'POST',
        corpo: { email, senha }
    });

    return {
        id: idDoToken(login.corpo.token),
        token: login.corpo.token,
        email,
        senha,
        nome,
        statusCadastro: cadastro.status
    };
}

export async function depositar(token, valor) {
    return requisitar('/users/deposito', {
        metodo: 'POST',
        token,
        corpo: { valor }
    });
}
