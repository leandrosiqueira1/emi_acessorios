
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuração para permitir imagens do Cloudinary
  images: {
    domains: ['res.cloudinary.com'],
  },
  /* outras configurações aqui */
};

export default nextConfig;