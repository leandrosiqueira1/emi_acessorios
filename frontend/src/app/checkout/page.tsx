//frontend/src/app/checkout/page.tsx
'use client';
import React, { useState } from 'react';
import { useCart } from '@/app/context/CartContext';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function CheckoutPage() {
  const { cartTotal, totalWeightKg, totalLengthCm, totalHeightCm, totalWidthCm } = useCart();
  const [cep, setCep] = useState('');
  const [frete, setFrete] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const calcularFrete = async () => {
    setLoading(true);
    setFrete([]);

    const cleaned = cep.replace(/\D/g, '');
    if (cleaned.length !== 8) {
      alert('Digite um CEP válido.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BACKEND}/shipping/calculate`, {
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

      if (!res.ok) throw new Error('Erro ao calcular frete');
      const data = await res.json();
      setFrete(data);
    } catch (err) {
      console.error(err);
      alert('Erro ao calcular frete.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={cep}
          onChange={(e) => setCep(e.target.value)}
          placeholder="CEP de entrega"
          maxLength={9}
          className="flex-1 border p-2 rounded"
        />
        <button
          onClick={calcularFrete}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
        >
          {loading ? 'Calculando...' : 'Calcular Frete'}
        </button>
      </div>

      {frete.length > 0 && (
        <div className="space-y-2">
          {frete.map((o, i) => (
            <div key={i} className="p-3 border rounded flex justify-between items-center">
              <div>
                <div className="font-semibold">{o.servico}</div>
                {o.prazo && <div className="text-xs text-gray-600">Prazo: {o.prazo} dia(s)</div>}
              </div>
              <div className="font-bold text-lg">
                {o.valor === 0 ? 'GRÁTIS' : `R$ ${o.valor.toFixed(2)}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
