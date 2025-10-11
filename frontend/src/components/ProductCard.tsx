"use client";
import { useState, useEffect, createContext, useContext } from "react";
import {Product} from "@/app/types/products";  
// --- IMPLEMENTAÇÃO MOCK PARA COMPILAÇÃO ---
/** Definição de Tipo MOCK */


/** Contexto do Carrinho MOCK */
const CartContext = createContext({
  cart: [],
  addToCart: (product: Omit<Product, 'is_featured' | 'category'>) => {
    console.log("MOCK: Adicionar ao carrinho:", product.name);
  },
});

const useCart = () => useContext(CartContext);
// ------------------------------------------

type ProductGalleryProps = {
  searchTerm: string;
};

// Ícones SVG embutidos (Substituindo react-icons/fa e react-icons/md)
const HeartIcon = ({ isFavorite }: { isFavorite: boolean }) => (
  <svg 
    stroke="currentColor" 
    fill={isFavorite ? "#f472b6" : "#9ca3af"} // Cor baseada no Tailwind (pink-400 ou gray-400)
    strokeWidth="0" 
    viewBox="0 0 512 512" 
    height="1em" 
    width="1em" 
    xmlns="http://www.w3.org/2000/svg"
    className="transition hover:fill-[#f472b6]"
  >
    <path d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"></path>
  </svg>
);

const ShoppingCartIcon = ({ size = 20 }: { size?: number }) => (
  <svg 
    stroke="currentColor" 
    fill="currentColor" 
    strokeWidth="0" 
    viewBox="0 0 24 24" 
    height={size} 
    width={size} 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-2.81-1.89l-3.32-8.3C10.63 7.21 10.33 7 10 7H4c-.55 0-1 .45-1 1s.45 1 1 1h5.23l2.45 6.13c-.22.18-.46.34-.7.49-.6.37-1.18.57-1.74.57-1.39 0-2.61-.96-3.17-2.34-.14-.35-.5-.56-.88-.56-.63 0-1.13.51-1.13 1.13 0 .28.1.53.27.73 1.25 1.54 3.2 2.58 5.43 2.58.62 0 1.25-.13 1.87-.4 1.13.75 2.56 1.17 4.14 1.17 2.06 0 3.75-1.57 4.09-3.61l.85-5.06h-2.18l-.75 4.5c-.27 1.25-1.52 2.18-2.92 2.18zm-.9-5.46c-.02 0-.05.01-.07.01l-1.33-4.13c-.1-.32-.4-.53-.74-.53H8.5c-.34 0-.64.21-.74.53l-1.33 4.13c-.02 0-.04-.01-.07-.01-.63 0-1.13.51-1.13 1.13s.51 1.13 1.13 1.13c.03 0 .05 0 .07-.01l1.33-4.13c.1-.32.4-.53.74-.53h4.4c.34 0 .64.21.74.53l1.33 4.13c.02 0 .04.01.07.01.63 0 1.13-.51 1.13-1.13s-.51-1.13-1.13-1.13z"></path>
  </svg>
);

// URL de placeholder público para evitar o erro 404 no frontend
const PLACEHOLDER_URL = "https://placehold.co/360x360/e0e0e0/555555?text=Sem+Imagem";

export default function ProductCard({ searchTerm }: ProductGalleryProps) {
  const { addToCart } = useCart();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // NOTA: O ambiente de execução pode não ter acesso a NEXT_PUBLIC_BACKEND_URL.
  // Usar uma URL mock para compilação se a variável não estiver definida.
  const BACKEND =
    typeof process.env.NEXT_PUBLIC_BACKEND_URL !== 'undefined'
      ? process.env.NEXT_PUBLIC_BACKEND_URL
      : "http://localhost:4000";

  useEffect(() => {
    // Busca simulada ou real, dependendo do ambiente
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
                  <HeartIcon isFavorite={favorites.includes(product.id)} />
                </button>

                {/* Imagem */}
                <div className="w-full h-[360px] overflow-hidden">
                  <img
                    src={
                      product.image_url // Usa o URL retornado pelo backend
                        ? product.image_url.startsWith('/') 
                            ? `${BACKEND}${product.image_url}` // Se for um caminho relativo, concatena o BACKEND
                            : product.image_url // Se já for um URL completo (começa com http), usa-o diretamente
                        : PLACEHOLDER_URL // Usa URL pública de placeholder
                    }
                    alt={product.name}
                    // Tratamento de erro: se falhar, tenta o placeholder, mas evita o loop
                    onError={(e) => {
                      const failedUrl = e.currentTarget.src; // Captura a URL que falhou antes de alterar
                      // Verifica se o src atual NÃO é o URL do placeholder para evitar loop infinito
                      if (!failedUrl.includes('placehold.co')) {
                        e.currentTarget.src = PLACEHOLDER_URL; 
                        // Loga o URL COMPLETO que falhou para facilitar o debug do servidor
                        console.error(`Falha ao carregar imagem para ${product.name}. URL COMPLETO que FALHOU: ${failedUrl}`);
                      }
                    }}
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
                        // Atualiza a lógica de URL para o carrinho também
                        image_url: product.image_url
                          ? product.image_url.startsWith('/') 
                              ? `${BACKEND}${product.image_url}` 
                              : product.image_url
                          : PLACEHOLDER_URL, // Usa URL pública de placeholder
                      })
                    }
                    className="relative mt-4 w-full px-4 py-2 rounded-xl 
                               bg-gradient-to-tr from-[#64f5ca] via-[#ffa9df] to-[#FFD700] 
                               text-black font-bold shadow-lg overflow-hidden 
                               hover:scale-105 transition-transform flex items-center justify-center gap-2"
                  >
                    <ShoppingCartIcon size={20} /> Adicionar
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
