//frontend/src/app/components/store/ProductCard.tsx

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { Product } from "@/app/types/products";
import { Heart } from "lucide-react";
import { useFavorites } from "@/app/context/FavoritesContext";


interface ProductCardProps {
product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
const { addToCart } = useCart();
const { toggleFavorite, isFavorite } = useFavorites();
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

const handleAddToCart = () => {
	addToCart({
		id: product.id,
		name: product.name,
		price: product.price,
		image_url: product.image_url ? `${BACKEND}${product.image_url}` : "https://placehold.co/400x400/e2e8f0/64748b?text=Sem+Imagem",
		weight_kg: product.weight_kg ?? 0,
		length_cm: product.length_cm ?? 0,
		height_cm: product.height_cm ?? 0,
		width_cm: product.width_cm ?? 0,
	});
};

return (
<div className="relative bg-white shadow-xl rounded-2xl overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
<div className="absolute top-2 right-2 z-10">
<button
onClick={() => toggleFavorite(product.id)}
className="p-2 rounded-full bg-white bg-opacity-80 text-gray-500 hover:text-red-500 transition-colors duration-300"
>
<Heart 
className={`w-6 h-6 transition-transform transform ${isFavorite(product.id) ? 'fill-red-500 text-red-500 scale-125' : 'fill-none text-gray-500'}`} 
/>
</button>
</div>
<Link href={`/products/${product.id}`} passHref>
<div className="w-full h-48 sm:h-64 overflow-hidden relative">
<Image
src={product.image_url ? `${BACKEND}${product.image_url}` : "https://placehold.co/400x400/e2e8f0/64748b?text=Sem+Imagem"}
alt={product.name}
layout="fill"
objectFit="cover"
className="transition-transform duration-500 group-hover:scale-110"
/>
</div>
</Link>
<div className="p-4 flex flex-col items-center text-center">
<h3 className="text-xl font-bold text-gray-800 truncate w-full">{product.name}</h3>
<p className="mt-1 text-lg font-semibold text-gray-600">R$ {product.price.toFixed(2)}</p>
<button
onClick={handleAddToCart}
className="mt-4 w-full bg-gradient-to-r from-[#64f5ca] via-[#ffa9df] to-[#FFD700] text-black font-semibold py-2 px-4 rounded-full shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105"
>
Adicionar ao Carrinho
</button>
</div>
</div>
);
}
