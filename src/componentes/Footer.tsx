'use client'; // ⚠️ necessário para usar styled-jsx e interações no client

import Link from "next/link";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-black text-gray-200 mt-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#9061fa]/20 via-[#FFD700]/20 to-[#ffa9df]/20 animate-pulse-slow pointer-events-none"></div>

      <div className="relative max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 z-10">
        {/* Logo e descrição */}
        <div>
          <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#64f5ca] via-[#ffa9df] to-[#FFD700] mb-4">
            Emi Acessórios
          </h2>
          <p className="text-sm text-gray-300">
            A sua loja online de acessórios femininos modernos e sofisticados.
            Qualidade e estilo que você merece.
          </p>
        </div>

        {/* Links rápidos */}
        <div>
          <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#64f5ca] via-[#ffa9df] to-[#FFD700] mb-4">
            Links
          </h3>
          <ul className="space-y-2 text-sm">
            {["Início", "Produtos", "Contato", "Sobre nós"].map((item) => (
              <li key={item}>
                <Link href="#" className="relative hover:text-white transition duration-300 link-glow">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Suporte */}
        <div>
          <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#64f5ca] via-[#ffa9df] to-[#FFD700] mb-4">
            Atendimento
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>Email: suporte@emiacessorios.com</li>
            <li>WhatsApp: (11) 99999-9999</li>
            <li>Seg - Sex: 9h - 18h</li>
          </ul>
        </div>

        {/* Redes sociais */}
        <div>
          <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#64f5ca] via-[#ffa9df] to-[#FFD700] mb-4">
            Siga-nos
          </h3>
          <div className="flex gap-4 text-xl">
            {[FaFacebookF, FaInstagram, FaWhatsapp].map((Icon, idx) => (
              <Link
                key={idx}
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white p-3 rounded-full bg-gradient-to-tr from-[#64f5ca] via-[#ffa9df] to-[#FFD700] shadow-lg transition transform hover:scale-110 hover:shadow-xl hover:animate-pulse"
              >
                <Icon />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Linha inferior */}
      <div className="border-t border-gray-700 text-center py-4 text-sm text-gray-400 relative z-10">
        © {new Date().getFullYear()} Emi Acessórios - Todos os direitos reservados
      </div>

      {/* CSS adicional */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s infinite;
        }
        .link-glow::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border-radius: 4px;
          filter: blur(6px);
          background: linear-gradient(90deg, #64f5ca, #ffa9df, #FFD700);
          opacity: 0.5;
          z-index: -1;
          transition: opacity 0.3s;
        }
        .link-glow:hover::before {
          opacity: 1;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
