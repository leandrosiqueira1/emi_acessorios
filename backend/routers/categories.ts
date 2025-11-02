import { Router, Request, Response, NextFunction, RequestHandler } from "express";
import { pool } from "../db.js";
import { verifyToken, requireAdmin } from "../middlewares/auth.ts";

// Tipo da categoria
interface Category {
  id: number;
  name: string;
}

const router = Router();

/**
 * GET /api/categories
 * Lista todas as categorias.
 */
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query<Category>("SELECT * FROM categories ORDER BY name ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao listar categorias:", error);
    res.status(500).json({ error: "Erro ao listar categorias." });
  }
});

/**
 * POST /api/categories
 * Cria uma nova categoria (apenas administradores).
 */
router.post(
  "/",
  verifyToken as RequestHandler,
  requireAdmin as RequestHandler,
  async (req: Request, res: Response): Promise<void> => {
    const { name } = req.body as { name?: string };

    if (!name) {
      res.status(400).json({ error: "O nome da categoria é obrigatório." });
      return;
    }

    try {
      const newCategory = await pool.query<Category>(
        "INSERT INTO categories (name) VALUES ($1) RETURNING *",
        [name]
      );
      res.status(201).json(newCategory.rows[0]);
    } catch (error: any) {
      console.error("Erro ao criar categoria:", error);
      if (error.code === "23505") {
        res.status(409).json({ error: "Essa categoria já existe." });
      } else {
        res.status(500).json({ error: "Erro ao criar categoria." });
      }
    }
  }
);

/**
 * DELETE /api/categories/:id
 * Deleta uma categoria (apenas administradores).
 */
router.delete(
  "/:id",
  verifyToken as RequestHandler,
  requireAdmin as RequestHandler,
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      const result = await pool.query("DELETE FROM categories WHERE id = $1 RETURNING *", [id]);
      if (result.rowCount === 0) {
        res.status(404).json({ error: "Categoria não encontrada." });
        return;
      }

      res.status(200).json({ message: "Categoria deletada com sucesso." });
    } catch (error) {
      console.error("Erro ao deletar categoria:", error);
      res.status(500).json({ error: "Erro ao deletar categoria." });
    }
  }
);

export default router;
