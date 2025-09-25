// backend/routes/products.js
import express from "express";
import multer from "multer";
import path from "path";
import { pool } from "../db.js";
import fs from "fs";
import { verifyToken, requireAdmin } from "../middlewares/auth.js";

const router = express.Router();

const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).substring(2,8)}${ext}`;
    cb(null, name);
  },
});
const upload = multer({ storage });

router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT id, name, price, image_url FROM products ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// rota de criação: exige token + admin
router.post("/", verifyToken, requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name || !price) return res.status(400).json({ error: "name e price obrigatórios" });

    let imageUrl = null;
    if (req.file) imageUrl = `/uploads/${req.file.filename}`;
    

    const { rows } = await pool.query(
      "INSERT INTO products (name, price, image_url) VALUES ($1, $2, $3) RETURNING id, name, price, image_url",
      [name, parseFloat(price), imageUrl]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const productResult = await pool.query("SELECT image_url FROM products WHERE id = $1", [id]);
    const product = productResult.rows[0];

    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }

    // Exclui o arquivo de imagem da pasta uploads
    if (product.image_url) {
      const filename = product.image_url.split("/").pop();
      const filePath = path.join(UPLOAD_DIR, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await pool.query("DELETE FROM products WHERE id = $1", [id]);
    res.json({ message: "Produto excluído com sucesso." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao deletar produto." });
  }
});

// Rota para atualizar um produto: exige token + admin
router.put("/:id", verifyToken, requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;
    let imageUrl = null;

    if (req.file) {
      // Se uma nova imagem foi enviada, deleta a antiga
      const oldProduct = await pool.query("SELECT image_url FROM products WHERE id = $1", [id]);
      if (oldProduct.rows.length > 0 && oldProduct.rows[0].image_url) {
        const oldFilename = oldProduct.rows[0].image_url.split("/").pop();
        const oldFilePath = path.join(UPLOAD_DIR, oldFilename);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const { rows } = await pool.query(
      "UPDATE products SET name = $1, price = $2, image_url = COALESCE($3, image_url) WHERE id = $4 RETURNING *",
      [name, parseFloat(price), imageUrl, id]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar produto." });
  }
});

export default router;