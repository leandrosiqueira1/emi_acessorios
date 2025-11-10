'use client';
import React, { useState, useCallback } from 'react';

interface ShippingOption {
  servico: string;
  codigo?: string;
  valor: number;
  prazo?: number;
  descricao?: string;
}

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function ProductShippingCalculator({
  productPrice,
  totalWeightKg,
  totalLengthCm,
  totalHeightCm,
  totalWidthCm,
}: {
  productPrice: number;
  totalWeightKg?: number;
  totalLengthCm?: number;
  totalHeightCm?: number;
  totalWidthCm?: number;
}) {
  const [cep, setCep] = useState('');
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const formatCep = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
  };

  const calculateShipping = useCallback(async () => {
    setLoading(true);
    setError(null);
    setOptions([]);

    const cleaned = cep.replace(/\D/g, '');
    if (cleaned.length !== 8) {
      setError('Por favor, insira um CEP válido com 8 dígitos.');
      setLoading(false);
      return;
    }

    try {
      const body = {
        zipCode: cleaned,
        cartTotal: Number(productPrice).toFixed(2),
        totalWeightKg: totalWeightKg || 0.3,
        totalLengthCm: totalLengthCm || 20,
        totalHeightCm: totalHeightCm || 5,
        totalWidthCm: totalWidthCm || 15,
      };

      // Debug: mostrar body enviado e status
      setDebugLog(`[DEBUG] /shipping/calculate - Body recebido: ${JSON.stringify(body, null, 2)}`);
      setStatusMessage('📡 Consultando API Correios...');

      const res = await fetch(`${BACKEND}/shipping/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const text = await res.text(); // <-- lê o corpo cru
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: 'Resposta inválida do servidor.' };
      }

      if (!res.ok) throw new Error(data.error || 'Erro ao calcular frete');
      setOptions(Array.isArray(data) ? data : [data]);
      setStatusMessage('✅ Fretes recebidos');
      setDebugLog((prev) => prev + "\n\nResposta do servidor:\n" + JSON.stringify(data, null, 2));
    } catch (err: any) {
      console.error('Erro ao calcular frete:', err);
      setError(err.message || 'Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  }, [cep, productPrice, totalWeightKg, totalLengthCm, totalHeightCm, totalWidthCm]);

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Calcular Frete</h3>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          id="checkoutCep"
          name="checkoutCep"
          value={cep}
          onChange={(e) => setCep(formatCep(e.target.value))}
          placeholder="Digite seu CEP"
          maxLength={9}
          autoComplete="postal-code"
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={calculateShipping}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-60"
        >
          {loading ? 'Calculando...' : 'Calcular'}
        </button>
      </div>

      {error && <p className="text-sm text-red-500 mb-2">{error}</p>}

  {statusMessage && <p className="text-sm text-gray-600 mb-2">{statusMessage}</p>}

      {options.length > 0 && (
        <div className="space-y-2">
          {options.map((o, i) => (
            <div
              key={i}
              className={`p-3 rounded border flex justify-between items-center ${
                o.valor === 0 ? 'bg-green-50 border-green-400' : 'bg-white border-gray-200'
              }`}
            >
              <div>
                <p className="font-medium">{o.servico}</p>
                {o.prazo !== undefined && (
                  <p className="text-xs text-gray-600">Prazo: {o.prazo} dia(s)</p>
                )}
                {o.descricao && <p className="text-xs text-gray-600">{o.descricao}</p>}
              </div>
              <div className="text-right font-semibold text-lg">
                {o.valor === 0 ? 'GRÁTIS' : `R$ ${o.valor.toFixed(2)}`}
              </div>
            </div>
          ))}
        </div>
      )}

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
