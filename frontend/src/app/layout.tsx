// frontend/src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/app/context/AuthContext"; // 💡 CORRIGIDO: Importação do AuthProvider
import { CartProvider } from "@/app/context/CartContext";
import { FavoritesProvider } from "@/app/context/FavoritesContext"; 
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Mine Querida Acessorios",
    description: "Loja de acessórios femininos modernos e sofisticados",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR">
            <body
                suppressHydrationWarning
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                {/* 💡 CORREÇÃO CRÍTICA: AuthProvider deve envolver todos os Providers e a Navbar */}
                <AuthProvider> 
                    <CartProvider>
                        <FavoritesProvider> 
                            <div className="flex flex-col min-h-screen">
                                <Navbar />
                                {/* pt-20 para dar espaço à Navbar fixa no topo */}
                                <main className="flex-grow pt-20"> 
                                    {children}
                                </main>
                                <Footer />
                            </div>
                        </FavoritesProvider>
                    </CartProvider>
                </AuthProvider>
            </body>
        </html>
    );
}