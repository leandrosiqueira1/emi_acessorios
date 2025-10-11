
//frontend/src/app/context/CartContext.tsx

"use client";

import React, { createContext, useReducer, useContext, ReactNode, useEffect } from "react";
import { cartReducer } from "./CartReducer";
import { CartState, CartItem } from "./CartType";
import { Product } from "@/app/types/products";

type CartContextType = {
cart: CartItem[];
addToCart: (product: Product) => void;
removeFromCart: (id: number) => void;
increaseQty: (id: number) => void;
decreaseQty: (id: number) => void;
clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);
const initialState: CartState = { cart: [] };

function init(): CartState {
try {
const raw = typeof window !== "undefined" ? localStorage.getItem("cart") : null;
return raw ? { cart: JSON.parse(raw) } : initialState;
} catch {
return initialState;
}
}

export function CartProvider({ children }: { children: ReactNode }) {
const [state, dispatch] = useReducer(cartReducer, initialState, init);

useEffect(() => {
try {
localStorage.setItem("cart", JSON.stringify(state.cart));
} catch {}
}, [state.cart]);

const addToCart = (product: Product) => dispatch({ type: "ADD_TO_CART", payload: product });
const removeFromCart = (id: number) => dispatch({ type: "REMOVE_FROM_CART", payload: id });
const increaseQty = (id: number) => dispatch({ type: "INCREASE_QTY", payload: id });
const decreaseQty = (id: number) => dispatch({ type: "DECREASE_QTY", payload: id });
const clearCart = () => dispatch({ type: "CLEAR_CART" });

return (
<CartContext.Provider value={{ cart: state.cart, addToCart, removeFromCart, increaseQty, decreaseQty, clearCart }}>
{children}
</CartContext.Provider>
);
}

export function useCart() {
const ctx = useContext(CartContext);
if (!ctx) throw new Error("useCart deve ser usado dentro de CartProvider");
return ctx;
}