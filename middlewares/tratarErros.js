import { DOMINIO_PARA_HTTP, ErroHttp } from '../lib/erros.js';
import { logger } from '../lib/logger.js';

export const rotaNaoEncontrada = (req, res) => {
    res.status(404).json({
        codigo: 'ROTA_NAO_ENCONTRADA',
        mensagem: 'Rota não encontrada'
    });
};

// Último middleware da pilha: toda resposta de erro passa por aqui.
// O Express 5 encaminha rejeições de handlers async direto para cá.
export const tratarErros = (erro, req, res, next) => {
    if (res.headersSent) {
        return next(erro);
    }

    if (erro instanceof ErroHttp) {
        return res.status(erro.status).json({
            codigo: erro.codigo,
            mensagem: erro.message
        });
    }

    const erroDeDominio = DOMINIO_PARA_HTTP[erro?.codigo];
    if (erroDeDominio) {
        return res.status(erroDeDominio.status).json({
            codigo: erro.codigo,
            mensagem: erroDeDominio.mensagem
        });
    }

    if (erro?.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            codigo: 'EMAIL_JA_CADASTRADO',
            mensagem: 'Email já cadastrado'
        });
    }

    if (erro?.type === 'entity.parse.failed') {
        return res.status(400).json({
            codigo: 'JSON_INVALIDO',
            mensagem: 'JSON inválido no corpo da requisição'
        });
    }

    logger.erro('erro não tratado', {
        metodo: req.method,
        rota: req.originalUrl,
        erro: erro?.stack ?? String(erro)
    });

    return res.status(500).json({
        codigo: 'ERRO_INTERNO',
        mensagem: 'Erro interno do servidor'
    });
};
