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

export function Extrato({ transacoes = [], carregando = false, erro = '' }) {
  if (carregando) {
    return <p className="estado-vazio">Carregando transações...</p>
  }

  if (erro) {
    return (
      <p className="mensagem mensagem--erro" role="alert">
        {erro}
      </p>
    )
  }

  if (transacoes.length === 0) {
    return (
      <p className="estado-vazio">
        Nenhuma movimentação ainda. Seu extrato aparece aqui após o primeiro
        depósito.
      </p>
    )
  }

  return (
    <ul className="extrato">
      {transacoes.map((transacao) => {
        const ehSaida = tiposDeSaida.has(transacao.tipo)

        return (
          <li key={transacao.id} className="extrato-item">
            <div className="extrato-descricao">
              <span className="extrato-tipo">
                {rotulos[transacao.tipo] ?? transacao.tipo}
              </span>
              <span className="extrato-meta">
                {formatoData.format(new Date(transacao.criada_em))}
                {transacao.outra_pessoa && ` · ${transacao.outra_pessoa}`}
              </span>
            </div>

            <span
              className={
                ehSaida ? 'valor valor--saida' : 'valor valor--entrada'
              }
            >
              {ehSaida ? '-' : '+'} {formatoMoeda.format(transacao.valor)}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
