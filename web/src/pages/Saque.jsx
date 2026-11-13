import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../lib/api.js'


export default function Saque(){
    const {sair} = useAuth()
    const [valor, setValor] = useState('')
    const [erro, setErro] = useState('')
    const [sucesso, setSucesso] = useState('')
    const [carregando, setCarregando] = useState(false)

    const enviar = async(evento)=>{
        evento.preventDefault()
        setErro('')
        setSucesso('')

        const valorNumerico = Number(valor)
        if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
            setErro('Informe um valor maior que zero.')
            return
        }
        setCarregando(true)
        try {
            await api.sacar(valorNumerico)
            setValor('')
            setSucesso('Saque realizado com sucesso.')
        } catch (error) {
            setErro(error.message)
        }finally{
            setCarregando(false)
        }
    }
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

            <div className="inicio">
                <header className="pagina-cabecalho">
                    <Link
                        to="/dashboard"
                        className="botao botao--secundario botao--compacto"
                    >
                        Voltar
                    </Link>

                    <h1 className="pagina-titulo">Sacar</h1>
                    <p className="pagina-subtitulo">
                        Retire um valor do seu saldo.
                    </p>
                </header>

                <section className="cartao">
                    <form className="formulario" onSubmit={enviar}>
                        <div className="campo">
                            <label htmlFor="valor">Valor do saque</label>
                            <input
                                id="valor"
                                type="number"
                                inputMode="decimal"
                                min="0.01"
                                step="0.01"
                                value={valor}
                                onChange={(evento) => setValor(evento.target.value)}
                                placeholder="0,00"
                                required
                            />
                        </div>

                        {erro && (
                            <p className="mensagem mensagem--erro" role="alert">
                                {erro}
                            </p>
                        )}

                        {sucesso && (
                            <p className="mensagem mensagem--sucesso" role="status">
                                {sucesso}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="botao botao--primario botao--bloco"
                            disabled={carregando}
                        >
                            {carregando ? 'Sacando...' : 'Sacar'}
                        </button>
                    </form>
                </section>

                {sucesso && (
                    <Link to="/dashboard" className="botao botao--secundario">
                        Voltar para o início
                    </Link>
                )}
            </div>
        </main>
    )

}
