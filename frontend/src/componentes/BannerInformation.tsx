import { FaRuler, FaTruck, FaLock, FaHeadset } from "react-icons/fa";

const BannerInformation = () => {
  const items = [
    {
      icon: <FaRuler />,
      title: "DÚVIDAS SOBRE TAMANHOS",
      desc: "Só chamar a gente no WhatsApp",
    },
    {
      icon: <FaTruck />,
      title: "FRETE GRÁTIS",
      desc: "Em pedidos acima de R$199",
    },
    {
      icon: <FaLock />,
      title: "PAGAMENTO SEGURO",
      desc: "Cartão, Pix e Boleto",
    },
    {
      icon: <FaHeadset />,
      title: "ATENDIMENTO RÁPIDO",
      desc: "Suporte via WhatsApp",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 p-8 bg-white">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-center bg-gradient-to-tr from-[#64f5ca] via-[#ffa9df] to-[#ffd700] border border-[#fc8eff] rounded-xl p-6 shadow-lg hover:shadow-[#64f5ca]/80 transition-transform hover:scale-105"
        >
          {/* Ícone dentro do círculo luxuoso com glow */}
          <div className="flex items-center justify-center h-16 w-16 rounded-full text-black text-2xl shadow-xl mr-4">
            {item.icon}
          </div>
          {/* Texto */}
          <div>
            <div className="font-extrabold text3xl text-lg text-black text-shadow-lg">
              {item.title}
            </div>
            <div className="text-sm text-black text-3lx text-shadow-lg">{item.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BannerInformation;
