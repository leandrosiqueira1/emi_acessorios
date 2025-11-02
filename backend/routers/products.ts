// backend/routers/products.ts

import express, { Request, Response, NextFunction } from "express";
import * as productsDB from "../db/products.ts";
import { upload, cloudinary } from "../config/cloudinary.ts";
import { verifyToken, requireAdmin } from "../middlewares/auth.ts";
import { ProductBody, ProductUpdateBody } from "../src/types/product.ts";
import { MappedProduct } from "../src/types/product-db.ts";

// Tipo customizado para a requisição com arquivo do Multer (se necessário um uso mais global)
// Aqui, vamos usar uma tipagem inline para o POST, mas esta é a base:
interface RequestWithFile extends Request {
    file?: {
        path: string;
        // Adicione outros campos relevantes do Multer File aqui, se necessário
    };
}


const router = express.Router();

// Função para extrair publicId do Cloudinary
const extractPublicId = (imageUrl: string | null): string | null => {
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

// =======================
// 🛍️ ROTAS PÚBLICAS
// =======================

// Buscar lançamentos
router.get("/releases", async (req: Request, res: Response) => {
  try {
    // Assumindo que getNewReleases retorna MappedProduct[]
    const releases: MappedProduct[] = await productsDB.getNewReleases(); 
    res.status(200).json(releases);
  } catch (error) {
    console.error("Erro ao buscar lançamentos:", error);
    res.status(500).json({ error: "Erro interno do servidor ao buscar lançamentos." });
  }
});

// Listar todos os produtos
router.get("/", async (req: Request, res: Response) => {
  try {
    // Assumindo que getAllProducts retorna MappedProduct[]
    const products: MappedProduct[] = await productsDB.getAllProducts(); 
    res.status(200).json(products);
  } catch (error) {
    console.error("Erro ao listar produtos:", error);
    res.status(500).json({ error: "Erro interno do servidor ao buscar produtos." });
  }
});

// Buscar produtos relacionados (colocado antes da rota por ID para não conflitar com '/:id')
router.get("/related/:id", async (req: Request, res: Response) => {
  const id: number = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: "ID de produto inválido." });
  }

  try {
    // Primeiro busca o produto para obter sua categoria
    const product = await productsDB.getProductById(id);
    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }

    // Usa a função já existente para buscar relacionados pela categoria
    const related: MappedProduct[] = await productsDB.getRelatedProducts(product.category_id, id);
    res.status(200).json(related);
  } catch (error) {
    console.error("Erro ao buscar produtos relacionados:", error);
    res.status(500).json({ error: "Erro interno ao buscar produtos relacionados." });
  }
});

// Buscar produto por ID
router.get("/:id", async (req: Request, res: Response) => {
  const id: number = parseInt(req.params.id);

  if (isNaN(id)) {
      return res.status(400).json({ error: "ID de produto inválido." });
  }

  try {
    // Assumindo que getProductById retorna MappedProduct ou null
    const product: MappedProduct | null = await productsDB.getProductById(id);

    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    res.status(200).json(product);
  } catch (error: any) {
    console.error("Erro ao buscar produto por ID:", error);
    res.status(500).json({
      error: "Erro interno ao buscar produto.",
      details: error.message,
    });
  }
});


// (Removida rota duplicada que usava productsDB.pool diretamente)

// =======================
// 🔒 ROTAS ADMIN
// =======================
// O tipo RequestWithFile é necessário aqui, pois o middleware 'upload.single("image")' adiciona 'req.file'
router.post(
  "/",
  verifyToken,
  requireAdmin,
  upload.single("image"),
  async (req: RequestWithFile, res: Response) => {
    let image_url: string | null = null;

    try {
      const {
        name,
        price,
        category_id,
        is_featured,
        description,
        weight_kg,
        length_cm,
        height_cm,
        width_cm,
      } = req.body as ProductBody; // Asserção de tipo para o corpo da requisição

      console.log("📦 Dados recebidos:", req.body);
      console.log("🖼️ Arquivo recebido:", req.file);

      if (req.file?.path) {
        image_url = req.file.path;
      }

      if (!weight_kg || !length_cm || !height_cm || !width_cm) {
        throw new Error(
          "Campos de dimensões (peso, altura, largura, comprimento) são obrigatórios."
        );
      }

      if (!req.file) {
        return res.status(400).json({ error: "Nenhuma imagem carregada." });
      }

      const finalDescription: string = description || "Descrição pendente";
      const isFeaturedBool: boolean = is_featured === "true" || is_featured === true;
      const weight_g: number = Math.round(parseFloat(weight_kg) * 1000);
      
      // Validação de tipo para os campos numéricos
      const parsedPrice: number = parseFloat(price);
      const parsedCategoryId: number = parseInt(category_id);
      const parsedLengthCm: number = parseInt(length_cm);
      const parsedHeightCm: number = parseInt(height_cm);
      const parsedWidthCm: number = parseInt(width_cm);
      
      if (isNaN(parsedPrice) || isNaN(parsedCategoryId) || isNaN(weight_g) || isNaN(parsedLengthCm) || isNaN(parsedHeightCm) || isNaN(parsedWidthCm)) {
           throw new Error("Um ou mais campos numéricos (preço, categoria, dimensões) são inválidos.");
      }

  // Assumindo que createProduct retorna o objeto MappedProduct criado
  const newProduct: MappedProduct = await productsDB.createProduct({
        name,
        description: finalDescription,
        price: parsedPrice,
        image_url,
        category_id: parsedCategoryId,
        is_featured: isFeaturedBool,
        weight_g,
        length_cm: parsedLengthCm,
        height_cm: parsedHeightCm,
        width_cm: parsedWidthCm,
      });

      console.log("✅ Produto cadastrado:", newProduct);
      res.status(200).json({
        message: "Produto cadastrado com sucesso",
        product: newProduct,
      });
    } catch (error: any) {
      console.error("❌ Erro ao cadastrar produto:", error);

      if (image_url && cloudinary) {
        try {
          const publicId = extractPublicId(image_url);
          if (publicId) {
            // Assumindo que cloudinary.uploader.destroy é assíncrono
            await cloudinary.uploader.destroy(publicId); 
            console.log(`🗑️ Imagem ${publicId} deletada do Cloudinary após falha.`);
          }
        } catch (deleteError: any) {
          console.error("⚠️ Falha ao deletar imagem do Cloudinary:", deleteError.message);
        }
      }

      if (error.http_code === 401) {
        return res.status(401).json({
          error: "Falha de autenticação no Cloudinary. Verifique as credenciais.",
          details: error.message,
        });
      }

      if (error.message.includes("Campos de dimensões")) {
        return res.status(400).json({ error: error.message });
      }
      
      if (error.message.includes("campos numéricos")) {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({
        error: "Erro interno no servidor ao cadastrar produto.",
        details: error.message,
      });
    }
  }
);

router.put("/:id", verifyToken, requireAdmin, async (req: Request, res: Response) => {
  const id: number = parseInt(req.params.id);
  const updates: ProductUpdateBody = req.body as ProductUpdateBody; // Asserção de tipo para o corpo

  if (isNaN(id)) {
      return res.status(400).json({ error: "ID de produto inválido." });
  }

  try {
    const finalUpdates: any = { ...updates }; // Objeto para as atualizações finais

    if (finalUpdates.hasOwnProperty("is_featured")) {
      // Converte para boolean se for uma string
      finalUpdates.is_featured =
        finalUpdates.is_featured === "true" || finalUpdates.is_featured === true;
    }

    if (finalUpdates.hasOwnProperty("weight_kg")) {
      const weight_kg_value = parseFloat(finalUpdates.weight_kg as string);
      if(isNaN(weight_kg_value)) {
           return res.status(400).json({ error: "Valor de 'weight_kg' inválido." });
      }
      finalUpdates.weight_g = Math.round(weight_kg_value * 1000);
      delete finalUpdates.weight_kg; // Remove o campo original
    }
    
    // Tratamento para outros campos numéricos (opcional, mas recomendado)
    if (finalUpdates.hasOwnProperty("price")) {
        finalUpdates.price = parseFloat(finalUpdates.price as string);
        if(isNaN(finalUpdates.price)) {
           return res.status(400).json({ error: "Valor de 'price' inválido." });
        }
    }
    // Repetir para category_id, length_cm, height_cm, width_cm, se presentes...
    
  // Assumindo que updateProduct retorna o produto atualizado ou null
  const updatedProduct: MappedProduct | null = await productsDB.updateProduct(id, finalUpdates);

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ error: "Produto não encontrado ou nenhum campo atualizado." });
    }

    res
      .status(200)
      .json({ message: "Produto atualizado com sucesso", product: updatedProduct });
  } catch (error: any) {
    console.error("Erro ao atualizar produto:", error);
    res.status(500).json({
      error: "Falha interna do servidor ao atualizar produto.",
      details: error.message,
    });
  }
});

router.delete("/:id", verifyToken, requireAdmin, async (req: Request, res: Response) => {
  const id: number = parseInt(req.params.id);
  let imageUrl: string | null = null;
  
  if (isNaN(id)) {
      return res.status(400).json({ error: "ID de produto inválido." });
  }

  try {
  // Assumindo que getProductById retorna MappedProduct ou null
  const productToDelete: MappedProduct | null = await productsDB.getProductById(id);

    if (!productToDelete) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }

    imageUrl = productToDelete.image_url;

    // Assumindo que deleteProduct retorna um boolean (true se deletado)
    const deleted: boolean = await productsDB.deleteProduct(id);

    if (deleted && imageUrl && cloudinary) {
      const publicId = extractPublicId(imageUrl);
      if (publicId) {
        // Assumindo que cloudinary.uploader.destroy é assíncrono
        await cloudinary.uploader.destroy(publicId);
      }
    }

    res.status(200).json({ message: "Produto deletado com sucesso" });
  } catch (error: any) {
    console.error("Erro ao deletar produto:", error);
    res.status(500).json({
      error: "Falha interna do servidor ao deletar produto.",
      details: error.message,
    });
  }
});

export default router;