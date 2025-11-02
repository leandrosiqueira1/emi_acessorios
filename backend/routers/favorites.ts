// backend/routers/favorites.js (CORRIGIDO)
import express, { Request, Response } from "express";
// Importa o pool exportado em backend/db.ts
import { pool as db } from "../db.ts";
import { verifyToken } from "../middlewares/auth.ts";
// Se você precisar do requireAdmin aqui, importaria ele também:
// import { verifyToken, requireAdmin } from "../middlewares/auth.js" 

const router = express.Router();

// Rota 1: Listar produtos favoritos do usuário logado
// Agora usa o nome correto: verifyToken
router.get('/', verifyToken, async (req: Request & { user?: { id?: number } }, res: Response) => {
    try {
        const userId = req.user?.id; 

        const result = await db.query(
            `SELECT p.*, EXISTS (SELECT 1 FROM user_favorites uf WHERE uf.user_id = $1 AND uf.product_id = p.id) AS is_favorite
             FROM products p
             JOIN user_favorites uf ON p.id = uf.product_id
             WHERE uf.user_id = $1`,
            [userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao listar favoritos:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// Rota 2: Adicionar ou Remover um produto dos favoritos (TOGGLE)
// Agora usa o nome correto: verifyToken
router.post('/toggle', verifyToken, async (req: Request & { user?: { id?: number } }, res: Response) => {
    const { productId } = req.body;
    const userId = req.user?.id;

    if (!productId) {
        return res.status(400).json({ error: 'O ID do produto é obrigatório.' });
    }

    let action: string | undefined;
    try {
        const check = await db.query(
            'SELECT * FROM user_favorites WHERE user_id = $1 AND product_id = $2',
            [userId, productId]
        );

        
        if (check.rows.length > 0) {
            await db.query(
                'DELETE FROM user_favorites WHERE user_id = $1 AND product_id = $2',
                [userId, productId]
            );
            action = 'removed';
        } else {
            await db.query(
                'INSERT INTO user_favorites (user_id, product_id) VALUES ($1, $2)',
                [userId, productId]
            );
            action = 'added';
        }

        res.json({ message: `Produto ${action} com sucesso.`, action, productId });

    } catch (error) {
        console.error(`Erro ao alternar favorito (action: ${action}):`, error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

export default router;