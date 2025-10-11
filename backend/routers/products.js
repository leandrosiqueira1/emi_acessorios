// backend/routers/products.js
import express from "express";
import * as productsDB from "../db/products.js";
import { upload, cloudinary } from "../config/cloudinary.js";
import { verifyToken, requireAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Função para extrair publicId do Cloudinary
const extractPublicId = (imageUrl) => {
  if (!imageUrl) return null;
  const folderName = "mini-querida-lacos";
  const parts = imageUrl.split(folderName + "/");
  if (parts.length < 2) return null;
  const filenameWithExt = parts[1].split("?")[0];
  const filenameWithoutExt = filenameWithExt.substring(
    0,
    filenameWithExt.lastIndexOf(".")
  );
  return `${folderName}/${filenameWithoutExt}`;
};

// ROTAS PÚBLICAS
router.get("/releases", async (req, res) => {
  try {
    const releases = await productsDB.getNewReleases();
    res.status(200).json(releases);
  } catch (error) {
    console.error("Erro ao buscar lançamentos:", error);
    res.status(500).json({ error: "Erro interno do servidor ao buscar lançamentos." });
  }
});

router.get("/", async (req, res) => {
  try {
    const products = await productsDB.getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    console.error("Erro ao listar produtos:", error);
    res.status(500).json({ error: "Erro interno do servidor ao buscar produtos." });
  }
});

// ROTAS ADMIN
router.post(
  "/",
  verifyToken,
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    let image_url = null;

    try {
      const { name, price, category_id, is_featured, description } = req.body;

      console.log("📦 Dados recebidos:", req.body);
      console.log("🖼️ Arquivo recebido:", req.file);

      if (!req.file) {
        return res.status(400).json({ error: "Nenhuma imagem carregada." });
      }

      // URL final do Cloudinary
      image_url = req.file.path;

      const finalDescription = description || "Descrição pendente";
      const isFeaturedBool = is_featured === "true" || is_featured === true;

      const newProduct = await productsDB.createProduct({
        name,
        description: finalDescription,
        price: parseFloat(price),
        image_url,
        category_id: parseInt(category_id),
        is_featured: isFeaturedBool,
      });

      console.log("✅ Produto cadastrado:", newProduct);
      res.status(200).json({ message: "Produto cadastrado com sucesso", product: newProduct });
    } catch (error) {
      console.error("❌ Erro ao cadastrar produto:", error);

      // Falha de autenticação Cloudinary
      if (error.http_code === 401) {
        return res.status(401).json({
          error: "Falha de autenticação no Cloudinary. Verifique suas credenciais.",
          details: error.message,
        });
      }

      // Tenta deletar a imagem caso tenha sido enviada
      if (image_url && cloudinary) {
        try {
          const publicId = extractPublicId(image_url);
          if (publicId) {
            await cloudinary.uploader.destroy(publicId);
          }
        } catch (deleteError) {
          console.error("⚠️ Falha ao deletar imagem do Cloudinary após erro:", deleteError.message);
        }
      }

      res.status(500).json({
        error: "Erro interno no servidor ao cadastrar produto.",
        details: error.message,
      });
    }
  }
);

router.put("/:id", verifyToken, requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const updates = req.body;

  try {
    if (updates.hasOwnProperty("is_featured")) {
      updates.is_featured = updates.is_featured === "true" || updates.is_featured === true;
    }

    const updatedProduct = await productsDB.updateProduct(id, updates);

    if (!updatedProduct) {
      return res.status(404).json({ error: "Produto não encontrado ou nenhum campo atualizado." });
    }

    res.status(200).json({ message: "Produto atualizado com sucesso", product: updatedProduct });
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    res.status(500).json({
      error: "Falha interna do servidor ao atualizar produto.",
      details: error.message,
    });
  }
});

router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  let imageUrl = null;

  try {
    const productToDelete = await productsDB.getProductById(id);

    if (!productToDelete) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }

    imageUrl = productToDelete.image_url;

    const deleted = await productsDB.deleteProduct(id);

    if (deleted && imageUrl && cloudinary) {
      const publicId = extractPublicId(imageUrl);
      if (publicId) await cloudinary.uploader.destroy(publicId);
    }

    res.status(200).json({ message: "Produto deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    res.status(500).json({
      error: "Falha interna do servidor ao deletar produto.",
      details: error.message,
    });
  }
});

export default router;
