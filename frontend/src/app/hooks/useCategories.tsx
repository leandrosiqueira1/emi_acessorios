//frontend/src/app/hooks/useCategories.tsx
import { useState, useEffect } from "react";
import { Product } from "@/app/types/products";


// Hook personalizado para buscar produtos, evitando duplicacao de codigo
export function useProducts(categoryId?: number) {
const [products, setProducts] = useState<Product[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

useEffect(() => {
const fetchProducts = async () => {
setLoading(true);
setError(null);
try {
const url = categoryId
? `${BACKEND}/products?category_id=${categoryId}`
: `${BACKEND}/products`;

const res = await fetch(url);
if (!res.ok) {
throw new Error("Erro ao carregar produtos.");
}
const data = await res.json();
setProducts(data);
} catch (err) {
setError("Erro na conexao com o servidor.");
} finally {
setLoading(false);
}
};
fetchProducts();
}, [categoryId, BACKEND]);

return { products, loading, error };
}