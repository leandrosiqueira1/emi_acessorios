//frontend/src/app/context/CartTypes.tsx

import { Product } from "../types/products";

// CartItem representa o produto armazenado no carrinho. Removemos campos
// desnecessários e adicionamos os campos de dimensão/peso que o carrinho usa.
export type CartItem = Omit<Product, "is_featured" | "category"> & {
  quantity: number;
  weight_kg: number;
  length_cm: number;
  height_cm: number;
  width_cm: number;
};

export type CartState = { cart: CartItem[] };

export type CartAction =
  | { type: "ADD_TO_CART"; payload: Product }
  | { type: "REMOVE_FROM_CART"; payload: number }
  | { type: "INCREASE_QTY"; payload: number }
  | { type: "DECREASE_QTY"; payload: number }
  | { type: "CLEAR_CART" };