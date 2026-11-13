const BASE_URL = import.meta.env.VITE_API_URL ?? ''

let redirecionando = false

function tratarSessaoExpirada() {
  localStorage.removeItem('token')

  if (redirecionando || window.location.pathname === '/login') return

  redirecionando = true
  window.location.replace('/login')
}

async function requisicao(caminho, opcoes = {}) {
  const token = localStorage.getItem('token')

  const resposta = await fetch(`${BASE_URL}${caminho}`, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...opcoes.headers
    }
  })

  const dados = await resposta.json().catch(() => ({}))

  if (!resposta.ok) {
    if (resposta.status === 401 && token) {
      tratarSessaoExpirada()
    }

    const erro = new Error(dados.mensagem ?? 'Erro inesperado')
    erro.status = resposta.status
    throw erro
  }

  return dados
}

export const api = {
  login: (email, senha) =>
    requisicao('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha })
    }),

  cadastrar: (nome, email, senha) =>
    requisicao('/users', {
      method: 'POST',
      body: JSON.stringify({ nome, email, senha })
    }),

  saldo: () => requisicao('/users/saldo'),

  extrato: () => requisicao('/users/extrato'),

  usuario: (id) => requisicao(`/users/${id}`),

  depositar: (valor) =>
    requisicao('/users/deposito', {
      method: 'POST',
      body: JSON.stringify({ valor })
    }),

  sacar: (valor) =>
    requisicao('/users/saque', {
      method: 'POST',
      body: JSON.stringify({ valor })
    }),

  transferir: (emailDestino, valor) =>
    requisicao('/users/transferencia', {
      method: 'POST',
      body: JSON.stringify({ emailDestino, valor })
    })
}
