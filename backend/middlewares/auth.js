
// backend/middlewares/auth.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Middleware para verificar o token JWT do cookie
export const verifyToken = (req, res, next) => {
  
  console.log("Cookies recebidos:", req.cookies);

  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "Não autorizado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Adiciona as informações do usuário à requisição
    next();
  } catch (err) {
     console.error("ERRO na verificação do token:", err.message); 
    return res.status(401).json({ error: "Token inválido" });
  }
};

// Novo middleware para verificar se o usuário é administrador
export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.is_admin) {
    next();
  } else {
    res.status(403).json({ error: "Acesso negado. Apenas administradores." });
  }
};