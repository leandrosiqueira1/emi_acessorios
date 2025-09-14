'use client';
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import CartModal from "./CartModal";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);

  const { cart } = useCart();
  const totalItems = cart.reduce((acc, i) => acc + i.quantity, 0);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const menuItems = ["Início", "Loja", "Sobre", "Contato"];

  return (
    <header className="w-full bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="max-w-full mx-auto px-4 py-3 flex flex-row items-center justify-between">

        {/* LOGO */}
        <div className="text-3xl font-extrabold text-[#9061fa] flex items-center gap-2 pl-10">
          <img className="h-30" src="/logo_mini_querida_02.png" alt="Logo" />
          <span className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-[#64f5ca] via-[#ffa9df] to-[#FFD700]">
            Acessórios
          </span>
        </div>

        {/* DESKTOP MENU */}
        <nav className="hidden md:flex gap-6 font-semibold text-gray-700">
          {menuItems.map((item) => (
            <a
              key={item}
              href="#"
              className="px-5 py-2 rounded-lg bg-gradient-to-tr from-[#64f5ca] via-[#ffa9df] to-[#FFD700] text-black transition transform hover:scale-105 hover:shadow-lg hover:brightness-110 relative overflow-hidden button-glow"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* ÍCONES / BOTÕES */}
        <div className="hidden md:flex items-center gap-4">

          {/* Botão Login */}
          <button className="relative px-4 py-2 rounded-xl bg-gradient-to-tr from-[#64f5ca] via-[#ffa9df] to-[#FFD700] text-black font-bold shadow-lg overflow-hidden hover:scale-105 transition-transform button-glow">
            👤 Login
          </button>

          {/* Botão Favoritos */}
          <button className="relative px-4 py-2 rounded-xl bg-gradient-to-tr from-[#FFD700] via-[#ffa9df] to-[#64f5ca] text-black shadow-lg font-bold overflow-hidden hover:scale-105 transition-transform button-glow">
            ❤️ Favoritos
          </button>

          {/* Botão Carrinho */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative px-4 py-2 rounded-xl bg-gradient-to-tr from-[#FFD700] via-[#ffa9df] to-[#64f5ca] shadow-lg text-black font-bold transition-transform hover:scale-105 button-glow"
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

      {/* BOTÃO MOBILE */}
      <button onClick={toggleMenu} className="md:hidden text-gray-700 absolute top-4 right-4">
        {menuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden bg-white flex px-4 py-4 flex-col gap-3 font-semibold rounded shadow-lg">
          {menuItems.map((item) => (
            <a
              key={item}
              href="#"
              className="rounded-lg px-4 py-2 bg-gradient-to-tr from-[#64f5ca] via-[#ffa9df] to-[#FFD700] text-black text-center transition hover:scale-105 hover:shadow-md button-glow"
            >
              {item}
            </a>
          ))}
        </div>
      )}

      {/* MODAL DO CARRINHO */}
      {cartOpen && <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} />}

      {/* CSS do glow animado */}
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
