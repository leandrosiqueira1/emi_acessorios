// frontend/src/app/context/FavoritesContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { Product } from "../types/products";

// Define a forma do contexto
interface FavoritesContextType {
    favorites: Product[];
    toggleFavorite: (productId: number) => Promise<void>;
    // Recebe apenas o ID do produto
    isFavorite: (productId: number) => boolean;
    loading: boolean;
    error: string | null;
    fetchFavorites: () => void; // Para recarregar a lista
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// URL do seu Backend (ajuste a porta se necessário)
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

// Provedor do contexto
export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
    // Agora 'favorites' armazena apenas a lista de produtos
    const [favorites, setFavorites] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Função para buscar a lista de favoritos do servidor (Back-end)
    const fetchFavorites = useCallback(async () => {
        setLoading(true);
        setError(null);
        // 💡 CORRIGIDO: Remoção do localStorage. Não precisamos de um token aqui,
        // pois o navegador enviará o cookie HttpOnly automaticamente se existir.
        
        try {
            const res = await fetch(`${BACKEND_URL}/favorites`, {
                method: 'GET',
                credentials: 'include', // ESSENCIAL: Envia o cookie HttpOnly 
            });

            if (res.status === 401 || res.status === 403) {
                // Sessão expirada ou não logado. Comportamento esperado.
                setFavorites([]);
                setLoading(false);
                return;
            }

            if (!res.ok) {
                // Se a API não retornar sucesso, dispara um erro
                throw new Error('Falha ao carregar favoritos da API. Tente logar novamente.');
            }
            const data = await res.json();
            setFavorites(data || []);
        } catch (err: any) {
            console.error('Erro ao buscar favoritos:', err);
            setError(err.message || 'Erro de conexão ou servidor.');
            setFavorites([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Carrega favoritos ao iniciar e sempre que houver login/logout
    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    // Função para adicionar ou remover um produto (chama o endpoint TOGGLE)
    const toggleFavorite = async (productId: number) => {
        // 💡 CORRIGIDO: Não checa mais localStorage
        
        setLoading(true);

        try {
            const res = await fetch(`${BACKEND_URL}/favorites/toggle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId }),
                credentials: 'include', // ESSENCIAL 
            });
            const result = await res.json();
            
          if (res.status === 401) {
              setError("Sessão expirada. Por favor, faça login novamente.");
              return;
          }

            if (!res.ok) {
                throw new Error(result.error || 'Falha ao alterar o favorito.');
            }

            // Lógica para atualizar o estado local APÓS o sucesso no servidor
            if (result.action === 'added') {
                // Requisita a lista completa (mais seguro do que tentar construir o objeto Product)
                fetchFavorites();
            } else if (result.action === 'removed') {
                setFavorites(prev => prev.filter(p => p.id !== productId));
            }
            setError(null);

        } catch (err: any) {
            setError(err.message || 'Erro de rede ou servidor.');
            throw err; 
        } finally {
            setLoading(false);
        }
    };

    // Checa se o produto está na lista atual
    const isFavorite = (productId: number) => {
        return favorites?.some(fav => fav.id === productId) ?? false;
    };

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, loading, error, fetchFavorites }}>
            {children}
        </FavoritesContext.Provider>
    );
};

// Hook personalizado para usar o contexto
export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error("useFavorites must be used within a FavoritesProvider");
    }
    return context;
};