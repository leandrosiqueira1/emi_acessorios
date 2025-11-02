//frontedn/src/app/checkout/shipping/page.tsx
'use client';
import React, { useState } from 'react';
import { useCart } from '@/app/context/CartContext';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function ShippingPage() {
  const { cartTotal, totalWeightKg, totalLengthCm, totalHeightCm, totalWidthCm } = useCart();
  const [cep, setCep] = useState('');
  const [frete, setFrete] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const calcularFrete = async () => {
    setErro('');
    setLoading(true);
    setFrete([]);

    const cleaned = cep.replace(/\D/g, '');
    if (cleaned.length !== 8) {
      setErro('Por favor, insira um CEP válido.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BACKEND}/shipping/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zipCode: cleaned,
          cartTotal: Number(cartTotal).toFixed(2),
          totalWeightKg,
          totalLengthCm,
          totalHeightCm,
          totalWidthCm,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Erro ao calcular frete');
      }

      const data = await response.json();
      setFrete(data);
    } catch (error: any) {
      console.error('Erro ao calcular frete:', error);
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-3">Calcular Frete</h1>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={cep}
          onChange={(e) => setCep(e.target.value)}
          placeholder="Digite seu CEP"
          maxLength={9}
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={calcularFrete}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
        >
          {loading ? 'Calculando...' : 'Calcular'}
        </button>
      </div>

      {erro && <p className="text-red-500 text-sm mb-2">{erro}</p>}

      {frete.length > 0 && (
        <div className="space-y-2">
          {frete.map((opcao, i) => (
            <div
              key={i}
              className={`p-3 border rounded flex justify-between ${
                opcao.valor === 0 ? 'bg-green-50 border-green-400' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div>
                <div className="font-semibold">{opcao.servico}</div>
                {opcao.prazo && (
                  <div className="text-xs text-gray-600">Prazo: {opcao.prazo} dia(s)</div>
                )}
                {opcao.descricao && (
                  <div className="text-xs text-gray-600">{opcao.descricao}</div>
                )}
              </div>
              <div className="text-lg font-bold">
                {opcao.valor === 0 ? 'GRÁTIS' : `R$ ${opcao.valor.toFixed(2)}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
