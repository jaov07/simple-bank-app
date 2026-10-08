import swaggerAutogen from 'swagger-autogen';

const doc = {
    info: {
        title: 'API de Usuários',
        description: 'Documentação da API de Usuários com autenticação JWT'
    }
    
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./server.js'];

swaggerAutogen()(outputFile, endpointsFiles);