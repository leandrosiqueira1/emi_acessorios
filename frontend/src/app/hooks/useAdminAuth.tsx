//frontend/src/app/hooks/useAdminAuth.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAdminAuth"; // Importa o hook de autenticação principal

/**
* Hook para garantir que apenas usuários administradores possam acessar a página.
* Se o usuário não for admin ou não estiver logado, ele é redirecionado.
* @returns {boolean} Retorna true se o usuário for um admin e estiver carregando.
*/
export const useAdminAuth = (): { isLoading: boolean } => {
const { user, isLoading, isLoggedIn } = useAuth();
const router = useRouter();

useEffect(() => {
// Só executa a verificação se o carregamento inicial (isLoading) tiver terminado.
if (!isLoading) {
// 1. Se não estiver logado, redireciona para a página de login.
if (!isLoggedIn) {
console.log("Usuário não logado. Redirecionando para login.");
router.push("/login");
return;
}

// 2. Se estiver logado, mas não for admin, redireciona para a página inicial (ou mostra erro).
// 'user' nunca será null aqui se isLoggedIn for true.
if (user && !user.is_admin) {
console.log("Usuário não é administrador. Redirecionando para home.");
// Você pode mostrar uma mensagem de erro antes de redirecionar, se quiser.
router.push("/");
return;
}

// 3. Se for admin, a execução do componente continua normalmente.
console.log("Acesso de administrador concedido.");
}
}, [isLoading, isLoggedIn, user, router]);

// Enquanto estiver carregando, retornamos o estado para que o componente possa renderizar um Spinner ou tela de carregamento
return { isLoading };
};
export { useAuth };

