// frontend/src/app/admin/page.tsx

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MdDelete } from "react-icons/md";
import { Product } from "@/app/types/products";
import { Category } from "@/app/types/categories";

// Ícone de estrela para destaque
const StarIcon = ({
filled,
...props
}: { filled: boolean } & React.SVGProps<SVGSVGElement>) => (
<svg
{...props}
xmlns="http://www.w3.org/2000/svg"
viewBox="0 0 24 24"
fill={filled ? "currentColor" : "none"}
stroke="currentColor"
strokeWidth="2"
strokeLinecap="round"
strokeLinejoin="round"
>
<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
</svg>
);

export default function AdminPage() {
const [name, setName] = useState("");
const [price, setPrice] = useState("");
const [file, setFile] = useState<File | null>(null);
const [selectedCategoryId, setSelectedCategoryId] = useState<string>("0");
const [message, setMessage] = useState("");
const [products, setProducts] = useState<Product[]>([]);
const [categories, setCategories] = useState<Category[]>([]);
const [isLoading, setIsLoading] = useState(true);

const router = useRouter();
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

// --- Função genérica para verificar e parsear JSON com segurança ---
const getJsonOrHandleError = async (res: Response, defaultError: string) => {
const contentType = res.headers.get("content-type");
if (res.ok && contentType && contentType.includes("application/json")) {
return await res.json();
}
const text = await res.text();
console.error(`⚠️ Resposta não JSON (status ${res.status}):`, text.slice(0, 300));
throw new Error(defaultError);
};

// --- Buscar produtos ---
const fetchProducts = async () => {
try {
const res = await fetch(`${BACKEND}/products`);
const data = await getJsonOrHandleError(res, "Erro ao carregar produtos");
setProducts(data);
} catch (err: any) {
console.error(err);
setMessage("❌ Falha ao carregar produtos. Verifique o backend.");
}
};

// --- Buscar categorias ---
const fetchCategories = async () => {
try {
const res = await fetch(`${BACKEND}/categories`);
const data = await getJsonOrHandleError(res, "Erro ao carregar categorias");
setCategories(data);
} catch (err: any) {
console.error(err);
setMessage("❌ Falha ao carregar categorias. Verifique o backend.");
}
};

// --- Cadastrar produto ---
const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();

if (!file) return setMessage("❌ Selecione uma imagem.");
if (selectedCategoryId === "0") return setMessage("❌ Selecione uma categoria válida.");

const formData = new FormData();
formData.append("name", name);
formData.append("price", price);
formData.append("image", file);
formData.append("category_id", selectedCategoryId);
formData.append("is_featured", "false");

try {
const res = await fetch(`${BACKEND}/products`, {
method: "POST",
body: formData,
credentials: "include",
});

const data = await getJsonOrHandleError(res, "Erro desconhecido ao cadastrar produto");
setMessage("✅ Produto cadastrado com sucesso!");
setName("");
setPrice("");
setFile(null);
setSelectedCategoryId("0");
fetchProducts();
} catch (err: any) {
console.error("Erro ao cadastrar produto:", err);
setMessage("❌ " + err.message);
}
};

// --- Alternar destaque ---
const handleFeatureToggle = async (product: Product) => {
try {
const newFeaturedStatus = !product.is_featured;
const res = await fetch(`${BACKEND}/products/${product.id}`, {
method: "PUT",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ is_featured: newFeaturedStatus }),
credentials: "include",
});

await getJsonOrHandleError(res, "Erro ao atualizar destaque");
setMessage(
`✅ Produto "${product.name}" ${
newFeaturedStatus ? "destacado" : "removido dos destaques"
}.`
);
fetchProducts();
} catch (err: any) {
console.error("Erro ao atualizar destaque:", err);
setMessage("❌ " + err.message);
}
};

// --- Deletar produto ---
const handleDelete = async (productId: number) => {
if (!confirm("Tem certeza que deseja deletar este produto?")) return;

try {
const res = await fetch(`${BACKEND}/products/${productId}`, {
method: "DELETE",
credentials: "include",
});

await getJsonOrHandleError(res, "Erro ao deletar produto");
setMessage("✅ Produto deletado com sucesso!");
fetchProducts();
} catch (err: any) {
console.error("Erro ao deletar produto:", err);
setMessage("❌ " + err.message);
}
};

// --- Logout ---
const handleLogout = async () => {
try {
const res = await fetch(`${BACKEND}/auth/logout`, {
method: "POST",
credentials: "include",
});
if (res.ok) router.push("/login");
else setMessage("❌ Erro ao fazer logout.");
} catch {
setMessage("❌ Falha de conexão com o servidor.");
}
};

// --- Verificar autenticação e carregar dados ---
useEffect(() => {
const init = async () => {
try {
const res = await fetch(`${BACKEND}/auth/check`, {
method: "GET",
credentials: "include",
});

const data = await getJsonOrHandleError(res, "Erro ao verificar login");

if (!data.user?.is_admin) {
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

init();
}, [BACKEND, router]);

// --- Tela de carregamento ---
if (isLoading)
return (
<div className="flex justify-center items-center min-h-screen">
<p>Carregando...</p>
</div>
);

// --- Renderização principal ---
return (
<div className="max-w-4xl mx-auto mt-20 p-4">
<div className="flex justify-between items-center mb-4">
<h1 className="text-2xl font-bold">Admin - Gerenciamento de Produtos</h1>
<div className="flex gap-4">
<Link
href="/admin/categories"
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

{/* --- Formulário de cadastro --- */}
<div className="bg-white p-6 rounded-xl shadow-lg mb-8">
<h2 className="text-xl font-bold mb-4 border-b pb-2">
Cadastrar Novo Produto
</h2>

{categories.length === 0 && (
<div
className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4"
role="alert"
>
<p className="font-bold">Atenção!</p>
<p>
Nenhuma categoria cadastrada. Cadastre uma
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
onChange={(e) => setName(e.target.value)}
placeholder="Nome do Produto"
className="border p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500"
required
/>

<input
value={price}
onChange={(e) => setPrice(e.target.value)}
placeholder="Preço (ex: 49.90)"
className="border p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500"
type="number"
step="0.01"
required
/>

<select
value={selectedCategoryId}
onChange={(e) => setSelectedCategoryId(e.target.value)}
className="border p-3 rounded-lg bg-white appearance-none focus:ring-blue-500 focus:border-blue-500"
required
disabled={categories.length === 0}
>
<option value="0" disabled>
Selecione uma Categoria...
</option>
{categories.map((cat) => (
<option key={cat.id} value={cat.id.toString()}>
{cat.name}
</option>
))}
</select>

<label className="block text-sm font-medium text-gray-700 mt-1">
Imagem do Produto:
</label>
<input
type="file"
onChange={(e) => setFile(e.target.files?.[0] ?? null)}
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
{message && (
<p
className={`mt-3 text-sm font-medium ${
message.startsWith("❌") ? "text-red-600" : "text-green-600"
}`}
>
{message}
</p>
)}
</div>

{/* --- Tabela de produtos --- */}
<div className="bg-white p-6 rounded-xl shadow-lg">
<h2 className="text-xl font-bold mb-4 border-b pb-2">
Produtos Cadastrados ({products.length})
</h2>
<table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
<thead className="bg-gray-100">
<tr>
<th className="py-3 px-4 text-left text-sm font-medium text-gray-600">
Nome
</th>
<th className="py-3 px-4 text-center text-sm font-medium text-gray-600">
Preço
</th>
<th className="py-3 px-4 text-center text-sm font-medium text-gray-600">
Categoria
</th>
<th className="py-3 px-4 text-center text-sm font-medium text-gray-600">
Destaque
</th>
<th className="py-3 px-4 text-center text-sm font-medium text-gray-600">
Ações
</th>
</tr>
</thead>
<tbody>
{products.map((product) => {
const category = categories.find(
(cat) => cat.id === product.category_id
);
return (
<tr
key={product.id}
className="border-t hover:bg-gray-50 transition-colors"
>
<td className="py-3 px-4 text-gray-800">{product.name}</td>
<td className="py-3 px-4 text-center text-gray-800">
R$ {parseFloat(product.price.toString()).toFixed(2)}
</td>
<td className="py-3 px-4 text-center text-gray-800">
{category ? category.name : "N/A"}
</td>
<td className="py-3 px-4 text-center">
<button
onClick={() => handleFeatureToggle(product)}
className={`p-1 rounded-full transition-colors ${
product.is_featured
? "text-yellow-500 hover:text-yellow-600"
: "text-gray-400 hover:text-gray-500"
}`}
title={
product.is_featured
? "Remover dos Destaques"
: "Marcar como Destaque"
}
>
<StarIcon
filled={!!product.is_featured}
className="w-6 h-6 inline-block"
/>
</button>
</td>
<td className="py-3 px-4 text-center">
<button
onClick={() => handleDelete(product.id)}
className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-50"
title="Deletar Produto"
>
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
