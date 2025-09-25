//frontend/src/app/componetes/CategoriesHighlight.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Category } from "@/app/type/categories";

export default function CategoriesHighlight() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [message, setMessage] = useState("");
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${BACKEND}/categories`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        } else {
          setMessage("❌ Erro ao carregar categorias.");
        }
      } catch (err) {
        setMessage("❌ Erro na conexão com o servidor.");
      }
    };
    fetchCategories();
  }, [BACKEND]);

  return (
    <div className="bg-gray-200 p-6 rounded-lg shadow-md max-w-xs w-full">
      <h2 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
        Categorias
      </h2>
      {message && <p className="text-red-500 mb-4">{message}</p>}
      <ul className="space-y-2">
        {categories.length > 0 ? (
          categories.map((category) => (
            <li key={category.id} className="group">
              {/* O link aponta para uma página de produtos, passando o nome da categoria como parâmetro. Você pode ajustar a rota conforme a sua necessidade. */}
              <Link href={`/products?category=${category.name}`} passHref>
                <div className="block p-2 rounded-lg transition-colors duration-200 bg-white hover:bg-purple-100 hover:text-purple-700 font-medium">
                  {category.name}
                </div>
              </Link>
            </li>
          ))
        ) : (
          <p className="text-gray-500">Nenhuma categoria encontrada.</p>
        )}
      </ul>
    </div>
  );
}
