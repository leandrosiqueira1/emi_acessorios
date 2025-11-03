// backend/server.js
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

// Rotas importadas
import authRoutes from "./routers/auth.ts"
import productsRoutes from "./routers/products.ts";
import categoriesRoutes from "./routers/categories.ts";
import promotionsRoutes from "./routers/promotion.ts";
import favoritesRouter from "./routers/favorites.ts";
import ordersRouter from "./routers/orders.ts";
import shippingRouter from "./routers/shipping.ts";
import adminRouter from "./routers/admin.ts";
import picpayRouter from "./routers/picpay.ts";
import cartRouter from "./routers/cart.ts";
import adminOrdersRouter from "./routers/admin/orders.ts";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Configuração para compatibilidade com import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ----------------------
// 🧩 Middlewares globais
// ----------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  helmet({
    // Permite que recursos sejam acessados cross-origin quando apropriado (API para frontend)
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(rateLimit({ windowMs: 60 * 1000, max: 200 }));

// Configura CORS globalmente — o middleware lida com preflight (OPTIONS)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

// ----------------------
// 📂 Arquivos estáticos
// ----------------------
const uploadsPath = path.join(__dirname, "uploads");

app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(uploadsPath)
);

// ----------------------
// 🚏 Rotas da aplicação
// ----------------------
app.use("/products", productsRoutes);
app.use("/categories", categoriesRoutes);
app.use("/promotions", promotionsRoutes);

// Rotas de usuário
app.use("/auth", authRoutes);
app.use("/favorites", favoritesRouter);
app.use("/orders", ordersRouter);

// 🚚 Frete
app.use("/shipping", shippingRouter);

// 💳 Pagamento e carrinho
app.use("/api/picpay", picpayRouter);
app.use("/api/cart", cartRouter);

// 🛠️ Rotas de Admin
app.use("/api/admin", adminRouter);
app.use("/api/admin/orders", adminOrdersRouter);

// ----------------------
// 🌐 Rota base
// ----------------------
app.get("/", (req, res) =>
  res.json({ ok: true, message: "API está online!" })
);

// ----------------------
// ⚠️ Tratamento de erros
// ----------------------
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Erro interno:", err);
  const statusCode = err?.status || 500;
  res.status(statusCode).json({
    error: "Erro interno no servidor.",
    details:
      process.env.NODE_ENV === "development" ? err?.message : undefined,
  });
});

// ----------------------
// 🚀 Inicialização do servidor
// ----------------------
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
  console.log(`📂 Servindo arquivos estáticos de: ${uploadsPath}`);
});

