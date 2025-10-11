"use client";

import { CartItem } from "@/app/context/CartType";
import { useCart } from "@/app/context/CartContext";

type Props = { item: CartItem };

const fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const parsePrice = (price: string | number) => {
  if (typeof price === "number") return price;
  const numeric = String(price).replace(/[^\d,.-]/g, "").replace(",", ".");
  return Number(numeric) || 0;
};

export default function CartItemRow({ item }: Props) {
  const { removeFromCart, increaseQty, decreaseQty } = useCart();
  const unit = parsePrice(item.price);
  const subtotal = unit * item.quantity;

  return (
    <div className="flex items-center gap-3 border rounded p-2">
      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
      <div className="flex-1">
        <div className="font-medium">{item.name}</div>
        <div className="text-sm text-gray-600">{fmt.format(unit)}</div>

        <div className="flex justify-between w-1/2 border border-pink-400 rounded-md items-center gap-2 mt-2">
          <button onClick={() => decreaseQty(item.id)} className="px-2 py-1 borde border-volet-300 bg-violet-500 rounded">-</button>
          <span className="px-2">{item.quantity}</span>
          <button onClick={() => increaseQty(item.id)} className="px-2 py-1 bg-violet-500 rounded">+</button>
        </div>

        <div className="text-sm font-semibold text-gray-700 mt-1">
          Subtotal: {fmt.format(subtotal)}
        </div>
      </div>

      <button onClick={() => removeFromCart(item.id)} className="text-red-600 hover:text-red-700">Remover</button>
    </div>
  );
}
