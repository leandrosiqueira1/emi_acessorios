// backend/controllers/cartController.ts

import { Request, Response, NextFunction } from 'express';
import { pool as db } from '../db.ts';

type AuthRequest = Request & { user?: { id?: number } };

// 1. GET /cart: Obter Carrinho Persistente
export const getCart = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
        res.status(401).json({ error: 'Não autorizado.' });
        return;
    }

    try {
        const result = await db.query<{ items: any }>(
            'SELECT items FROM carts WHERE user_id = $1',
            [userId]
        );

        let items: any[] = [];
        if (result.rows.length > 0) {
            const raw = result.rows[0].items;
            if (typeof raw === 'string') {
                try {
                    items = JSON.parse(raw);
                } catch {
                    items = raw as any;
                }
            } else {
                items = (raw as any) ?? [];
            }
        }

        res.status(200).json({ items });
    } catch (err) {
        console.error('Erro ao buscar carrinho persistente:', err);
        next(err as Error);
    }
};


// 2. POST /cart: Salvar/Atualizar Carrinho
export const updateCart = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    const { items } = req.body; // espera um array de objetos: [{ productId, quantity }, ...]

    if (!userId) {
        res.status(401).json({ error: 'Não autorizado.' });
        return;
    }

    if (!items || !Array.isArray(items)) {
        res.status(400).json({ error: 'Dados do carrinho inválidos.' });
        return;
    }

    try {
        // Usa UPSERT (ON CONFLICT) para inserir ou atualizar o carrinho atomicamente
        const query = `
            INSERT INTO carts (user_id, items, updated_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (user_id) DO UPDATE
            SET items = $2, updated_at = NOW()
            RETURNING items
        `;

        // O driver do pg aceita objetos JS para colunas JSON/JSONB
        const result = await db.query<{ items: any }>(query, [userId, items]);

        let returnedItems: any = result.rows[0]?.items ?? [];
        if (typeof returnedItems === 'string') {
            try {
                returnedItems = JSON.parse(returnedItems);
            } catch {
                // mantém como está
            }
        }

        res.status(200).json({
            message: 'Carrinho atualizado com sucesso!',
            items: returnedItems,
        });
    } catch (err) {
        console.error('Erro ao salvar carrinho persistente:', err);
        next(err as Error);
    }
};

// 3. DELETE /cart: Limpar Carrinho (Após Checkout)
export const clearCart = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
        res.status(401).json({ error: 'Não autorizado.' });
        return;
    }

    try {
        await db.query('DELETE FROM carts WHERE user_id = $1', [userId]);
        res.status(200).json({ message: 'Carrinho limpo com sucesso.' });
    } catch (err) {
        console.error('Erro ao limpar carrinho persistente:', err);
        next(err as Error);
    }
};