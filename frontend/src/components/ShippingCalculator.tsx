//frontend/src/components/ShippingCalculator.tsx
'use client'; 
import React, { useState, useCallback } from 'react';

interface ShippingOption {
  servico: string;
  valor: number;
  prazo: string;
}

interface ProductShippingCalculatorProps {
  productId: number;
  productPrice: number;
  quantity: number;
}

// ✅ Ajustado para compatibilidade com backend
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api';

export default function ProductShippingCalculator({
  productId,
  productPrice,
  quantity,
}: ProductShippingCalculatorProps) {
  const [cep, setCep] = useState('');
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentSubtotal = productPrice * quantity;

  const handleCepChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawCep = event.target.value.replace(/\D/g, '').substring(0, 8);
    setCep(rawCep);
  };

  const calculateShipping = useCallback(async () => {
    if (cep.length !== 8) {
      setError('Por favor, insira um CEP válido com 8 dígitos.');
      setShippingOptions([]);
      return;
    }

    if (quantity <= 0 || currentSubtotal <= 0) {
      setError('Quantidade ou preço inválido para calcular o frete.');
      setShippingOptions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // ✅ Envia no formato que o backend espera
      const res = await fetch(`${BACKEND}/shipping/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cepDestino: cep,
          peso: 0.5,
          comprimento: 20,
          altura: 10,
          largura: 15,
          total: currentSubtotal,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Falha ao calcular o frete.');
      }

      const data = await res.json();
      setShippingOptions(data);
    } catch (err: any) {
      console.error('Erro ao calcular frete:', err);
      setError(err.message || 'Erro de conexão com o servidor de frete.');
      setShippingOptions([]);
    } finally {
      setLoading(false);
    }
  }, [cep, quantity, currentSubtotal]);

  return (
    <div className="mt-4 p-4 border rounded-xl bg-gray-50 shadow-md space-y-3">
      <h3 className="text-lg font-bold text-gray-800 border-b pb-2">
        <span className="inline-block mr-2">📦</span> Calcular Frete
      </h3>

      <p className="text-sm text-gray-600">
        Cálculo para <strong>{quantity} item(s)</strong> — total de{' '}
        <strong>R$ {currentSubtotal.toFixed(2)}</strong>.
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="CEP de Destino"
          value={cep}
          onChange={handleCepChange}
          maxLength={8}
          className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:ring-blue-500 focus:border-blue-500 transition"
        />
        <button
          onClick={calculateShipping}
          disabled={loading || cep.length !== 8}
          className="flex-shrink-0 bg-blue-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Calculando...' : 'Calcular'}
        </button>
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>
      )}

      {shippingOptions.length > 0 && (
        <div className="pt-2 space-y-2">
          <p className="text-sm font-semibold text-gray-700">
            Opções de Envio:
          </p>
          {shippingOptions.map((option, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border flex justify-between items-center transition ${
                option.valor === 0
                  ? 'bg-green-100 border-green-500'
                  : 'bg-white border-gray-200 hover:shadow-sm'
              }`}
            >
              <div>
                <p className="m-0 font-bold text-gray-900">
                  {option.servico}
                </p>
                <p className="m-0 text-xs text-gray-600">
                  Prazo: {option.prazo} dia(s)
                </p>
              </div>
              <span
                className={`text-lg font-extrabold ${
                  option.valor === 0 ? 'text-green-700' : 'text-gray-800'
                }`}
              >
                {option.valor === 0
                  ? 'GRÁTIS'
                  : `R$ ${option.valor.toFixed(2)}`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
