import express from 'express';
import { postUsuario, getUsuarios, getUsuarioPorId, deleteUsuarioPorId, atualizaUsuarioPorId, executaLogin, getContaPorIdUsuario } from '../controllers/userController.js';
import { autenticar } from '../middlewares/autenticar.js';

const router = express.Router();

router.get('/',autenticar, getUsuarios);
router.get('/saldo', autenticar, getContaPorIdUsuario)
router.post('/', postUsuario);//CADASTRO -> rota não protegida
router.post('/login', executaLogin );// LOGIN -> rota não protegida
router.delete('/:id',autenticar, deleteUsuarioPorId);
router.put('/:id', autenticar,atualizaUsuarioPorId );
router.get('/:id',autenticar, getUsuarioPorId);

export default router;