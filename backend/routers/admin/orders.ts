//backend/routers/admin/orders.ts 
import express, { Request, Response, NextFunction } from 'express';
import { verifyToken, requireAdmin } from '../../middlewares/auth.js';
import {
  listAllOrders,
  getOrderDetails,
  updateOrderStatus,
  cancelOrder,
} from '../../controllers/orderController.js';

// Criação do router tipado
const router = express.Router();

/**
 * Middleware global para proteger todas as rotas admin/orders
 * Garante que apenas administradores autenticados possam acessar
 */
router.use(verifyToken as express.RequestHandler, requireAdmin as express.RequestHandler);

/**
 * GET /admin/orders
 * Lista todos os pedidos
 */
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  listAllOrders(req, res, next);
});

/**
 * GET /admin/orders/:id
 * Detalhes de um pedido específico
 */
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  getOrderDetails(req, res, next);
});

/**
 * PUT /admin/orders/:id
 * Atualiza status e código de rastreio de um pedido
 */
router.put('/:id', (req: Request, res: Response, next: NextFunction) => {
  updateOrderStatus(req, res, next);
});

/**
 * DELETE /admin/orders/:id
 * Cancela um pedido e reverte estoque
 */
router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  cancelOrder(req, res, next);
});

export default router;
