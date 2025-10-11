// backend/server.js - 10/10/2025
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routers/auth.js";
import productsRoutes from "./routers/products.js";
import categoriesRoutes from "./routers/categories.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(rateLimit({ windowMs: 60 * 1000, max: 200 }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Pasta de uploads
const uploadsPath = path.join(__dirname, "uploads");
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(uploadsPath)
);

// Rotas principais
app.use("/auth", authRoutes);
app.use("/products", productsRoutes);
app.use("/categories", categoriesRoutes);

// Teste de status
app.get("/", (req, res) => res.json({ ok: true, message: "API está online!" }));

// ⚠️ Correção aqui:
app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

// Middleware global de erro
app.use((err, req, res, next) => {
  console.error("Erro interno:", err);
  res.status(500).json({ error: "Erro interno no servidor." });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
  console.log(`📂 Servindo arquivos estáticos de: ${uploadsPath}`);
  console.log(
    "Status JWT_SECRET:",
    process.env.JWT_SECRET ? "CARREGADO" : "FALHOU"
  );
});
