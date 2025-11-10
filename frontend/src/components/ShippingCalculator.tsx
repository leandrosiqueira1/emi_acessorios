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

// ✅ Ajustado para compatibilidade com backend (sem `/api` para coincidir com as rotas do servidor)
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function ProductShippingCalculator({
  productId,
  productPrice,
  quantity,
}: ProductShippingCalculatorProps) {
  const [cep, setCep] = useState('');
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

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
      // ✅ Envia no formato que o backend espera (destinationCep, subtotal, items)
      const body = {
        destinationCep: cep,
        subtotal: currentSubtotal,
        // items com peso/quantidade ajudam o backend a calcular peso total, se disponível
        items: [
          {
            weight_kg: 0.5,
            quantity: quantity,
          },
        ],
      };

      // Exibe debug com o body enviado e uma mensagem de consulta aos Correios
      setDebugLog(`[DEBUG] /shipping/calculate - Body recebido: ${JSON.stringify(body, null, 2)}`);
      setStatusMessage('📡 Consultando API Correios...');

      const res = await fetch(`${BACKEND}/shipping/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Falha ao calcular o frete.');
      }

      const data = await res.json();
      setShippingOptions(data);
      setStatusMessage('✅ Fretes recebidos');
      setDebugLog((prev) => prev + "\n\nResposta do servidor:\n" + JSON.stringify(data, null, 2));
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
          id="destinationCep"
          name="destinationCep"
          placeholder="CEP de Destino"
          value={cep}
          onChange={handleCepChange}
          maxLength={8}
          autoComplete="postal-code"
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

      {/* Mensagem de status (ex.: consultando API Correios) */}
      {statusMessage && (
        <p className="text-sm text-gray-600 mt-2">{statusMessage}</p>
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

      {/* Caixa de debug: exibe o array de fretes calculados em texto formatado */}
      {shippingOptions.length > 0 && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Fretes calculados:</label>
          <textarea
            readOnly
            value={JSON.stringify(shippingOptions, null, 2)}
            className="w-full h-40 p-2 border rounded bg-gray-50 font-mono text-sm whitespace-pre overflow-auto"
          />
        </div>
      )}

      {/* Caixa de debug do request/response */}
      {debugLog && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Debug:</label>
          <textarea
            readOnly
            value={debugLog}
            className="w-full h-40 p-2 border rounded bg-gray-50 font-mono text-sm whitespace-pre overflow-auto"
          />
        </div>
      )}
    </div>
  );
}
