// backend/db/products.ts

import { pool } from "../db.ts"; // Assumindo que '../db.js' exporta a pool
import { QueryResultRow } from "pg"; // Apenas se QueryResultRow for necessário em outro local ou para o mapProduct

// 🛠️ ATUALIZADO: Importando todas as interfaces do arquivo de tipos
import { 
    ProductRow, 
    MappedProduct, 
    CreateProductInput 
} from "../src/types/product-db.ts"; 


// Função auxiliar para mapear produto do DB para o formato esperado
const mapProduct = (row: ProductRow): MappedProduct => ({
    id: row.id,
    name: row.name,
    price: parseFloat(row.price), 
    image_url: row.image_url,
    category_id: row.category_id,
    is_featured: row.is_featured,

    // Conversão e tratamento de nulos
    weight_kg: row.weight_g ? parseFloat((row.weight_g / 1000).toFixed(2)) : 0,
    length_cm: row.length_cm ?? 0,
    height_cm: row.height_cm ?? 0,
    width_cm: row.width_cm ?? 0,

    category: row.category_name
        ? { id: row.category_id, name: row.category_name }
        : undefined,
});

// -----------------------------------------------------
// Funções de acesso ao banco
// -----------------------------------------------------

// Lista todos os produtos
export async function getAllProducts(): Promise<MappedProduct[]> {
    const res = await pool.query<ProductRow>(
        `SELECT p.*, c.name AS category_name
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         ORDER BY p.id DESC`
    );
    return res.rows.map(mapProduct);
}

// Busca lançamentos (produtos mais recentes)
export async function getNewReleases(limit = 8): Promise<MappedProduct[]> {
    const res = await pool.query<ProductRow>(
        `SELECT p.* FROM products p ORDER BY p.created_at DESC LIMIT $1`,
        [limit]
    );
    return res.rows.map(mapProduct);
}

// Busca produto por ID
export async function getProductById(id: number): Promise<MappedProduct | null> {
    const res = await pool.query<ProductRow>(
        `SELECT p.*, c.name AS category_name
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.id = $1`,
        [id]
    );
    return res.rows.length ? mapProduct(res.rows[0]) : null;
}

// Cria novo produto
export async function createProduct({
    name,
    description,
    price,
    image_url,
    category_id,
    is_featured = false,
    weight_g,
    length_cm,
    height_cm,
    width_cm,
}: CreateProductInput): Promise<MappedProduct> {
    const res = await pool.query<ProductRow>(
        `INSERT INTO products 
         (name, description, price, image_url, category_id, is_featured, weight_g, length_cm, height_cm, width_cm)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [name, description, price, image_url, category_id, is_featured, weight_g, length_cm, height_cm, width_cm]
    );
    return mapProduct(res.rows[0]);
}

// Atualiza produto existente
export async function updateProduct(id: number, updates: Partial<CreateProductInput>): Promise<MappedProduct | null> {
    const setClauses: string[] = [];
    const values: (string | number | boolean | undefined)[] = [];
    let paramIndex = 1;

    const allowedFields = [
        "name", "price", "description", "category_id", "image_url", "is_featured",
        "weight_g", "length_cm", "height_cm", "width_cm"
    ];

    for (const field of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(updates, field) && (updates as any)[field] !== undefined) {
            setClauses.push(`${field} = $${paramIndex++}`);
            values.push((updates as any)[field]);
        }
    }

    if (setClauses.length === 0) {
        return getProductById(id);
    }

    values.push(id);
    const queryText = `UPDATE products SET ${setClauses.join(", ")} WHERE id = $${paramIndex} RETURNING *`;

    try {
        const res = await pool.query<ProductRow>(queryText, values);
        if (res.rows.length === 0) return null;
        return mapProduct(res.rows[0]);
    } catch (error) {
        console.error("Erro ao executar updateProduct:", error);
        throw error;
    }
}

// Deleta produto
export async function deleteProduct(id: number): Promise<boolean> {
    const res = await pool.query("DELETE FROM products WHERE id = $1 RETURNING id", [id]);
    return res.rows.length > 0;
}

// Busca produtos relacionados (categoria similar)
export async function getRelatedProducts(category_id: number, excludeId: number): Promise<MappedProduct[]> {
    const res = await pool.query<ProductRow>(
        `SELECT p.*, c.name AS category_name
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.category_id = $1 AND p.id != $2
         ORDER BY RANDOM()
         LIMIT 4`,
        [category_id, excludeId]
    );
    return res.rows.map(mapProduct);
}