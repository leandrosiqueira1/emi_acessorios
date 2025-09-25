import { Router } from "express";
import { pool } from "../db.js";
import { verifyToken, requireAdmin } from "../middlewares/auth.js"; // Funções e caminho corrigidos

const router = Router();

// Rota para listar todas as categorias
router.get("/", async (req, res) => {
  try {
    const categories = await pool.query("SELECT * FROM categories ORDER BY name ASC");
    res.json(categories.rows);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar categorias." });
  }
});

// Rota para criar uma nova categoria (apenas para admins)
router.post("/", verifyToken, requireAdmin, async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "O nome da categoria é obrigatório." });
  }
  try {
    const newCategory = await pool.query(
      "INSERT INTO categories (name) VALUES ($1) RETURNING *",
      [name]
    );
    res.status(201).json(newCategory.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "Essa categoria já existe." });
    }
    res.status(500).json({ error: "Erro ao criar categoria." });
  }
});

// Rota para deletar uma categoria (apenas para admins)
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM categories WHERE id = $1 RETURNING *", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Categoria não encontrada." });
    }
    res.status(200).json({ message: "Categoria deletada com sucesso." });
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar categoria." });
  }
});

export default router;