import express, { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../middlewares/auth.js';
import { getCart, updateCart, clearCart } from '../controllers/cartController.ts';

const router = express.Router();

/**
 * Middleware global de autenticação.
 * Todas as rotas do carrinho exigem um token JWT válido.
 */
router.use(verifyToken as express.RequestHandler);

/**
 * GET /api/cart
 * Retorna o carrinho atual do usuário autenticado.
 */
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  getCart(req, res, next);
});

/**
 * POST /api/cart
 * Atualiza ou salva o carrinho do usuário autenticado.
 */
router.post('/', (req: Request, res: Response, next: NextFunction) => {
  updateCart(req, res, next);
});

/**
 * DELETE /api/cart
 * Limpa o carrinho após o checkout ou quando o usuário decide esvaziá-lo.
 */
router.delete('/', (req: Request, res: Response, next: NextFunction) => {
  clearCart(req, res, next);
});

export default router;
