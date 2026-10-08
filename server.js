import express from 'express';
import 'dotenv/config'
import userRoutes from './routes/userRoutes.js';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const swaggerDocument = require('./swagger-output.json');


const app = express();
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(cors())
app.use(express.json());

app.use('/users', userRoutes);
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
});