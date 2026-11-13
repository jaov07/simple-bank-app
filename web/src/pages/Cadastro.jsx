import { Link } from 'react-router-dom'

export default function Cadastro() {
  return (
    <main className="pagina">
      <section className="cartao">
        <h1>Criar conta</h1>
        <p className="texto-suave">Tela de cadastro em construção.</p>
        <Link to="/login">Já tenho conta</Link>
      </section>
    </main>
  )
}
