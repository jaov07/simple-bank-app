import jwt from 'jsonwebtoken';

export const autenticar = (req, res, next) => {
    const cabecalho = req.headers.authorization;

    if (!cabecalho) {
        return res.status(401).json({ mensagem: "Token não enviado" });
    }

    const token = cabecalho.split(' ')[1];

    try {
        const dados = jwt.verify(token, process.env.JWT_SECRET);
        req.usuarioId = dados.id;
        next();
    } catch (erro) {
        return res.status(401).json({ mensagem: "Token inválido ou expirado" });
    }
};