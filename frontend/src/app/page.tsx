"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import ProductGallery from "@/components/ProductCard";
import Carousel from "@/components/Carousel";
import BannerInformation from "@/components/BannerInformation";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import CategoriesHighlight from "@/components/CategoriesHighlight"; // Importe o componente de destaque de categorias

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <>
      <Navbar />
      <Carousel />
      <BannerInformation />

      {/* Barra de Pesquisa */}
      <div className="px-6">
        <SearchBar onSearch={setSearchTerm} />
      </div>

      {/* Layout com categorias e galeria de produtos */}
      <main className="container mx-auto p-4 flex flex-col md:flex-row gap-8">
        {/* Componente de destaque de categorias */}
        <CategoriesHighlight />

        {/* Galeria de Produtos com filtro */}
        <ProductGallery searchTerm={searchTerm} />
      </main>
     
    </>
  );
}
