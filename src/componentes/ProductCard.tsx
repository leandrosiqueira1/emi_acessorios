'use client';

import { products } from "@/app/data/product";
import { useCart } from "@/app/context/CartContext";
import { useState } from "react";
import { FaHeart } from "react-icons/fa";
import { MdAddShoppingCart } from "react-icons/md";

interface ProductGalleryProps {
  searchTerm: string;
}

export default function ProductCard({ searchTerm }: ProductGalleryProps) {
  const { addToCart } = useCart();
  const [favorites, setFavorites] = useState<number[]>([]);

  const toggleFavorite = (id: number) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(fav => fav !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-8">
      {/* Container centralizado com largura máxima */}
      <div className="max-w-[1280px] mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`
                  relative border border-gray-300 rounded-2xl overflow-hidden
                  bg-gray-100 shadow-lg transition-transform duration-300
                  hover:scale-105 hover:shadow-2xl
                `}
              >
                {/* Ícone favorito */}
                <button
                  onClick={() => toggleFavorite(product.id)}
                  className={`
                    absolute top-3 right-3 z-10 text-xl 
                    ${favorites.includes(product.id) ? 'text-pink-400' : 'text-gray-400'}
                    hover:text-pink-400 transition
                  `}
                >
                  <FaHeart />
                </button>

                {/* Imagem do produto ocupando todo o card */}
                <div className="w-full h-[360px] overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Conteúdo do card */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800">
                    {product.name}
                  </h3>
                  <p className="text-gray-700 mt-1 font-semibold text-lg">
                    R$ {product.price}
                  </p>

                  {/* Botão adicionar com ícone */}
                  <button
                    onClick={() => addToCart(product)}
                    className={`
                      relative mt-4 w-full px-4 py-2 rounded-xl 
                      bg-gradient-to-tr from-[#64f5ca] via-[#ffa9df] to-[#FFD700] 
                      text-black font-bold shadow-lg overflow-hidden 
                      hover:scale-105 transition-transform flex items-center justify-center gap-2
                    `}
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

      {/* CSS do glow animado */}
      <style jsx>{`
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 12px #64f5ca; }
          33% { box-shadow: 0 0 12px #ffa9df; }
          66% { box-shadow: 0 0 12px #FFD700; }
          100% { box-shadow: 0 0 12px #64f5ca; }
        }

        .button-glow::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          border-radius: inherit;
          filter: blur(10px);
          z-index: -1;
          animation: pulseGlow 3s infinite;
        }
      `}</style>
    </div>
  );
}
