import { pool } from "../db.js";
import { cloudinary } from "../config/cloudinary.js"; // Presume que você tem esta importação configurada.

/**
 * Função auxiliar para extrair o Public ID do Cloudinary a partir da URL da imagem.
 * Necessário para deletar a imagem corretamente na nuvem.
 * @param {string} imageUrl - A URL completa da imagem no Cloudinary.
 * @returns {string | null} O Public ID no formato 'pasta/nome_do_arquivo' ou null.
 */
const extractPublicId = (imageUrl) => {
    // Substitua 'mini-querida-lacos' pelo nome da sua pasta principal no Cloudinary
    const folderName = 'mini-querida-lacos'; 
    if (!imageUrl || !imageUrl.includes(folderName)) return null;

    // Remove tudo antes do nome da pasta (ex: https://res.cloudinary.com/.../v123/)
    const parts = imageUrl.split(`${folderName}/`);
    if (parts.length < 2) return null;

    let filenameWithExt = parts[1];
    // Remove a extensão do arquivo e o número de versão (v123) se estiver na URL
    let filename = filenameWithExt.split('/').pop().split('.')[0]; 
    
    // O Public ID final é 'pasta/filename'
    return `${folderName}/${filename}`;
};


/**
 * Lista todos os produtos no banco de dados.
 */
export const listProducts = async (req, res) => {
    try {
        // Consulta SQL para buscar todos os produtos
        const result = await pool.query('SELECT id, name, description, price, image_url, category_id, is_featured FROM products ORDER BY created_at DESC');
        
        res.status(200).json(result.rows);

    } catch (error) {
        console.error("Erro ao listar produtos:", error);
        res.status(500).json({ error: "Erro interno do servidor ao buscar produtos." });
    }
};


/**
 * Cria um novo produto no banco de dados.
 * @requires req.file (Imagem do Multer/Cloudinary)
 * @requires req.body (name, price, category_id)
 */
export const createProduct = async (req, res) => {
    // O Multer já deve ter feito o upload para o Cloudinary e preenchido req.file
    const imageUrl = req.file?.path; // Caminho/URL fornecido pelo Cloudinary
    
    const { name, price, category_id, description, is_featured } = req.body;
    
    // Converte a string de preço para um número decimal, se necessário
    const productPrice = parseFloat(price);

    // 1. Verificação de dados obrigatórios
    if (!name || !productPrice || !category_id || !imageUrl) {
        // Se a imagem foi enviada, mas o resto falhou, excluímos a imagem
        if (imageUrl) {
            const publicId = extractPublicId(imageUrl);
            if (publicId) {
                 // Esta chamada é assíncrona, mas não bloqueamos o fluxo principal
                cloudinary.uploader.destroy(publicId).catch(err => console.error("Falha ao excluir imagem órfã:", err));
            }
        }
        return res.status(400).json({ error: "Campos obrigatórios ausentes: nome, preço, categoria e imagem." });
    }

    try {
        // 2. Insere no PostgreSQL
        const result = await pool.query(
            'INSERT INTO products (name, description, price, image_url, category_id, is_featured) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [
                name, 
                description || '', // Assume descrição opcional
                productPrice, 
                imageUrl, 
                category_id,
                is_featured === 'true' // Converte para booleano
            ]
        );
        
        res.status(201).json({ 
            message: "Produto cadastrado com sucesso!",
            product: result.rows[0] 
        });

    } catch (error) {
        console.error("Erro ao cadastrar produto:", error);

        // Se falhou ao salvar no DB, excluimos a imagem do Cloudinary para evitar lixo
        if (imageUrl) {
            const publicId = extractPublicId(imageUrl);
            if (publicId) {
                cloudinary.uploader.destroy(publicId).catch(err => console.error("Falha ao excluir imagem órfã:", err));
            }
        }

        res.status(500).json({ 
            error: "Erro interno do servidor ao cadastrar produto.", 
            details: error.message 
        });
    }
};


/**
 * Atualiza um ou mais campos de um produto existente (incluindo is_featured).
 * @param {number} req.params.id - ID do produto a ser atualizado.
 * @param {object} req.body - Campos a serem atualizados.
 */
export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    
    // Prepara a query SQL dinamicamente
    const fields = [];
    const values = [];
    let queryIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
        if (key !== 'id') {
            let valueToInsert = value;

            // Tratamento especial para booleanos (is_featured)
            if (key === 'is_featured') {
                // Converte strings 'true'/'false' para booleanos
                valueToInsert = (valueToInsert === 'true' || valueToInsert === true);
            } else if (key === 'price') {
                valueToInsert = parseFloat(value);
            }

            fields.push(`${key} = $${queryIndex++}`);
            values.push(valueToInsert);
        }
    }

    if (fields.length === 0) {
        return res.status(400).json({ error: "Nenhum campo para atualizar fornecido." });
    }

    // Adiciona o ID do produto como o último valor para a cláusula WHERE
    values.push(id);

    const query = `UPDATE products SET ${fields.join(', ')} WHERE id = $${queryIndex} RETURNING *`;
    
    try {
        const result = await pool.query(query, values);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Produto não encontrado." });
        }

        res.status(200).json({ 
            message: "Produto atualizado com sucesso!",
            product: result.rows[0]
        });

    } catch (error) {
        console.error("Erro ao atualizar produto:", error);
        res.status(500).json({ error: "Erro interno do servidor ao atualizar produto.", details: error.message });
    }
};


/**
 * Deleta um produto e a sua imagem na nuvem.
 * @param {number} req.params.id - ID do produto a ser deletado.
 */
export const deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Busca a URL da imagem antes de deletar o registro
        const productResult = await pool.query('SELECT image_url FROM products WHERE id = $1', [id]);
        
        if (productResult.rowCount === 0) {
            return res.status(404).json({ error: "Produto não encontrado para exclusão." });
        }
        
        const imageUrl = productResult.rows[0].image_url;

        // 2. Deleta o registro do banco de dados
        const deleteResult = await pool.query('DELETE FROM products WHERE id = $1', [id]);
        
        if (deleteResult.rowCount === 0) {
            return res.status(404).json({ error: "Produto não encontrado." });
        }

        // 3. Deleta a imagem do Cloudinary
        if (imageUrl) {
            const publicId = extractPublicId(imageUrl);
            if (publicId) {
                const deleteCloudinary = await cloudinary.uploader.destroy(publicId);
                console.log(`Cloudinary delete status for ${publicId}:`, deleteCloudinary);
            }
        }

        res.status(200).json({ message: "Produto deletado com sucesso!" });

    } catch (error) {
        console.error("Erro ao deletar produto:", error);
        res.status(500).json({ error: "Erro interno do servidor ao deletar produto.", details: error.message });
    }
};
