import express, { Request, Response } from "express";
import { pool as db } from "../db.js";
import { verifyToken, requireAdmin } from "../middlewares/auth.js";

// Tipagem da linha retornada pelo relatório
interface TopProduct {
  id: number;
  name: string;
  image_url: string;
  total_sold: string; // pg retorna SUM como string por padrão
}

const router = express.Router();

// -----------------------------------------------------------------------------
// GET /admin/reports/top-products
// Lista os produtos mais vendidos (apenas admins)
// -----------------------------------------------------------------------------
router.get(
  "/reports/top-products",
  verifyToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const result = await db.query<TopProduct>(
        `SELECT 
            p.id, 
            p.name, 
            p.image_url,
            SUM(oi.quantity) AS total_sold 
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         JOIN orders o ON oi.order_id = o.id
         WHERE o.status IN ('paid', 'delivered') 
         GROUP BY p.id, p.name, p.image_url
         ORDER BY total_sold DESC
         LIMIT 10`
      );

      // Converte total_sold para number antes de enviar, se quiser
      const topProducts = result.rows.map((p) => ({
        ...p,
        total_sold: Number(p.total_sold),
      }));

      res.json(topProducts);
    } catch (error) {
      console.error("Erro ao gerar relatório de mais vendidos:", error);
      res.status(500).json({ error: "Erro interno do servidor." });
    }
  }
);

export default router;
