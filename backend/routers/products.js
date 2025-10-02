import express from "express";
const router = express.Router(); // Usando Express Router
import * as productsDB from "../db/products.js"; // Usando a camada de DB que ajustamos (import * as)
import { cloudinary } from "../config/cloudinary.js"; // Cliente Cloudinary
import { requireAdmin } from '../middlewares/auth.js'; // Middleware de proteção admin
import multer from 'multer'; // Importa Multer
const upload = multer({ storage: multer.memoryStorage() }); // Usando Multer in-memory

// --- FUNÇÃO AUXILIAR PARA DELETAR NA NUVEM ---
const extractPublicId = (imageUrl) => {
    if (!imageUrl) return null;
    const folderName = 'mini-querida-lacos'; 
    const parts = imageUrl.split(folderName + '/');
    if (parts.length < 2) return null;
    const filenameWithExt = parts[1].split('?')[0]; 
    const filenameWithoutExt = filenameWithExt.substring(0, filenameWithExt.lastIndexOf('.'));
    return `${folderName}/${filenameWithoutExt}`; 
};

// =========================================================
// 1. ROTAS PÚBLICAS
// =========================================================

// GET /products/releases - Lançamentos
router.get('/releases', async (req, res) => {
    try {
        const releases = await productsDB.getNewReleases();
        res.status(200).json(releases);
    } catch (error) {
        console.error("Erro ao buscar lançamentos:", error);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar lançamentos.' });
    }
});

// GET /products - Listar Todos os Produtos
router.get('/', async (req, res) => {
    try {
        const products = await productsDB.getAllProducts();
        res.status(200).json(products);
    } catch (error) {
        console.error("Erro ao listar produtos:", error);
        res.status(500).json({ error: "Erro interno do servidor ao buscar produtos." });
    }
});


// =========================================================
// 2. ROTAS ADMINISTRATIVAS (PROTEGIDAS)
// =========================================================

// POST /products - Criar Produto (Com upload para Cloudinary)
router.post('/', requireAdmin, upload.single('image'), async (req, res) => {
    let image_url = null; 

    try {
        const { name, price, category_id, is_featured, description } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ error: "Nenhuma imagem carregada." });
        }
        
        // 1. Upload para o Cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: "mini-querida-lacos" },
                (error, result) => {
                    if (error) reject(error);
                    resolve(result);
                }
            ).end(req.file.buffer); 
        });
        
        image_url = result.secure_url; 

        // 2. Validação e Preparação dos dados
        if (!name || !price || !category_id || !image_url) {
            return res.status(400).json({ error: "Dados incompletos: nome, preço, categoria e imagem são obrigatórios." });
        }
        
        const finalDescription = description || 'Descrição pendente'; 
        const isFeaturedBool = is_featured === 'true' || is_featured === true;

        // 3. Inserção no DB 
        const newProduct = await productsDB.createProduct({
            name,
            description: finalDescription,
            price: parseFloat(price),
            image_url: image_url,
            category_id: parseInt(category_id),
            is_featured: isFeaturedBool
        });
        
        res.status(201).json({ message: "Produto cadastrado com sucesso", product: newProduct });

    } catch (error) {
        console.error("Erro ao cadastrar produto:", error);
        
        // Tentativa de deletar a imagem do Cloudinary se o erro for no DB
        if (image_url && cloudinary) {
            try {
                const publicId = extractPublicId(image_url);
                await cloudinary.uploader.destroy(publicId);
            } catch (deleteError) {
                console.error("Falha ao deletar imagem do Cloudinary após erro:", deleteError.message);
            }
        }
        
        res.status(500).json({ 
            error: "Falha interna do servidor ao cadastrar produto.", 
            details: error.message 
        }); 
    }
});

// PUT /products/:id - Atualizar Produto
router.put('/:id', requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const updates = req.body; 

    try {
        if (updates.hasOwnProperty('is_featured')) {
            updates.is_featured = updates.is_featured === 'true' || updates.is_featured === true;
        }

        const updatedProduct = await productsDB.updateProduct(id, updates);
        
        if (!updatedProduct) {
            return res.status(404).json({ error: "Produto não encontrado ou nenhum campo para atualização." });
        }

        res.status(200).json({ message: "Produto atualizado com sucesso", product: updatedProduct });
    } catch (error) {
        console.error("Erro ao atualizar produto:", error);
        res.status(500).json({ error: "Falha interna do servidor ao atualizar produto.", details: error.message });
    }
});

// DELETE /products/:id - Deletar Produto e Imagem
router.delete('/:id', requireAdmin, async (req, res) => {
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
            await cloudinary.uploader.destroy(publicId);
        }

        res.status(200).json({ message: "Produto deletado com sucesso" });

    } catch (error) {
        console.error("Erro ao deletar produto:", error);
        res.status(500).json({ error: "Falha interna do servidor ao deletar produto.", details: error.message });
    }
});

export default router;
