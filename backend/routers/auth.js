// backend/routers/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { pool } from "../db.js";
import { verifyToken } from "../middlewares/auth.js";

dotenv.config();

const router = express.Router();

// Rota para checar se usuário está logado
router.get("/check", verifyToken, (req, res) => {
  res.json({ user: req.user });
});

// Registrar usuário (primeiro ou se ALLOW_REGISTER=true)
router.post("/register", async (req, res) => {
  try {
    const { username, password, is_admin } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "username e password obrigatórios" });
    }

    const { rows: cnt } = await pool.query("SELECT COUNT(*) FROM users");
    const count = parseInt(cnt[0].count, 10);

    if (count > 0 && process.env.ALLOW_REGISTER !== "true") {
      return res
        .status(403)
        .json({ error: "Registro desabilitado. Primeiro usuário já existe." });
    }

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      "INSERT INTO users (username, password_hash, is_admin) VALUES ($1, $2, $3) RETURNING id, username, is_admin",
      [username, hash, !!is_admin]
    );

    const user = rows[0];
    res.status(201).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "username e password obrigatórios" });
    }

    const { rows } = await pool.query(
      "SELECT id, username, password_hash, is_admin FROM users WHERE username = $1",
      [username]
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ error: "Usuário ou senha inválidos" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: "Usuário ou senha inválidos" });

    const token = jwt.sign(
      { id: user.id, username: user.username, is_admin: user.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
    });

    res.json({ user: { id: user.id, username: user.username, is_admin: user.is_admin } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ ok: true });
});

export default router;
