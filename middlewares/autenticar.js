import jwt from 'jsonwebtoken';

export const autenticar = (req, res, next) => {
    const cabecalho = req.headers.authorization;

    if (!cabecalho) {
        return res.status(401).json({ mensagem: "Token não enviado" });
    }

    const [esquema, token] = cabecalho.split(' ');

    if (esquema !== 'Bearer' || !token) {
        return res.status(401).json({ mensagem: "Formato do token inválido. Use: Bearer <token>" });
    }

    try {
        const dados = jwt.verify(token, process.env.JWT_SECRET);
        req.usuarioId = Number(dados.id);
        next();
    } catch (erro) {
        return res.status(401).json({ mensagem: "Token inválido ou expirado" });
    }
};
