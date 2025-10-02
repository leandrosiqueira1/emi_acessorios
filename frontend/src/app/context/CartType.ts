//frontend/src/app/context/CartTypes.tsx

import { Product } from "../types/products";

export type CartItem = Product & { quantity: number };

export type CartState = { cart: CartItem[] };

export type CartAction =
  | { type: "ADD_TO_CART"; payload: Product }
  | { type: "REMOVE_FROM_CART"; payload: number }
  | { type: "INCREASE_QTY"; payload: number }
  | { type: "DECREASE_QTY"; payload: number }
  | { type: "CLEAR_CART" };