"use client";
import { useCart } from "@/app/context/CartContext";
import { useState, useEffect } from "react";
import { FaHeart } from "react-icons/fa";
import { MdAddShoppingCart } from "react-icons/md";


type Product = {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
};

type ProductGalleryProps = {
  searchTerm: string;
};

export default function ProductCard({ searchTerm }: ProductGalleryProps) {
  const { addToCart } = useCart();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const BACKEND =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

  useEffect(() => {
    fetch(`${BACKEND}/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Erro ao carregar produtos:", err));
  }, []);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-8">
      <div className="max-w-[1280px] mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="relative border border-gray-300 rounded-2xl overflow-hidden
                           bg-gray-100 shadow-lg transition-transform duration-300
                           hover:scale-105 hover:shadow-2xl"
              >
                {/* Ícone favorito */}
                <button
                  onClick={() => toggleFavorite(product.id)}
                  className={`absolute top-3 right-3 z-10 text-xl 
                    ${
                      favorites.includes(product.id)
                        ? "text-pink-400"
                        : "text-gray-400"
                    }
                    hover:text-pink-400 transition`}
                >
                  <FaHeart />
                </button>

                {/* Imagem */}
                <div className="w-full h-[360px] overflow-hidden">
                  <img
                    src={
                      product.image_url
                        ? `${BACKEND}${product.image_url}`
                        : "/placeholder.png"
                    }
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Conteúdo */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800">
                    {product.name}
                  </h3>
                  <p className="text-gray-700 mt-1 font-semibold text-lg">
                    R$ {product.price}
                  </p>

                  <button
                    onClick={() =>
                      addToCart({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image_url: product.image_url
                          ? `${BACKEND}${product.image_url}`
                          : "/placeholder.png",
                      })
                    }
                    className="relative mt-4 w-full px-4 py-2 rounded-xl 
                               bg-gradient-to-tr from-[#64f5ca] via-[#ffa9df] to-[#FFD700] 
                               text-black font-bold shadow-lg overflow-hidden 
                               hover:scale-105 transition-transform flex items-center justify-center gap-2"
                  >
                    <MdAddShoppingCart size={20} /> Adicionar
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">
              Nenhum produto encontrado.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}