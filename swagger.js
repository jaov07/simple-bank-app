import 'dotenv/config';
import swaggerAutogen from 'swagger-autogen';

const porta = Number(process.env.PORT) || 3000;

const doc = {
    info: {
        title: 'API SimpleBank',
        description: 'Documentação da API do SimpleBank com autenticação JWT. Use o botão "Authorize" com o valor: Bearer <token>'
    },
    host: `localhost:${porta}`,
    securityDefinitions: {
        bearerAuth: {
            type: 'apiKey',
            name: 'Authorization',
            in: 'header',
            description: 'Informe: Bearer <token>'
        }
    }
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./server.js'];

swaggerAutogen()(outputFile, endpointsFiles, doc);
