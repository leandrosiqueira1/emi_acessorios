import { Product } from "../type/product";

export type CartItem = Product & {quantity: number};7

export type CartState = {cart: CartItem[]};

export type CartAction =
  | { type: "ADD_TO_CART"; payload: Product }
  | { type: "REMOVE_FROM_CART"; payload: number }   // id
  | { type: "INCREASE_QTY"; payload: number }       // id
  | { type: "DECREASE_QTY"; payload: number }       // id
  | { type: "CLEAR_CART" };