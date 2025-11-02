import express from 'express';
import { register, login, logout } from '../controllers/authController';
import { verifyToken } from '../middlewares/auth';

const router = express.Router();

// Registro
router.post('/register', (req, res, next) => register(req, res));

// Login
router.post('/login', (req, res, next) => login(req, res));

// Logout
router.post('/logout', (req, res, next) => logout(req, res));

// Check - retorna informações do usuário se o token for válido
router.get('/check', verifyToken, (req, res) => {
  // @ts-ignore - req.user é adicionado pelo middleware
  res.json({ ok: true, user: (req as any).user });
});

export default router;