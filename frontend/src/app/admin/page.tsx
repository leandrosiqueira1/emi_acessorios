"use client";
import { useState, useEffect } from "react";
import { MdDelete } from "react-icons/md";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Category } from "@/app/types/categories";
import { Product } from "@/app/types/product";

export default function AdminPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

  // Funções de CRUD e Logout
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${BACKEND}/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else {
        setMessage("❌ Erro ao carregar produtos");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Erro no servidor");
    }
  };
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage("Selecione uma imagem");
      return;
    }
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("image", file);

    try {
      const res = await fetch(`${BACKEND}/products`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Produto cadastrado");
        setName("");
        setPrice("");
        setFile(null);
        fetchProducts();
      } else {
        setMessage("❌ " + (data.error || "Erro"));
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Erro no servidor");
    }
  };

  const handleDelete = async (productId: number) => {
    if (window.confirm("Tem certeza que deseja deletar este produto?")) {
      try {
        const res = await fetch(`${BACKEND}/products/${productId}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (res.ok) {
          setMessage("✅ Produto deletado com sucesso");
          fetchProducts();
        } else {
          const data = await res.json();
          setMessage("❌ " + (data.error || "Erro ao deletar"));
        }
      } catch (err) {
        setMessage("❌ Erro no servidor");
      }
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch(`${BACKEND}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        router.push("/login");
      } else {
        setMessage("❌ Erro ao fazer logout.");
      }
    } catch (err) {
      setMessage("❌ Erro na conexão com o servidor.");
    }
  };
  
  useEffect(() => {
    const checkAndLoadData = async () => {
      try {
        const res = await fetch(`${BACKEND}/auth/check`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok || !data.user.is_admin) {
          router.push("/login");
        } else {
          await fetchProducts();
          await fetchCategories();
          setIsLoading(false);
        }
      } catch (err) {
        router.push("/login");
      }
    };
    checkAndLoadData();
  }, [router, BACKEND]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-20">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Admin - Gerenciamento de Produtos</h1>
        <div className="flex gap-4">
          <Link href="/admin/categories" className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition">
            Categorias
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Sair
          </button>
        </div>
      </div>

      <div className="bg-gray-200 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-bold mb-2">Cadastrar Novo Produto</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome" className="border p-2 rounded" />
          <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Preço (ex: 49.90)" className="border p-2 rounded" type="number" step="0.01" />
          <input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} className="p-2" />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">Cadastrar</button>
        </form>
        {message && <p className="mt-3 text-sm">{message}</p>}
      </div>

      <div className="bg-gray-200 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Produtos Cadastrados</h2>
        <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
          <thead className="bg-gray-300">
            <tr>
              <th className="py-2 px-4 border-b">Nome</th>
              <th className="py-2 px-4 border-b">Preço</th>
              <th className="py-2 px-4 border-b">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="border-t hover:bg-gray-100 transition-colors">
                <td className="py-2 px-4">{product.name}</td>
                <td className="py-2 px-4 text-center">R$ {parseFloat(product.price.toString()).toFixed(2)}</td>
                <td className="py-2 px-4 text-center">
                  <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-800 transition-colors">
                    <MdDelete size={24} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
