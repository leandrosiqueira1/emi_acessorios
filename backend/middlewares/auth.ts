//backend/middlewares/auth.ts
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response, NextFunction } from 'express';

dotenv.config();

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Não autorizado" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            id: number;
            username: string;
            email: string;
            is_admin: boolean;
        };

        req.user = decoded; // ✅ compatível com a tipagem global
        next();
    } catch (err) {
        console.error("Erro na verificação do token:", (err as Error).message);
        return res.status(401).json({ error: "Token inválido" });
    }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    // 1. Check if the user is authenticated (often requires verifyToken to run first)
    if (!req.user) {
        return res.status(403).json({ error: "Acesso negado. Token de autenticação ausente." });
    }

    // 2. Check if the authenticated user is an admin
    if (req.user.is_admin) {
        // If they are admin, proceed to the next middleware or route handler
        next();
    } else {
        // If they are not admin, deny access
        return res.status(403).json({ error: "Acesso negado. Requer privilégios de administrador." });
    }
};

