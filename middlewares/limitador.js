import { rateLimit } from 'express-rate-limit';

const JANELA_MINUTOS = Number(process.env.RATE_LIMIT_JANELA_MINUTOS) || 15;
const MAXIMO_POR_JANELA = Number(process.env.RATE_LIMIT_MAX) || 10;

export const criarLimitador = (limite = MAXIMO_POR_JANELA) =>
    rateLimit({
        windowMs: JANELA_MINUTOS * 60 * 1000,
        limit: limite,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        handler: (req, res) =>
            res.status(429).json({
                codigo: 'MUITAS_TENTATIVAS',
                mensagem: 'Muitas tentativas. Tente novamente em alguns minutos.'
            })
    });

export const limitadorLogin = criarLimitador();
export const limitadorCadastro = criarLimitador();
