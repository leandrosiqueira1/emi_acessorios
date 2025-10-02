'use client';
import { useState, useEffect } from "react";
import { MdDelete, MdEdit } from "react-icons/md";
import { useRouter } from "next/navigation";
import { Category } from "@/app/types/categories";
import Link from "next/link";

export default function AdminCategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<Category | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

  // Função para verificar se o usuário é admin
  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const res = await fetch(`${BACKEND}/auth/check`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok || !data.user.is_admin) {
          router.push("/login");
        } else {
          fetchCategories();
        }
      } catch (err) {
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };
    verifyAdmin();
  }, [router, BACKEND]);

  // Função para buscar as categorias do backend
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

  // Função para adicionar uma nova categoria
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) {
      setMessage("O nome da categoria não pode estar vazio.");
      return;
    }
    try {
      const res = await fetch(`${BACKEND}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ Categoria "${data.name}" adicionada com sucesso!`);
        setNewCategoryName("");
        fetchCategories();
      } else {
        setMessage("❌ " + (data.error || "Erro ao adicionar categoria."));
      }
    } catch (err) {
      setMessage("❌ Erro no servidor.");
    }
  };

  // Função para editar uma categoria
  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name) {
      setMessage("O nome da categoria não pode estar vazio.");
      return;
    }
    try {
      const res = await fetch(`${BACKEND}/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingCategory.name }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ Categoria atualizada para "${data.name}"!`);
        setEditingCategory(null);
        fetchCategories();
      } else {
        setMessage("❌ " + (data.error || "Erro ao atualizar categoria."));
      }
    } catch (err) {
      setMessage("❌ Erro no servidor.");
    }
  };

  // Função para deletar uma categoria
  const handleDeleteConfirmed = async () => {
    if (!confirmingDelete) return;
    try {
      const res = await fetch(`${BACKEND}/categories/${confirmingDelete.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setMessage(`✅ Categoria "${confirmingDelete.name}" deletada com sucesso!`);
        fetchCategories();
      } else {
        const data = await res.json();
        setMessage("❌ " + (data.error || "Erro ao deletar categoria."));
      }
    } catch (err) {
      setMessage("❌ Erro no servidor.");
    } finally {
      setConfirmingDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-20 p-6 bg-gray-100 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Categorias</h1>
        <Link href="/admin" className="px-4 py-2 rounded-lg text-white font-bold transition-transform bg-gray-600 hover:bg-gray-700 hover:scale-105">
          Voltar para Produtos
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Adicionar Nova Categoria</h2>
        <form onSubmit={handleAddCategory} className="flex flex-col md:flex-row gap-4">
          {/* Adiciona um label para acessibilidade e conecta-o ao input */}
          <label htmlFor="newCategoryName" className="sr-only">Nome da Categoria</label> 
          <input
            type="text"
            id="newCategoryName" // 💡 Adicionado ID
            name="newCategoryName" // 💡 Adicionado Name
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Nome da Categoria"
            className="flex-grow border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 rounded-lg text-white font-bold transition-transform bg-blue-600 hover:bg-blue-700 hover:scale-105"
          >
            Adicionar
          </button>
        </form>
        {message && <p className="mt-4 text-sm font-medium text-center">{message}</p>}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Categorias Existentes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-3 px-4 text-left font-semibold text-gray-600">ID</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-600">Nome</th>
                <th className="py-3 px-4 text-center font-semibold text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-gray-700">{category.id}</td>
                  <td className="py-3 px-4 text-gray-700">{category.name}</td>
                  <td className="py-3 px-4 text-center flex justify-center gap-2">
                    <button
                      onClick={() => setEditingCategory(category)}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      <MdEdit size={24} />
                    </button>
                    <button
                      onClick={() => setConfirmingDelete(category)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <MdDelete size={24} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Edição */}
      {editingCategory && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
          <div className="relative p-8 w-full max-w-md bg-white rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Editar Categoria</h3>
            <form onSubmit={handleEditCategory} className="flex flex-col gap-4">
               {/* Adiciona label, ID e Name para acessibilidade */}
               <label htmlFor="editCategoryName" className="sr-only">Nome da Categoria</label>
               <input
                type="text"
                id="editCategoryName" // 💡 Adicionado ID
                name="editCategoryName" // 💡 Adicionado Name
                value={editingCategory.name}
                onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                placeholder="Nome da Categoria"
                className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {confirmingDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
          <div className="relative p-8 w-full max-w-md bg-white rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Confirmar Exclusão</h3>
            <p>Tem certeza que deseja deletar a categoria **{confirmingDelete.name}**?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setConfirmingDelete(null)}
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirmed}
                className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
