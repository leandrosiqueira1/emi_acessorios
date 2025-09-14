'use client';
import { useState } from 'react';
import Image from 'next/image';

const slides = [
  {
    title: "Nova Coleção",
    text: "Descubra acessórios exclusivos para todas as ocasiões.",
    button: "Ver Agora",
    image: "/images/laco_azul_branco.jpg",
  },
  {
    title: "Promoções Especiais",
    text: "Ofertas limitadas em peças selecionadas.",
    button: "Aproveitar",
    image: "/images/laco_unicornio.jpg",
  },
  {
    title: "Estilo & Elegância",
    text: "Peças únicas que valorizam sua beleza.",
    button: "Comprar",
    image: "/images/laco_rosa_luxo.jpg",
  },
];

export default function Carousel() {
  const [current, setCurrent] = useState(0);

  const prevSlide = () => setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  const nextSlide = () => setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));

  return (
    <section className="relative w-full h-[80vh] overflow-hidden">
      {/* Slides */}
      <div
        className="flex transition-transform duration-700 ease-in-out h-full"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="w-full flex-shrink-0 relative h-full">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
            />
            {/* Texto sobre a imagem */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 bg-black/30 text-white">
              <h2 className="text-5xl font-bold mb-4">{slide.title}</h2>
              <p className="text-lg mb-6">{slide.text}</p>
              <button className="bg-pink-500 px-6 py-3 rounded-full hover:bg-pink-600 transition">
                {slide.button}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Botões */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-4 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
      >
        ◀
      </button>
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-4 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
      >
        ▶
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-6 w-full flex justify-center gap-2">
        {slides.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full cursor-pointer ${
              current === index ? 'bg-white' : 'bg-gray-400'
            }`}
          ></div>
        ))}
      </div>
    </section>
  );
}
