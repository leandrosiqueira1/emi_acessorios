'use client';
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import CartModal from "./CartModal";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  const router = useRouter();
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

  const { cart } = useCart();
  const totalItems = cart.reduce((acc, i) => acc + i.quantity, 0);

  const checkLoginStatus = async () => {
    try {
      const res = await fetch(`${BACKEND}/auth/check`, {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setIsLoggedIn(true);
        setUsername(data.user.username);
      } else {
        setIsLoggedIn(false);
        setUsername("");
      }
    } catch {
      setIsLoggedIn(false);
      setUsername("");
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch(`${BACKEND}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        setIsLoggedIn(false);
        setUsername("");
        router.push("/");
      }
    } catch (err) {
      console.error("Erro ao fazer logout", err);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    checkLoginStatus();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Aqui defina as rotas reais do seu app
  const menuItems = [
    { name: "Início", path: "/" },
    { name: "Loja", path: "/loja" },
    { name: "Sobre", path: "/sobre" },
    { name: "Contato", path: "/contato" },
  ];

  return (
    <header className="w-full bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto px-4 py-3 flex flex-wrap items-center justify-between lg:flex-nowrap lg:justify-start lg:gap-8">
        {/* LOGO */}
        <div className="flex items-center justify-between w-full lg:w-auto">
          <div className="flex items-center gap-2 pl-4">
            <img className="h-30" src="/images/logo_mini_querida_02.png" alt="Logo" />
            <span className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-[#64f5ca] via-[#ffa9df] to-[#FFD700]">
              Acessórios
            </span>
          </div>

          <div className="flex items-center gap-4 lg:hidden pr-4">
            <button
              onClick={() => { setCartOpen(true); setMenuOpen(false); }}
              className="relative p-2 rounded-full bg-gradient-to-tr from-[#FFD700] via-[#ffa9df] to-[#64f5ca] shadow-lg text-black font-bold transition-transform hover:scale-105 button-glow"
            >
              🛍️
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center text-[10px] rounded-full bg-[#FFD700] text-[#9061fa] shadow-md">
                  {totalItems}
                </span>
              )}
            </button>

            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="relative p-2 rounded-full bg-gradient-to-tr from-red-500 via-red-600 to-red-700 text-white font-bold shadow-lg overflow-hidden hover:scale-105 transition-transform button-glow flex items-center justify-center"
              >
                🚪
              </button>
            ) : (
              <Link
                href="/login"
                className="relative p-2 rounded-full bg-gradient-to-tr from-[#64f5ca] via-[#ffa9df] to-[#FFD700] text-black font-bold shadow-lg overflow-hidden hover:scale-105 transition-transform button-glow flex items-center justify-center"
              >
                👤
              </Link>
            )}

            <button onClick={toggleMenu} className="text-gray-700">
              {menuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* MENU DESKTOP */}
        <nav className="hidden lg:flex gap-6 font-semibold text-gray-700">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className="px-5 py-2 rounded-lg bg-gradient-to-tr from-[#64f5ca] via-[#ffa9df] to-[#FFD700] text-black transition transform hover:scale-105 hover:shadow-lg hover:brightness-110 relative overflow-hidden button-glow"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* AÇÕES DESKTOP */}
        <div className="hidden lg:flex items-center gap-4 ml-auto">
          {isLoggedIn && (
            <span className="text-sm font-semibold text-gray-700">Olá, {username}!</span>
          )}

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="relative h-12 px-6 rounded-xl bg-gradient-to-tr from-red-500 via-red-600 to-red-700 text-white font-bold shadow-lg overflow-hidden hover:scale-105 transition-transform button-glow flex items-center justify-center gap-2"
            >
              Sair
            </button>
          ) : (
            <Link
              href="/login"
              className="relative h-12 px-6 rounded-xl bg-gradient-to-tr from-[#64f5ca] via-[#ffa9df] to-[#FFD700] text-black font-bold shadow-lg overflow-hidden hover:scale-105 transition-transform button-glow flex items-center justify-center gap-2"
            >
              👤 Login
            </Link>
          )}

          <Link
            href="/favoritos"
            className="relative h-12 px-6 rounded-xl bg-gradient-to-tr from-[#FFD700] via-[#ffa9df] to-[#64f5ca] text-black shadow-lg font-bold overflow-hidden hover:scale-105 transition-transform button-glow flex items-center justify-center"
          >
            ❤️ Favoritos
          </Link>

          <button
            onClick={() => setCartOpen(true)}
            className="relative h-12 px-6 rounded-xl bg-gradient-to-tr from-[#FFD700] via-[#ffa9df] to-[#64f5ca] shadow-lg text-black font-bold transition-transform hover:scale-105 button-glow flex items-center justify-center"
          >
            🛍️
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs rounded-full bg-[#FFD700] text-[#9061fa] shadow-md">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* MENU MOBILE */}
      {menuOpen && (
        <div className="lg:hidden bg-white flex flex-col gap-3 font-semibold rounded shadow-lg px-4 py-4 absolute w-full top-16 left-0">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className="rounded-lg px-4 py-2 bg-gradient-to-tr from-[#64f5ca] via-[#ffa9df] to-[#FFD700] text-black text-center transition hover:scale-105 hover:shadow-md button-glow"
              onClick={() => setMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <div className="flex flex-col gap-3 mt-4 border-t pt-4">
            <Link
              href="/favoritos"
              className="relative px-4 py-2 rounded-xl bg-gradient-to-tr from-[#FFD700] via-[#ffa9df] to-[#64f5ca] text-black shadow-lg font-bold overflow-hidden hover:scale-105 transition-transform button-glow flex items-center justify-center"
            >
              ❤️ Favoritos
            </Link>
            {isLoggedIn && (
              <span className="text-center font-bold text-gray-700">Olá, {username}!</span>
            )}
          </div>
        </div>
      )}

      {cartOpen && <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} />}

      <style jsx>{`
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 10px #64f5ca; }
          33% { box-shadow: 0 0 10px #ffa9df; }
          66% { box-shadow: 0 0 10px #FFD700; }
          100% { box-shadow: 0 0 10px #64f5ca; }
        }
        .button-glow::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          border-radius: inherit;
          filter: blur(10px);
          z-index: -1;
          animation: pulseGlow 3s infinite;
        }
      `}</style>
    </header>
  );
}
