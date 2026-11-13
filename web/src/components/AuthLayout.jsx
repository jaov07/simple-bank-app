import { Link } from 'react-router-dom'

export function AuthLayout({ children }) {
  return (
    <div className="auth">
      <main className="auth-caixa">
        <Link to="/login" className="marca auth-marca">
          SimpleBank
        </Link>

        <section className="auth-painel">{children}</section>
      </main>
    </div>
  )
}
