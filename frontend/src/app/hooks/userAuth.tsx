//frontend/src/app/hooks/useAuth.tsx

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Definicao da interface do usuario para a resposta da API
interface User {
username: string;
is_admin: boolean;
}

// Hook personalizado para gerenciar o estado de autenticacao do usuario
export function useAuth() {
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState(true);
const router = useRouter();
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

// Efeito para verificar o status de login quando o componente e montado
useEffect(() => {
const checkAuthStatus = async () => {
    try {
const res = await fetch(`${BACKEND}/auth/check`, {
method: "GET",
credentials: "include", // Envia o cookie de autenticacao
});

if (res.ok) {
const data = await res.json();
setIsLoggedIn(true);
setUser(data.user);
} else {
setIsLoggedIn(false);
setUser(null);
}
} catch (err) {
console.error("Erro ao verificar o status de autenticacao", err);
setIsLoggedIn(false);
setUser(null);
} finally {
setLoading(false);
}
};

checkAuthStatus();
}, [BACKEND]);

// Funcao para fazer logout
const handleLogout = async () => {
try {
const res = await fetch(`${BACKEND}/auth/logout`, {
method: "POST",
credentials: "include",
});
if (res.ok) {
setIsLoggedIn(false);
setUser(null);
router.push("/");
}
} catch (err) {
console.error("Erro ao fazer logout", err);
}
};

return { isLoggedIn, user, loading, handleLogout };
}
