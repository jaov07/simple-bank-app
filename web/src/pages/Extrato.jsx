import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Extrato } from '../components/Extrato.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../lib/api.js'


export default function ExtratoPage(){
    const {sair} = useAuth()
    const [transacoes, setTransacoes] = useState([])
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState('')

    useEffect(() => {
        let ativo = true

        async function carregar() {
            try {
                const dados = await api.extrato()
                if (!ativo) return
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

    return(
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

            <div className="inicio inicio--topo">
                <header className="pagina-cabecalho">
                    <Link
                        to="/dashboard"
                        className="botao botao--secundario botao--compacto"
                    >
                        Voltar
                    </Link>

                    <h1 className="pagina-titulo">Extrato</h1>
                    <p className="pagina-subtitulo">
                        Acompanhe suas movimentações.
                    </p>
                </header>

                <section className="cartao">
                    <div className="cartao-cabecalho">
                        <h2 className="cartao-titulo">Transações recentes</h2>
                    </div>

                    <Extrato
                        transacoes={transacoes}
                        carregando={carregando}
                        erro={erro}
                    />
                </section>
            </div>
        </main>
    )

}
