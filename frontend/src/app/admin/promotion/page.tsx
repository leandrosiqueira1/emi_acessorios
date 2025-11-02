//frontend/src/app/admin/promotion/page.tsx
'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPromocao() {
  const [title, setTitle] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState("");
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`${BACKEND}/promotions`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        credentials: "include", // 🔹 ESSENCIAL para enviar cookies
        body: JSON.stringify({ 
          title, 
          end_date: new Date(endDate).toISOString() 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Promoção criada!");
        setTitle("");
        setEndDate("");

        setTimeout(() => {
          router.push("/admin/promotions");
        }, 1500);
      } else {
        setMessage(`❌ ${data.error || "Erro desconhecido"}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Erro de conexão com o servidor");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-6 rounded-xl shadow-lg">
      <h1 className="text-xl font-bold mb-4 text-center">Nova Promoção</h1>
      {message && (
        <p 
          className={`text-center mb-3 ${message.startsWith('✅') ? 'text-green-500' : 'text-red-500'}`}
        >
          {message}
        </p>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Título da promoção"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="datetime-local"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-pink-500 to-yellow-400 text-white font-bold py-2 rounded"
        >
          Salvar
        </button>
      </form>
    </div>
  );
}
