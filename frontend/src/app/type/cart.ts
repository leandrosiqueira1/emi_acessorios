import {Product} from "./product";

export type CartItem = Product & {
   quantity: number;
};