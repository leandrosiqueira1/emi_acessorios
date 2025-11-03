"use client";
import React, { useState } from "react";

type Props = {
  src: string;
  alt?: string;
  className?: string;
  placeholder?: string;
};

export default function ProductImage({ src, alt = "Imagem do produto", className, placeholder }: Props) {
  const PLACEHOLDER = placeholder || "https://placehold.co/600x600/e0e0e0/555555?text=Sem+Imagem";
  const [currentSrc, setCurrentSrc] = useState(src || PLACEHOLDER);

  const handleError = () => {
    if (currentSrc !== PLACEHOLDER) setCurrentSrc(PLACEHOLDER);
  };

  return (
    // Este é um Client Component, pode usar handlers no elemento
    // Mantemos uma tag img simples para máxima compatibilidade
    <img src={currentSrc} alt={alt} className={className} onError={handleError} />
  );
}
