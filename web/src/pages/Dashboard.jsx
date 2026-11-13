import { useAuth } from '../context/AuthContext.jsx'

export default function Dashboard() {
  const { sair } = useAuth()

  return (
    <main className="pagina">
      <header className="topo">
        <h1>SimpleBank</h1>
        <button type="button" onClick={sair}>
          Sair
        </button>
      </header>

      <section className="cartao">
        <p className="texto-suave">Dashboard em construção.</p>
      </section>
    </main>
  )
}
