// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import path from "path";

import authRoutes from "./routers/auth.js";
import productsRoutes from "./routers/products.js";
import categoriesRoutes from "./routers/categories.js"

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 200,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Adiciona o cabeçalho CORS para os recursos da pasta de uploads
app.use("/uploads", (req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

// servir uploads
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

// rotas
app.use("/auth", authRoutes);
app.use("/products", productsRoutes);
app.use("/categories",categoriesRoutes);

app.get("/", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
  console.log("Valor de ALLOW_REGISTER:", process.env.ALLOW_REGISTER);
});
