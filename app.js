import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { createRequire } from 'module';
import userRoutes from './routes/userRoutes.js';
import { rotaNaoEncontrada, tratarErros } from './middlewares/tratarErros.js';

const require = createRequire(import.meta.url);
const swaggerDocument = require('./swagger-output.json');

const app = express();

const origensPermitidas = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origem) => origem.trim())
    : '*';

app.disable('x-powered-by');

// CSP precisa liberar inline porque o Swagger UI injeta script/estilo no HTML.
// Fora do /docs a API só devolve JSON, então o risco é baixo.
app.use(
    helmet({
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                'upgrade-insecure-requests': null,
                'script-src': ["'self'", "'unsafe-inline'"],
                'style-src': ["'self'", "'unsafe-inline'"],
                'img-src': ["'self'", 'data:']
            }
        }
    })
);

app.use(cors({ origin: origensPermitidas }));
app.use(express.json());

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/users', userRoutes);

app.use(rotaNaoEncontrada);
app.use(tratarErros);

export default app;
