"use client";
import React, { useState } from "react";
import ShippingCalculator from "@/components/ShippingCalculator";
import { useCart } from "@/app/context/CartContext";

type Product = {
  id: number;
  name: string;
  price: number | string;
  image_url?: string | null;
  description?: string | null;
  // dimensões e peso (opcionais, podem vir do backend)
  weight_kg?: number;
  length_cm?: number;
  height_cm?: number;
  width_cm?: number;
};

export default function ProductDetailsClient({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

  const imageForCart = product.image_url
    ? product.image_url.startsWith("/")
      ? `${BACKEND}${product.image_url}`
      : product.image_url
    : "https://placehold.co/360x360/e0e0e0/555555?text=Sem+Imagem";

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image_url: imageForCart,
      // passa dimensões/peso para o contexto do carrinho (usar 0 como fallback)
      weight_kg: product.weight_kg ?? 0,
      length_cm: product.length_cm ?? 0,
      height_cm: product.height_cm ?? 0,
      width_cm: product.width_cm ?? 0,
    }, quantity);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <h2 className="text-2xl font-extrabold mb-2 text-gray-900">{product.name}</h2>
      <p className="text-[#9061FA] text-4xl font-extrabold mb-4">R$ {Number(product.price).toFixed(2)}</p>

      <div className="flex items-center gap-3 mb-4">
        <label htmlFor="quantity" className="text-sm">Quantidade:</label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
          className="w-20 p-2 border rounded"
        />
      </div>

      <button
        onClick={handleAddToCart}
        className="w-full py-3 bg-gradient-to-r from-[#9061FA] via-[#7C3AED] to-[#FF7AB6] text-white font-semibold rounded-2xl shadow-lg mb-4 transform hover:-translate-y-0.5 transition"
      >
        Adicionar ao carrinho
      </button>

      <div className="mb-4">
        <ShippingCalculator productId={product.id} productPrice={Number(product.price)} quantity={quantity} />
      </div>

      {/* Descrição movida para a página do produto (server component) */}
    </div>
  );
}
