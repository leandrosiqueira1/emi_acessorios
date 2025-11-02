//frontend/src/app/products/[id]/page.tsx
'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';

interface ShippingOption {
    servico: string;
    codigo?: string;
    valor: number;
    prazo?: number;
    descricao?: string;
}

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function ProductShippingCalculator({
    productId,
    productPrice,
    productName,
    productImage,
    totalWeightKg,
    totalLengthCm,
    totalHeightCm,
    totalWidthCm,
}: {
    productId?: number;
    productPrice: number;
    productName?: string;
    productImage?: string;
    totalWeightKg?: number;
    totalLengthCm?: number;
    totalHeightCm?: number;
    totalWidthCm?: number;
}) {
    // 💡 CORREÇÃO (toFixed): Garantir que o preço não seja undefined ou null
    const safeProductPrice = productPrice || 0; 
    
    const [cep, setCep] = useState('');
    // Estado inicializado como array vazio
    const [options, setOptions] = useState<ShippingOption>(); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 🔧 Formata o CEP
    const formatCep = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 8);
        return digits.length > 5? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    };

    // 🚚 Calcula o frete
    const calculateShipping = useCallback(async () => {
        setLoading(true);
        setError(null);
        setOptions();
        const cleaned = cep.replace(/\D/g, '');
        if (cleaned.length!== 8) {
            setError('Por favor, insira um CEP válido com 8 dígitos.');
            setLoading(false);
            return;
        }

        try {
            const body = {
                zipCode: cleaned,
                cartTotal: Number(safeProductPrice).toFixed(2), 
                totalWeightKg: totalWeightKg || 0.3,
                totalLengthCm: totalLengthCm || 20,
                totalHeightCm: totalHeightCm || 5,
                totalWidthCm: totalWidthCm || 15,
            };

            const res = await fetch(`${BACKEND}/shipping/calculate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Erro ao calcular frete');
            }

            const data = await res.json();
            setOptions(Array.isArray(data)? data : [data]);
        } catch (err: any) {
            console.error('Erro ao calcular frete:', err);
            setError(err.message || 'Erro de conexão com o servidor.');
        } finally {
            setLoading(false);
        }
    },);

    return (
        <div className="mt-50 p-6 bg-white rounded-2xl shadow-md border border-gray-200">
            {/* Cabeçalho com imagem e nome do produto */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-4">
                <div className="w-32 h-32 relative flex-shrink-0">
                    <Image
                        src={productImage || '/placeholder.png'}
                        alt={productName || 'Produto'}
                        fill
                        className="object-cover rounded-xl border border-gray-100"
                        sizes="(max-width: 768px) 100vw, 200px"
                        priority
                    />
                </div>
                <div className="flex flex-col text-center md:text-left">
                    <h3 className="text-lg font-semibold text-gray-800">{productName || 'Produto'}</h3>
                    <p className="text-xl font-bold text-pink-600 mt-1">R$ {safeProductPrice.toFixed(2)}</p>
                    <p className="text-sm text-gray-500 mt-1">Calcule o frete e o prazo de entrega:</p>
                </div>
            </div>
            {/* Campo de CEP */}
            <div className="flex gap-2 mb-3">
                <input
                    type="text"
                    value={cep}
                    onChange={(e) => setCep(formatCep(e.target.value))}
                    placeholder="Digite seu CEP"
                    maxLength={9}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 outline-none"
                />
                <button
                    onClick={calculateShipping}
                    disabled={loading}
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition disabled:opacity-60"
                >
                    {loading? 'Calculando...' : 'Calcular'}
                </button>
            </div>
            {/* Erro */}
            {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
            {/* Resultados */}
            {/* 💡 CORREÇÃO CRÍTICA (Linha 136): Garante que options seja um array antes de ler length */}
            {Array.isArray(options) && options.length > 0 && ( 
                <div className="space-y-2 animate-fadeIn">
                    {options.map((o, i) => (
                        <div
                            key={i}
                            className={`p-3 rounded-lg border flex justify-between items-center ${
                                o.valor === 0? 'bg-green-50 border-green-400' : 'bg-gray-50 border-gray-200'
                            }`}
                        >
                            <div>
                                <p className="font-medium text-gray-800">{o.servico}</p>
                                {o.prazo && <p className="text-xs text-gray-600">Prazo: {o.prazo} dia(s)</p>}
                                {o.descricao && <p className="text-xs text-gray-600">{o.descricao}</p>}
                            </div>
                            <div className="text-right font-semibold text-lg text-gray-900">
                                {o.valor === 0? 'GRÁTIS' : `R$ ${o.valor.toFixed(2)}`}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}