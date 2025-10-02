import {Product} from "./products";

export type CartItem = Product & {
   quantity: number;
};