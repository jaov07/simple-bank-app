import express from 'express';
import 'dotenv/config'
import userRoutes from './routes/userRoutes.js';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const swaggerDocument = require('./swagger-output.json');

if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET não configurado no .env");
    process.exit(1);
}

const app = express();

const origensPermitidas = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origem) => origem.trim())
    : '*';

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(cors({ origin: origensPermitidas }));
app.use(express.json());

app.use('/users', userRoutes);

app.use((req, res) => {
    res.status(404).json({ mensagem: "Rota não encontrada" });
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
});
