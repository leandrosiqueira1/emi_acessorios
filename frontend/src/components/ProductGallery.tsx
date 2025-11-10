"use client";
import React, { useState } from "react";
import ProductImage from "@/components/ProductImage";

type Props = {
  images: string[];
  alt?: string;
};

export default function ProductGallery({ images, alt = "Imagem do produto" }: Props) {
  const imgs = images && images.length ? images : ["https://placehold.co/600x600/e0e0e0/555555?text=Sem+Imagem"];
  const [selected, setSelected] = useState(0);

  return (
    <div>
      <div className="w-full h-[560px] flex items-center justify-center overflow-hidden rounded-xl bg-white">
        <ProductImage
          src={imgs[selected]}
          alt={`${alt} ${selected + 1}`}
          className="w-full h-full object-contain"
          placeholder="https://placehold.co/600x600/e0e0e0/555555?text=Sem+Imagem"
        />
      </div>

      <div className="mt-4 flex items-center gap-3 overflow-x-auto">
        {imgs.map((src, idx) => (
          <button
            key={idx}
            onClick={() => setSelected(idx)}
            className={`flex-shrink-0 w-20 h-20 border rounded-md overflow-hidden focus:outline-none transition ${
              idx === selected ? "ring-2 ring-[#9061FA]" : "border-gray-200"
            }`}
            aria-label={`Selecionar imagem ${idx + 1}`}
          >
            <img src={src} alt={`${alt} thumb ${idx + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
