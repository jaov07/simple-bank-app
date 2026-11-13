import { Link, useNavigate} from 'react-router-dom'
import {api} from '../lib/api.js';
import {useAuth} from '../context/AuthContext.jsx'
import { useState } from 'react';
export default function Cadastro() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  
  const {entrar} = useAuth()
  const navigate = useNavigate()

  const enviar = async(evento) =>{
    evento.preventDefault()
    setErro('')

    if(senha !== confirmacao){
      setErro('As senhas não conferem')
      return
    }

    setCarregando(true)
    try {
      const {token} = await api.cadastrar(nome.trim(), email.trim(), senha)
      entrar(token)
      navigate('/dashboard')
    
    } catch (error) {
      setErro(error.message)  
    }finally{
      setCarregando(false)
    }
  }




  return (
    <main className="pagina">
      <section className="cartao">
        <h1>Criar conta</h1>

        <form className='formulario' onSubmit={enviar}>
          <div className='campo'>
            <label htmlFor="nome"> Nome</label>
            <input
              id='nome'
              type='text'
              value={nome}
              onChange={(evento) => setNome(evento.target.value)}
              autoComplete='name'
              required
            />
          </div>

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
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          <div className="campo">
            <label htmlFor="confirmacao">Confirmar senha</label>
            <input
              id="confirmacao"
              type="password"
              value={confirmacao}
              onChange={(evento) => setConfirmacao(evento.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          {erro && (
            <p className='erro' role='alert'>
              {erro}
            </p>
          )}


          <button type="submit" disabled={carregando}>
            {carregando ? 'Criando conta...': 'Criar conta'}
          </button>
        </form>
        <p className='texto-suave'>
          Já tem conta? <Link to='/login'> Entrar</Link>
        </p>
      </section>
    </main>
  )
}
