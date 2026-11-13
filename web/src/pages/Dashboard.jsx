import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../lib/api.js'

const formatoMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
})

const formatoData = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short'
})

const rotulos = {
  deposito: 'Depósito',
  saque: 'Saque',
  transferencia_enviada: 'Transferência enviada',
  transferencia_recebida: 'Transferência recebida'
}

const tiposDeSaida = new Set(['saque', 'transferencia_enviada'])

export default function Dashboard() {
  const { sair } = useAuth()
  const [saldo, setSaldo] = useState(0)
  const [transacoes, setTransacoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true

    async function carregar() {
      setCarregando(true)
      setErro('')

      try {
        const dados = await api.extrato()
        if (!ativo) return
        setSaldo(dados.saldo)
        setTransacoes(dados.transacoes)
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
    <main className="pagina">
      <header className="topo">
        <h1>SimpleBank</h1>
        <button type="button" onClick={sair}>
          Sair
        </button>
      </header>

      <section className="cartao">
        <span className="rotulo">Saldo disponível</span>
        {carregando ? (
          <p className="texto-suave">Carregando...</p>
        ) : erro ? (
          <strong className="saldo">—</strong>
        ) : (
          <strong className="saldo">{formatoMoeda.format(saldo)}</strong>
        )}
      </section>

      {erro && (
        <p className="erro" role="alert">
          {erro}
        </p>
      )}

      <section className="cartao">
        <h2 className="titulo-secao">Extrato</h2>

        {carregando && <p className="texto-suave">Carregando transações...</p>}

        {!carregando && transacoes.length === 0 && (
          <p className="texto-suave">Nenhuma transação por aqui ainda.</p>
        )}

        {!carregando && transacoes.length > 0 && (
          <ul className="extrato">
            {transacoes.map((transacao) => {
              const ehSaida = tiposDeSaida.has(transacao.tipo)

              return (
                <li key={transacao.id} className="extrato-item">
                  <div className="extrato-descricao">
                    <strong>{rotulos[transacao.tipo] ?? transacao.tipo}</strong>
                    <span className="texto-suave">
                      {formatoData.format(new Date(transacao.criada_em))}
                      {transacao.outra_pessoa && ` · ${transacao.outra_pessoa}`}
                    </span>
                  </div>

                  <span className={ehSaida ? 'valor saida' : 'valor entrada'}>
                    {ehSaida ? '-' : '+'} {formatoMoeda.format(transacao.valor)}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </main>
  )
}
