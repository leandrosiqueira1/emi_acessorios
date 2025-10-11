'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {User} from "@/app/types/use"
// import { useRouter } from 'next/navigation'; // Removido para resolver o erro de compilação


interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  checkLoginStatus: () => void;
  handleLogout: () => void;
  // Função para usar após um login bem-sucedido
  setUser: (user: User | null) => void; 
}

// Inicializa o contexto com valores padrão
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

// --- Componente Provedor ---
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);

  const isLoggedIn = !!user;
  const isAdmin = user?.is_admin || false;

  // Função centralizada para verificar o status de login
  const checkLoginStatus = useCallback(async () => {
    console.log("Verificando status de login...");
    try {
      const res = await fetch(`${BACKEND}/auth/check`, {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        // Assume que o backend retorna { user: { id, username, is_admin } }
        setUserState(data.user);
        console.log("Usuário logado:", data.user.username);
      } else {
        // Recebendo 401 (Unauthorized) - Comportamento esperado para usuário deslogado.
        setUserState(null); 
        // Não é necessário logar o 401 aqui, pois é um comportamento de deslogado.
      }
    } catch (err) {
      // Este log é para erros de rede, não 401.
      console.error("Erro de conexão ou falha na checagem de auth:", err);
      setUserState(null);
    }
  }, []); // Sem dependências, pois BACKEND é uma constante

  // Função para lidar com o logout (enviada para a Navbar)
  const handleLogout = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        setUserState(null); // Limpa o estado
        
        // 💡 WORKAROUND: Redireciona via window.location, pois useRouter não está disponível
        if (typeof window !== 'undefined') {
          window.location.href = "/";
        }
      }
    } catch (err) {
      console.error("Erro ao fazer logout", err);
    }
  }, []); // Sem dependências

  
  // Efeito que roda APENAS NA MONTAGEM (uma vez) para checar o status de login
  useEffect(() => {
    checkLoginStatus(); 
  }, [checkLoginStatus]); // Depende do useCallback para evitar loop

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn,
      isAdmin,
      checkLoginStatus,
      handleLogout,
      setUser: setUserState, // Permite que a página de Login defina o usuário
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Hook personalizado ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
