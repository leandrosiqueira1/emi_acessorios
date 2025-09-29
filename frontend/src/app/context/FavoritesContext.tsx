//frontend/src/app/context/FavoritesContext.tsx

"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Product } from "../types/product";

// Define a forma do contexto
interface FavoritesContextType {
favorites: Product[];
toggleFavorite: (product: Product) => void;
isFavorite: (productId: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// Provedor do contexto
export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
const [favorites, setFavorites] = useState<Product[]>([]);

// Carrega favoritos do localStorage ao iniciar
useEffect(() => {
const storedFavorites = localStorage.getItem("favorites");
if (storedFavorites) {
setFavorites(JSON.parse(storedFavorites));
}
}, []);

// Salva favoritos no localStorage quando a lista muda
useEffect(() => {
localStorage.setItem("favorites", JSON.stringify(favorites));
}, [favorites]);

const toggleFavorite = (product: Product) => {
setFavorites(prevFavorites => {
const isAlreadyFavorite = prevFavorites.some(fav => fav.id === product.id);
if (isAlreadyFavorite) {
// Remove se já for favorito
return prevFavorites.filter(fav => fav.id !== product.id);
} else {
// Adiciona se nao for
return [...prevFavorites, product];
}
});
};

const isFavorite = (productId: number) => {
return favorites.some(fav => fav.id === productId);
};

return (
<FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
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
