import express from 'express';
import { postUsuario, getUsuarios, getUsuarioPorId, deleteUsuarioPorId, atualizaUsuarioPorId, executaLogin, getContaPorIdUsuario, postDeposito, postTransferencia, postSaque } from '../controllers/userController.js';
import { autenticar } from '../middlewares/autenticar.js';


const router = express.Router();

router.get(
    '/',
    /* #swagger.tags = ['Usuários'] */
    /* #swagger.summary = 'Lista todos os usuários' */
    /* #swagger.security = [{ "bearerAuth": [] }] */
    autenticar,
    getUsuarios
);

router.get(
    '/saldo',
    /* #swagger.tags = ['Conta'] */
    /* #swagger.summary = 'Consulta o saldo do usuário logado' */
    /* #swagger.security = [{ "bearerAuth": [] }] */
    autenticar,
    getContaPorIdUsuario
);

router.post(
    '/',
    /* #swagger.tags = ['Usuários'] */
    /* #swagger.summary = 'Cadastra um usuário e cria a conta' */
    postUsuario
);

router.post(
    '/login',
    /* #swagger.tags = ['Autenticação'] */
    /* #swagger.summary = 'Realiza login e retorna o token JWT' */
    executaLogin
);

router.post(
    '/deposito',
    /* #swagger.tags = ['Conta'] */
    /* #swagger.summary = 'Deposita um valor na conta do usuário logado' */
    /* #swagger.security = [{ "bearerAuth": [] }] */
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Valor a depositar (maior que zero, até 2 casas decimais)',
        required: true,
        schema: { valor: 150.75 }
    } */
    autenticar,
    postDeposito
);

router.post(
    '/transferencia',
    /* #swagger.tags = ['Conta'] */
    /* #swagger.summary = 'Transfere um valor para outro usuário' */
    /* #swagger.security = [{ "bearerAuth": [] }] */
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'E-mail do destinatário e valor a transferir',
        required: true,
        schema: { emailDestino: 'carlos@teste.com', valor: 50.25 }
    } */
    autenticar,
    postTransferencia
);

router.post(
    '/saque',
    /* #swagger.tags = ['Conta'] */
    /* #swagger.summary = 'Saca um valor da conta do usuário logado' */
    /* #swagger.security = [{ "bearerAuth": [] }] */
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Valor a sacar (maior que zero, até 2 casas decimais)',
        required: true,
        schema: { valor: 100.50 }
    } */
    autenticar,
    postSaque
);

router.delete(
    '/:id',
    /* #swagger.tags = ['Usuários'] */
    /* #swagger.summary = 'Deleta o próprio usuário' */
    /* #swagger.security = [{ "bearerAuth": [] }] */
    autenticar,
    deleteUsuarioPorId
);

router.put(
    '/:id',
    /* #swagger.tags = ['Usuários'] */
    /* #swagger.summary = 'Atualiza o próprio usuário' */
    /* #swagger.security = [{ "bearerAuth": [] }] */
    autenticar,
    atualizaUsuarioPorId
);

router.get(
    '/:id',
    /* #swagger.tags = ['Usuários'] */
    /* #swagger.summary = 'Busca usuário por ID' */
    /* #swagger.security = [{ "bearerAuth": [] }] */
    autenticar,
    getUsuarioPorId
);

export default router;
