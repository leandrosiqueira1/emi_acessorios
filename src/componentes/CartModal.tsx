"use client";

import CartItemRow from "./CartItemRow";
import { useCart } from "@/app/context/CartContext";

type Props = { isOpen: boolean; onClose: () => void };

const fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const parsePrice = (price: string | number) => {
  if (typeof price === "number") return price;
  const numeric = String(price).replace(/[^\d,.-]/g, "").replace(",", ".");
  return Number(numeric) || 0;
};

export default function CartModal({ isOpen, onClose }: Props) {
  const { cart, clearCart } = useCart();
  if (!isOpen) return null;

  const total = cart.reduce((acc, item) => acc + parsePrice(item.price) * item.quantity, 0);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-end">
      <div className="w-full sm:w-[420px] h-full bg-white p-4 overflow-y-auto shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex text-centext-xl font-semibold">Carrinho</h2>
          <button onClick={onClose} className="text-gray-600">✕</button>
        </div>

        {cart.length === 0 ? (
          <p className="text-gray-600">Seu carrinho está vazio.</p>
        ) : (
          <>
            <div className="space-y-3">
              {cart.map(i => <CartItemRow key={i.id} item={i} />)}
            </div>

            <div className="mt-6 border-t pt-4 flex items-center justify-between">
              <span className="font-medium">Total</span>
              <span className="font-bold">{fmt.format(total)}</span>
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={clearCart} className="w-1/3 bg-gray-300 rounded px-3 py-2 hover:opacity-60">Limpar</button>
              <button className="flex-1 bg-violet-600 text-white rounded px-4 py-2 hover:opacity-60">Finalizar compra</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
