import 'dotenv/config';
import app from './app.js';

if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET não configurado no .env');
    process.exit(1);
}

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
