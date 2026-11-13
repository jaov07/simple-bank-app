import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../lib/api.js'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const { entrar } = useAuth()
  const navigate = useNavigate()

  const enviar = async (evento) => {
    evento.preventDefault()
    setErro('')
    setCarregando(true)

    try {
      const { token } = await api.login(email.trim(), senha)
      entrar(token)
      navigate('/dashboard')
    } catch (error) {
      setErro(error.message)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <AuthLayout>
      <header className="auth-cabecalho">
        <h1 className="auth-titulo">Entrar na conta</h1>
        <p className="auth-subtitulo">
          Informe seu e-mail e senha para continuar.
        </p>
      </header>

      <form className="formulario" onSubmit={enviar}>
        <div className="campo">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="senha">Senha</label>
          <input
            id="senha"
            type="password"
            value={senha}
            onChange={(evento) => setSenha(evento.target.value)}
            autoComplete="current-password"
            minLength={6}
            required
          />
        </div>

        {erro && (
          <p className="mensagem mensagem--erro" role="alert">
            {erro}
          </p>
        )}

        <button
          type="submit"
          className="botao botao--primario botao--bloco"
          disabled={carregando}
        >
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="auth-rodape">
        Ainda não tem conta? <Link to="/cadastro">Criar conta</Link>
      </p>
    </AuthLayout>
  )
}
