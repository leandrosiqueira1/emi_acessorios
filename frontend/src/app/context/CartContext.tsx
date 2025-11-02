// frontend/src/app/context/CartContext.tsx
"use client";
import { createContext, useContext, useState, ReactNode, useMemo } from "react";
import { Product } from "@/app/types/products";

// 💡 1. DEFINIÇÃO DA INTERFACE ATUALIZADA (com dados de Frete)
// Assumimos que o tipo Product, que vem do backend/DB, AGORA tem os campos de dimensão e peso.
type CartProduct = Omit<Product, "is_featured" | "category"> & { 
    quantity: number;
    weight_kg: number;
    length_cm: number;
    height_cm: number;
    width_cm: number;
};

// 💡 2. DEFINIÇÃO DO TIPO DO CONTEXTO (incluindo os novos totais calculados)
type CartContextType = {
  cart: CartProduct[];
  addToCart: (product: Omit<CartProduct, "quantity">, quantity?: number) => void; 
  removeFromCart: (id: number) => void;
  increaseQty: (id: number) => void;
  decreaseQty: (id: number) => void;
  clearCart: () => void;
  
  // NOVOS VALORES DE AGREGAÇÃO PARA CÁLCULO DE FRETE
  cartTotal: number;
  totalWeightKg: number;
  totalLengthCm: number;
  totalHeightCm: number;
  totalWidthCm: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { ReactNode }) {
  const [cart, setCart] = useState<CartProduct[]>([]);

  // #######################################################
  // >> FUNÇÕES DE MANIPULAÇÃO DO CARRINHO (MANTIDAS)
  // #######################################################
  const addToCart = (product: Omit<CartProduct, "quantity">, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      
      if (existing) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, quantity: p.quantity + quantity } : p
        );
      }
      
      // Assumindo que 'product' já tem as dimensões/peso.
      return [...prev, { ...product, quantity }]; 
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  const increaseQty = (id: number) => {
    setCart((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, quantity: p.quantity + 1 } : p
      )
    );
  };

  const decreaseQty = (id: number) => {
    setCart((prev) =>
      prev
        .map((p) =>
          p.id === id ? { ...p, quantity: p.quantity - 1 } : p
        )
        .filter((p) => p.quantity > 0)
    );
  };

  const clearCart = () => setCart([]);


  // #######################################################
  // >> 3. LÓGICA DE CÁLCULO DE TOTAIS E DIMENSÕES (useMemo)
  // #######################################################
  const aggregatedValues = useMemo(() => {
    // 1. Total de Valor
    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // 2. Total de Peso (Soma de todos os produtos * quantidade)
    const totalWeightKg = cart.reduce((sum, item) => sum + item.weight_kg * item.quantity, 0);
    
    // 3. Dimensões Mínimas da Embalagem (Usamos a maior dimensão encontrada para cada eixo)
    // Se o carrinho estiver vazio, retorna 0, mas a API dos Correios exige um mínimo (11x16x2). 
    // O Back-end que você criou (freteService.js) já trata esses mínimos.
    const totalLengthCm = cart.reduce((max, item) => Math.max(max, item.length_cm), 0);
    const totalHeightCm = cart.reduce((max, item) => Math.max(max, item.height_cm), 0);
    const totalWidthCm = cart.reduce((max, item) => Math.max(max, item.width_cm), 0);
    
    return {
      cartTotal,
      totalWeightKg: parseFloat(totalWeightKg.toFixed(2)), // Arredonda para 2 casas
      totalLengthCm: Math.ceil(totalLengthCm), // Arredonda para cima (número inteiro)
      totalHeightCm: Math.ceil(totalHeightCm),
      totalWidthCm: Math.ceil(totalWidthCm),
    };
  }, [cart]);


  return (
    <CartContext.Provider
      value={{ 
        cart, 
        addToCart, 
        removeFromCart, 
        increaseQty, 
        decreaseQty, 
        clearCart,
        ...aggregatedValues // 💡 EXPORTANDO OS NOVOS VALORES
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart deve ser usado dentro de <CartProvider>");
  return context;
}