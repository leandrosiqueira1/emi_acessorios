'use client';
import { useState, FormEvent, useEffect } from 'react';
// 💡 Como removemos useRouter do AuthContext, vamos usá-lo aqui
import { useRouter } from 'next/navigation'; 
// 💡 Adicionado handleLogout para deslogar usuários não-admin
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 1. Importando handleLogout do contexto
  const { isLoggedIn, isAdmin, setUser, handleLogout } = useAuth();
  const router = useRouter();

  // 1. Efeito para redirecionar imediatamente se o usuário JÁ estiver logado como Admin
  useEffect(() => {
    if (isLoggedIn && isAdmin) {
        // Se já está logado e é admin, redireciona para o painel
        router.push('/admin');
    } else if (isLoggedIn && !isAdmin) {
        // Se está logado, mas não é admin, redireciona para a página inicial (ou mostra um erro)
        setError("Você não tem permissão de administrador.");
        // O redirecionamento aqui não deve ser feito, pois o logout deve ser feito imediatamente
        // A lógica de logout já foi adicionada no bloco de sucesso do handleSubmit
    }
  }, [isLoggedIn, isAdmin, router]);

  // 2. Lógica de submissão do formulário
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // O backend deve usar 'admin-login' ou um endpoint unificado.
        // Assumo que ele aceita 'admin' ou 'user' e verifica a flag 'is_admin' no retorno.
        body: JSON.stringify({ username, password }), 
        credentials: 'include', 
      });

      const data = await res.json();

      if (res.ok) {
        // O backend deve retornar um objeto de usuário, incluindo a flag is_admin
        const user = data.user; 
        
        if (user && user.is_admin) {
          // SUCESSO: Define o usuário no contexto
          setUser(user);
          console.log("Login Admin bem-sucedido. Redirecionando...");
          
          // 💡 CORREÇÃO CRÍTICA: Força a revalidação do estado global
          router.refresh(); 
          router.push('/admin');

        } else {
          // O login foi bem-sucedido, mas o usuário não é um administrador.
          setError('Credenciais válidas, mas o usuário não tem permissão de administrador.');
          
          // 2. Desloga o usuário imediatamente para limpar o cookie de sessão.
          await handleLogout(); 
        }

      } else {
        // Falha no login (ex: 401, 403, 400)
        setError(data.message || 'Nome de usuário ou senha incorretos.');
      }
    } catch (err) {
      console.error('Erro de rede ou servidor:', err);
      setError('Erro de conexão com o servidor. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Se já estiver logado (e o useEffect ainda não redirecionou), mostre um estado de carregamento
  if (isLoggedIn && isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl font-semibold text-purple-600">
          Acesso concedido. Redirecionando para o Painel de Administração...
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border-t-4 border-purple-600">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Acesso Administrativo</h2>
        
        {/* Exibição de Erro */}
        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="username">
              Usuário Admin
            </label>
            <input
              type="text"
              id="username"
              name="username"
              autoComplete="username" // ✅ Corrigido para camelCase
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-150 ease-in-out"
              disabled={loading}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
              Senha
            </label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="current-password" // ✅ Corrigido para camelCase
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-150 ease-in-out"
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            className={`w-full py-3 rounded-lg text-white font-bold transition-all duration-300 ease-in-out ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md hover:shadow-lg transform hover:scale-[1.01]'
            }`}
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar no Painel'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <Link href="/" className="text-purple-600 hover:underline font-semibold">
            ← Voltar para a Loja
          </Link>
        </div>
      </div>
    </div>
  );
}
