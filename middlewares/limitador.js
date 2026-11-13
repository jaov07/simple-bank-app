import { rateLimit } from 'express-rate-limit';

const JANELA_MINUTOS = Number(process.env.RATE_LIMIT_JANELA_MINUTOS) || 15;
const MAXIMO_POR_JANELA = Number(process.env.RATE_LIMIT_MAX) || 10;

// Limita tentativas por IP para dificultar força bruta de senha e cadastro em massa.
// Em testes o limite sobe via RATE_LIMIT_MAX para não interferir na suíte.
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
