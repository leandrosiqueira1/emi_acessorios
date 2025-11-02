//backend/routes/promotion.js
import express from "express";
import { pool } from "../db.js";
import { verifyToken, requireAdmin } from "../middlewares/auth.ts";

const router = express.Router();

// 🔹 Obter promoção ativa
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM promotions WHERE active = true ORDER BY id DESC LIMIT 1"
    );
    res.json(rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar promoção" });
  }
});

// 🔹 Criar ou atualizar promoção (somente admin)
router.post("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { title, end_date } = req.body;
    if (!title || !end_date)
      return res.status(400).json({ error: "Campos obrigatórios" });

    // Desativa promoções existentes
    await pool.query("UPDATE promotions SET active = false");

    const { rows } = await pool.query(
      "INSERT INTO promotions (title, end_date, active) VALUES ($1, $2, true) RETURNING *",
      [title, end_date]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao cadastrar promoção" });
  }
});

export default router;
