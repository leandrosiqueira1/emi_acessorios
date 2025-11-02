// frontend/src/app/hooks/useAdminAuth.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext"; // 💡 CORRIGIDO: Importa do Contexto centralizado 

/**
 * Hook para garantir que apenas usuários administradores possam acessar a página.
 * Redireciona se o usuário não for admin ou se o status de autenticação não puder ser checado.
 */
export const useAdminAuth = (): { isLoading: boolean } => {
    // Assume que AuthContext.tsx fornece isLoggedIn e isAdmin
    const { isLoggedIn, isAdmin } = useAuth(); 
    const [authChecked, setAuthChecked] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Se isLoggedIn é 'undefined', o AuthProvider ainda está carregando ou checando a sessão.
        if (isLoggedIn === undefined) return; 

        if (!isLoggedIn) {
            // Se não está logado, envia para o login geral ou admin login (a rota /admin/login fará a checagem)
            router.push("/admin/login"); 
            return;
        }

        if (isLoggedIn &&!isAdmin) {
            // Logado, mas não é admin, redireciona para a home
            router.push("/");
            return;
        }

        if (isLoggedIn && isAdmin) {
             // Autenticação e autorização OK
        }
        
        // Marca que a checagem inicial foi concluída
        setAuthChecked(true); 
        
    }, [isLoggedIn, isAdmin, router]);

    // Retorna o estado de carregamento para o componente pai
    return { isLoading:!authChecked };
};
// ⚠️ Ação de Limpeza: O arquivo `frontend/src/app/hooks/useAuth.tsx` deve ser deletado.