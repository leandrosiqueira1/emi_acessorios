"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include", // 🔑 envia e salva o cookie JWT
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro no login");

      setMessage("✅ Login realizado!");
      setUsername("");
      setPassword("");

      // se for admin → painel admin
      if (data.user?.is_admin) {
        router.push("/admin");
      } else {
        router.push("/"); // se não for admin, volta pra home
      }
    } catch (err: any) {
      setMessage("❌ " + err.message);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white shadow-lg p-6 rounded-2xl">
      <h1 className="text-2xl font-bold mb-4">Login</h1>

      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="text"
          placeholder="Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border px-3 py-2 rounded-lg"
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border px-3 py-2 rounded-lg"
        />

        <button
          type="submit"
          className="w-full bg-gradient-to-tr from-[#64f5ca] via-[#ffa9df] to-[#FFD700] 
                     text-black font-bold py-2 rounded-xl hover:scale-105 transition-transform"
        >
          Entrar
        </button>
      </form>

      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}
