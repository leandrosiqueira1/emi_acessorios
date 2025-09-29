// backend/routes/products.js
import express from "express";
// Removidos: path, fs
import { pool } from "../db.js";
import { verifyToken, requireAdmin } from "../middlewares/auth.js";

// IMPORTANTE: Assumimos que estes foram exportados do arquivo de configuração do Cloudinary:
// 1. upload: O middleware Multer já configurado para enviar para o Cloudinary.
// 2. cloudinary: O cliente Cloudinary para deletar arquivos.
import { upload, cloudinary } from "../config/cloudinary.js"; 

const router = express.Router();

// ------------------------------------------------------------------------------------------
// REMOVIDO: Toda a configuração de multer.diskStorage, path.resolve e fs.mkdirSync.
// O middleware 'upload' já está configurado no arquivo '../config/cloudinary.js'.
// ------------------------------------------------------------------------------------------

// --- FUNÇÃO AUXILIAR PARA DELETAR NA NUVEM ---
// Esta função extrai o ID que o Cloudinary precisa para deletar o arquivo, 
// assumindo que ele está no formato 'nome_da_pasta/nome_do_arquivo' na URL.
const extractPublicId = (imageUrl) => {
    // Exemplo: 'https://res.cloudinary.com/.../v123/mini-querida-lacos/nome_do_arquivo.jpg'
    // Se você configurou uma pasta, use o nome dela aqui. Ex: 'mini-querida-lacos'
    const folderName = 'mini-querida-lacos'; 
    if (!imageUrl || !imageUrl.includes(folderName)) return null;

    // Pega tudo após o nome da pasta
    const parts = imageUrl.split(folderName + '/');
    if (parts.length < 2) return null;

    let filenameWithExt = parts[1];
    // Remove o número de versão (v123) se estiver na URL e a extensão
    let filename = filenameWithExt.split('/').pop().split('.')[0]; 
    
    // O ID público final é 'pasta/filename'
    return `${folderName}/${filename}`;
};

router.get('/', async (req, res) => {
    try {
        // Consulta SQL para buscar todos os produtos
        const result = await pool.query('SELECT id, name, description, price, image_url, category_id, is_featured FROM products ORDER BY created_at DESC');
        
        // Retorna a resposta como JSON (resolve o erro de "Unexpected token '<'")
        res.status(200).json(result.rows);

    } catch (error) {
        console.error("Erro ao listar produtos:", error);
        // Retorna um erro 500 para indicar falha no servidor (e não um 404)
        res.status(500).json({ error: "Erro interno do servidor ao buscar produtos." });
    }
});

export default router;