// frontend/src/app/admin/page.tsx

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // ✅ Reintroduzido para navegação suave
import Link from "next/link"; // ✅ Reintroduzido para links
import { MdDelete } from "react-icons/md"; // ✅ Usando o ícone MdDelete
import { Product } from "@/app/types/products"; // ✅ Tipo Product importado de forma centralizada
import { Category } from "@/app/types/categories"; // ✅ Tipo Category importado de forma centralizada

// Ícone de Estrela para Destaque (Mantido)
const StarIcon = ({ filled, ...props }: { filled: boolean } & React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" 
        fill={filled ? "currentColor" : "none"} 
        stroke={filled ? "currentColor" : "currentColor"} 
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);


export default function AdminPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [file, setFile] = useState<File | null>(null);
  // Garante que o estado é um string para corresponder ao campo do select
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("0"); 
  const [message, setMessage] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const router = useRouter(); // ✅ Inicialização do hook de navegação
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

  // Função auxiliar para verificar se a resposta é JSON antes de parsear
  const getJsonOrHandleError = async (res: Response, defaultError: string) => {
    const contentType = res.headers.get("content-type");
    if (res.ok && contentType && contentType.includes("application/json")) {
      return await res.json();
    }
    
    console.error(`Erro: status ${res.status}. Tipo de conteúdo: ${contentType}. Resposta não é JSON.`);
    const text = await res.text();
    console.error("Corpo da resposta:", text.slice(0, 500)); 
    
    throw new Error(defaultError);
  };
  
  // Funções de CRUD e Logout
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${BACKEND}/products`);
      const data = await getJsonOrHandleError(res, "Erro ao carregar produtos");
      setProducts(data);
      
    } catch (err) {
      console.error(err);
      setMessage("❌ Erro ao carregar produtos. Verifique se o servidor backend está rodando e se a rota /products existe.");
    }
  };
  
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${BACKEND}/categories`);
      const data = await getJsonOrHandleError(res, "Erro ao carregar categorias");
      setCategories(data);
      
    } catch (err) {
      setMessage("❌ Erro ao carregar categorias. Verifique se o servidor backend está rodando e se a rota /categories existe.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage("Selecione uma imagem");
      return;
    }
    if (selectedCategoryId === "0" || !selectedCategoryId) {
        setMessage("Selecione uma categoria válida.");
        return;
    }

    const formData = new FormData();
    formData.append("name", name);
    // Garante que o preço é enviado como string para o backend, se necessário
    formData.append("price", price); 
    formData.append("image", file);
    formData.append("category_id", selectedCategoryId); 
    // is_featured padrão para false ao criar
    formData.append("is_featured", "false"); 

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
        setSelectedCategoryId("0");
        fetchProducts();
      } else {
        setMessage("❌ " + (data.error || data.message || "Erro desconhecido ao cadastrar"));
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Erro no servidor");
    }
  };

  /**
   * Função para alternar o status de destaque (is_featured) de um produto.
   * Depende da rota PUT /products/:id no backend estar configurada para receber este campo.
   */
  const handleFeatureToggle = async (product: Product) => {
    try {
        const newFeaturedStatus = !product.is_featured;
        
        const res = await fetch(`${BACKEND}/products/${product.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ is_featured: newFeaturedStatus }),
            credentials: "include",
        });

        if (res.ok) {
            setMessage(`✅ Produto "${product.name}" ${newFeaturedStatus ? 'destacado' : 'removido dos destaques'}.`);
            fetchProducts(); 
        } else {
            let data;
            try {
                data = await res.json();
            } catch (e) {
                data = { error: "Erro desconhecido ou resposta não-JSON do servidor." };
            }
            setMessage("❌ " + (data.error || "Erro ao atualizar destaque"));
        }
    } catch (err) {
        setMessage("❌ Erro no servidor ao atualizar destaque");
    }
  };

  const handleDelete = async (productId: number) => {
    if (confirm("Tem certeza que deseja deletar este produto?")) { 
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
        router.push("/login"); // ✅ Usando router.push
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
        
        const contentType = res.headers.get("content-type");
        let data = null;
        if (res.ok && contentType && contentType.includes("application/json")) {
            data = await res.json();
        }
        
        // Redireciona se a autenticação falhar
        if (!data || !res.ok || !data.user?.is_admin) {
          router.push("/login"); // ✅ Usando router.push
        } else {
          await fetchProducts();
          await fetchCategories();
          setIsLoading(false);
        }
      } catch (err) {
        // Redireciona em caso de erro de conexão ou parseamento
        router.push("/login"); // ✅ Usando router.push
      }
    };
    checkAndLoadData();
  }, [BACKEND, router]); // ✅ Incluindo router nas dependências
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-20 p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Admin - Gerenciamento de Produtos</h1>
        <div className="flex gap-4">
          <Link 
            href="/admin/categories" // ✅ Usando Link
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
          >
            Categorias ({categories.length})
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Sair
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">Cadastrar Novo Produto</h2>
        
        {/* Aviso se não houver categorias cadastradas */}
        {categories.length === 0 && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
                <p className="font-bold">Atenção!</p>
                <p>Nenhuma categoria cadastrada. Cadastre uma 
                    <Link 
                        href="/admin/categories" 
                        className="underline font-medium text-yellow-700 hover:text-yellow-900 ml-1"
                    >
                        aqui
                    </Link> 
                    antes de adicionar produtos.
                </p>
            </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="Nome do Produto" 
            className="border p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
            required
          />
          <input 
            value={price} 
            onChange={e => setPrice(e.target.value)} 
            placeholder="Preço (ex: 49.90)" 
            className="border p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
            type="number" 
            step="0.01" 
            required
          />
          
          {/* CAMPO DE SELEÇÃO DE CATEGORIA */}
          <select
            value={selectedCategoryId}
            onChange={e => setSelectedCategoryId(e.target.value)}
            className="border p-3 rounded-lg bg-white appearance-none focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={categories.length === 0}
          >
            <option value="0" disabled>Selecione uma Categoria...</option>
            {categories.map(cat => (
              // O valor deve ser o ID da categoria (integer no DB, mas é string no HTML)
              <option key={cat.id} value={cat.id.toString()}> 
                {cat.name}
              </option>
            ))}
          </select>

          <label className="block text-sm font-medium text-gray-700 mt-1">Imagem do Produto:</label>
          <input 
            type="file" 
            onChange={e => setFile(e.target.files?.[0] ?? null)} 
            className="p-3 border rounded-lg bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
          />
          
          <button 
            type="submit" 
            className="bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 disabled:bg-gray-400"
            disabled={categories.length === 0}
          >
            Cadastrar Produto
          </button>
        </form>
        {message && <p className={`mt-3 text-sm font-medium ${message.startsWith('❌') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">Produtos Cadastrados ({products.length})</h2>
        <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Nome</th>
              <th className="py-3 px-4 text-center text-sm font-medium text-gray-600">Preço</th>
              <th className="py-3 px-4 text-center text-sm font-medium text-gray-600">Categoria</th>
              <th className="py-3 px-4 text-center text-sm font-medium text-gray-600">Destaque</th> 
              <th className="py-3 px-4 text-center text-sm font-medium text-gray-600">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => {
                // Encontra a categoria pelo ID
                const category = categories.find(cat => cat.id === product.category_id);
                return (
                    <tr key={product.id} className="border-t hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-gray-800">{product.name}</td>
                      {/* Garante que o preço é formatado corretamente */}
                      <td className="py-3 px-4 text-center text-gray-800">R$ {parseFloat(product.price.toString()).toFixed(2)}</td>
                      <td className="py-3 px-4 text-center text-gray-800">{category ? category.name : 'N/A'}</td>
                      
                      {/* Célula para alternar Destaque */}
                      <td className="py-3 px-4 text-center">
                        <button 
                          onClick={() => handleFeatureToggle(product)} 
                          className={`p-1 rounded-full transition-colors ${product.is_featured ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-gray-500'}`}
                          title={product.is_featured ? "Remover dos Destaques" : "Marcar como Destaque"}
                        >
                          <StarIcon filled={!!product.is_featured} className="w-6 h-6 inline-block" />
                        </button>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button 
                          onClick={() => handleDelete(product.id)} 
                          className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-50"
                          title="Deletar Produto"
                        >
                          {/* Usando o ícone MdDelete da react-icons */}
                          <MdDelete className="w-6 h-6 inline-block" /> 
                        </button>
                      </td>
                    </tr>
                );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}