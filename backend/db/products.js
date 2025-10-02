// backend/db/products.js
import { pool } from "../db.js";

// Função auxiliar para mapear produto do DB para o formato esperado
const mapProduct = (row) => ({
    id: row.id,
    name: row.name,
    price: parseFloat(row.price), // garante que preço seja número
    image_url: row.image_url,
    category_id: row.category_id,
    is_featured: row.is_featured,
    category: row.category_name
        ? { id: row.category_id, name: row.category_name }
        : undefined,
});

// -----------------------------------------------------
// Funções de acesso ao banco
// -----------------------------------------------------

/**
 * Busca todos os produtos, incluindo o nome da categoria.
 */
export async function getAllProducts() {
    const res = await pool.query(`
        SELECT p.*, c.name AS category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.id DESC
    `);
    return res.rows.map(mapProduct);
}

/**
 * Busca os produtos mais recentes (Lançamentos).
 */
export async function getNewReleases(limit = 8) {
    const res = await pool.query(
        `SELECT p.* FROM products p ORDER BY p.created_at DESC LIMIT $1`,
        [limit]
    );
    return res.rows.map(mapProduct);
}

/**
 * Busca um produto pelo ID.
 */
export async function getProductById(id) {
    const res = await pool.query(`
        SELECT p.*, c.name AS category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = $1
    `, [id]);
    return res.rows.length ? mapProduct(res.rows[0]) : null;
}

/**
 * Cria um novo produto.
 */
export async function createProduct({ name, price, image_url, category_id, is_featured = false }) {
    const res = await pool.query(
        `INSERT INTO products (name, price, image_url, category_id, is_featured) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [name, price, image_url, category_id, is_featured]
    );
    return mapProduct(res.rows[0]);
}

/**
 * Atualiza um produto existente.
 */
export async function updateProduct(id, updates) {
    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    const allowedFields = ["name", "price", "category_id", "image_url", "is_featured"];

    for (const field of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(updates, field) && updates[field] !== undefined) {
            setClauses.push(`${field} = $${paramIndex++}`);
            values.push(updates[field]);
        }
    }

    if (setClauses.length === 0) {
        return getProductById(id);
    }

    values.push(id);

    const queryText = `
        UPDATE products 
        SET ${setClauses.join(", ")}
        WHERE id = $${paramIndex}
        RETURNING *
    `;

    try {
        const res = await pool.query(queryText, values);
        if (res.rows.length === 0) {
            return null;
        }
        return mapProduct(res.rows[0]);
    } catch (error) {
        console.error("Erro ao executar updateProduct:", error);
        throw error;
    }
}

/**
 * Deleta um produto.
 */
export async function deleteProduct(id) {
    const res = await pool.query("DELETE FROM products WHERE id = $1 RETURNING id", [id]);
    return res.rows.length > 0;
}
