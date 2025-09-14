"use client";

import { useState } from "react";
import Navbar from "@/componentes/Navbar";
import ProductGallery from "@/componentes/ProductCard";
import Carousel from "@/componentes/Carousel";
import BannerInformation from "@/componentes/BannerInformation";
import Footer from "@/componentes/Footer";
import SearchBar from "@/componentes/SearchBar";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <>
      <Navbar/>
      <Carousel />
      <BannerInformation />

      {/* Barra de Pesquisa */}
      <div className="px-6">
        <SearchBar onSearch={setSearchTerm} />
      </div>

      {/* Galeria de Produtos com filtro */}
      <ProductGallery searchTerm={searchTerm} />


    </>
  );
}
