import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../lib/api.js'

const formatoMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
})

export default function Dashboard() {
  const { sair } = useAuth()
  const [saldo, setSaldo] = useState(0)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true

    async function carregar() {
      try {
        const dados = await api.saldo()
        if (!ativo) return
        setSaldo(dados.saldo)
      } catch (error) {
        if (ativo) setErro(error.message)
      } finally {
        if (ativo) setCarregando(false)
      }
    }

    carregar()

    return () => {
      ativo = false
    }
  }, [])

  return (
    <main className="pagina-inicial">
      <header className="topo-pagina">
        <Link to="/dashboard" className="marca">
          SimpleBank
        </Link>

        <button
          type="button"
          className="botao botao--secundario botao--compacto"
          onClick={sair}
        >
          Sair
        </button>
      </header>

      <div className="inicio">
        <header className="pagina-cabecalho">
          <h1 className="pagina-titulo">Visão geral</h1>
          <p className="pagina-subtitulo">
            Acompanhe seu saldo e suas movimentações.
          </p>
        </header>

        <section className="cartao cartao-saldo">
          <div className="cartao-saldo-topo">
            <p className="saldo-rotulo">Saldo disponível</p>

            <Link
              to="/extrato"
              className="botao-seta"
              aria-label="Ver extrato"
              title="Ver extrato"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m9 6 6 6-6 6" />
              </svg>
            </Link>
          </div>

          {carregando ? (
            <p className="saldo-valor saldo-valor--carregando">Carregando...</p>
          ) : erro ? (
            <p className="saldo-valor saldo-valor--indisponivel">—</p>
          ) : (
            <p className="saldo-valor">{formatoMoeda.format(saldo)}</p>
          )}
        </section>

        {erro && (
          <p className="mensagem mensagem--erro" role="alert">
            {erro}
          </p>
        )}

        <nav className="acoes" aria-label="Ações da conta">
          <Link to="/depositar" className="botao botao--positivo">
            Depositar
          </Link>
          <Link to="/sacar" className="botao botao--secundario">
            Sacar
          </Link>
          <Link to="/transferir" className="botao botao--secundario">
            Transferir
          </Link>
        </nav>
      </div>
    </main>
  )
}
