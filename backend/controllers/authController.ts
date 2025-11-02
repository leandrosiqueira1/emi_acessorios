// backend/controllers/authController.ts

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool as db } from '../db.ts'; // usa o pool exportado em backend/db.ts
import { QueryResultRow } from 'pg'; // tipo de linha de resultado do pg

// 💡 Definição de Tipo Básico (Você pode expandir isso mais tarde)
interface UserRow extends QueryResultRow {
  id: number;
  email: string;
  password_hash?: string; // nem sempre retornado (ex.: retorno de INSERT pode não ter)
  is_admin?: boolean;
  name?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_padrao';

// ----------------------
// 🔒 1. Função de Registro (register)
// ----------------------
export const register = async (req: Request, res: Response): Promise<any> => {
  // Aceita `name` (frontend antigo), `username` ou `email` (mapear para username)
  const { name, username: bodyUsername, email, password } = req.body;
  const username = bodyUsername || name || email; // se frontend enviar email, usamos como username

  if (!username || !password) {
    res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    return;
  }

  try {
    // 1. Verificar se o usuário já existe
    const checkUser = await db.query<UserRow>('SELECT id FROM users WHERE username = $1', [username]);
    if (checkUser.rows.length > 0) {
      res.status(409).json({ error: 'Este usuário já está cadastrado.' });
      return;
    }

    // 2. Hash da senha
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Inserir no banco de dados
    const newUser = await db.query<{ id: number; username: string }>(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
      [username, passwordHash]
    );

    res.status(201).json({
      ok: true,
      message: 'Usuário registrado com sucesso.',
      user: { id: newUser.rows[0].id, username: newUser.rows[0].username },
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno no servidor durante o registro.' });
  }
};

// ----------------------
// 🔑 2. Função de Login (login)
// ----------------------
export const login = async (req: Request, res: Response): Promise<any> => {
  // aceita username ou email (email será usado como username caso enviado)
  const { email, username: bodyUsername, password } = req.body;
  const username = bodyUsername || email;

  try {
    // 1. Buscar usuário
  const result = await db.query<UserRow>('SELECT id, password_hash, is_admin, username FROM users WHERE username = $1', [username]);
  const user = result.rows[0] as UserRow | undefined;

    if (!user) {
      res.status(401).json({ error: 'Credenciais inválidas.' });
      return;
    }

    // 2. Comparar senha
    if (!user.password_hash) {
      console.error('Hash de senha ausente para o usuário:', user.id);
      return res.status(500).json({ error: 'Erro interno no servidor.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Credenciais inválidas.' });
      return;
    }

    // 3. Gerar JWT
    const payload = {
      id: user.id,
      is_admin: !!user.is_admin,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    // 4. Configurar e enviar o Cookie (Melhor Prática)
    res.cookie('token', token, {
      httpOnly: true, // Impedir acesso via JavaScript do lado do cliente (segurança)
      secure: process.env.NODE_ENV === 'production', // Use 'secure' em produção (HTTPS)
      sameSite: 'lax', // Proteção contra CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
    });

    res.status(200).json({ 
      ok: true,
      user: { id: user.id, username: user.username, is_admin: user.is_admin },
      message: 'Login realizado com sucesso.' 
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno no servidor durante o login.' });
  }
};


// ----------------------
// 🚪 3. Função de Logout (logout)
// ----------------------
export const logout = (req: Request, res: Response): any => {
  // Limpa o cookie de autenticação
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  return res.status(200).json({ ok: true, message: 'Logout realizado com sucesso.' });
};

// 💡 CORREÇÃO: Usamos 'export const' para exportar funções individualmente.
// NÃO use: module.exports = { register, login, logout };