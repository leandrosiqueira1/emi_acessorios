//frontend/src/app/hooks/useProducts.tsx

"use client";

import { useState, useEffect } from "react";
import { Product } from "@/app/types/products";

// Novo Tipo: Agora o hook aceita um número (category ID) ou as strings de tipo especial.
type ProductListType = "all" | "featured" | "new_arrivals" | number | null; 
// O tipo 'null' ou 'all' será usado para buscar todos os produtos.

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

/**
* Hook personalizado para buscar produtos.
* Pode buscar por tipos especiais (featured) ou por categoryId.
*/
export const useProducts = (type: ProductListType) => { // Aceita ProductListType
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setIsLoading(true);
        setError(null);
        
        let endpoint = `${BACKEND}/products`; // Endpoint base (CORRIGIDO: Removido 'Routes')

        // 1. Lógica para tipos especiais (precisa de rota específica no backend)
        if (type === "featured") {
            // Assumimos que existe a rota /products/featured no seu backend
            endpoint = `${BACKEND}/products/featured`;
        } else if (type === "new_arrivals") {
            // Assumimos que existe a rota /products/new_arrivals no seu backend (CORRIGIDO: Removido 'Routes')
            endpoint = `${BACKEND}/products/new_arrivals`; 
        
        // 2. Lógica para filtragem por Categoria (a Otimização!)
        } else if (typeof type === 'number' && type > 0) {
            // Se for um número (ID da Categoria), adicionamos o parâmetro de query
            endpoint = `${BACKEND}/products?category_id=${type}`;
        }
        // Se type for 'all' ou null, usa o endpoint base: /products

        const fetchProducts = async () => {
            try {
                const res = await fetch(endpoint);
                if (!res.ok) {
                    throw new Error("Erro ao carregar produtos do servidor.");
                }
                const data = await res.json();
                setProducts(data);
            } catch (err) {
                console.error("Erro no fetch de produtos:", err);
                setError("Erro ao carregar produtos. Verifique sua conexão e o backend.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [type, BACKEND]);

    return { products, isLoading, error };
};