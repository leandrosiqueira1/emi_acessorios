"use client";
import React, { useEffect, useState } from "react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
const DEFAULT_CEP = process.env.NEXT_PUBLIC_DEFAULT_CEP || "01001000"; // fallback: São Paulo

export default function FreteEstimate({ productId, weightKg, quantity = 1, subtotal }: { productId: number; weightKg?: number; quantity?: number; subtotal: number }) {
  const [loading, setLoading] = useState(true);
  const [minValor, setMinValor] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const compute = async () => {
      setLoading(true);
      setError(null);
      try {
        const body = {
          destinationCep: DEFAULT_CEP,
          subtotal,
          items: [
            {
              weight_kg: weightKg ?? 0.3,
              quantity,
            },
          ],
        };

        const res = await fetch(`${BACKEND}/shipping/calculate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Erro ao obter frete");
        }

        const data = await res.json();
        // data expected to be an array of options { servico, valor, prazo }
        if (!Array.isArray(data)) {
          throw new Error("Resposta inesperada do servidor de frete");
        }

        const valores = data.map((d: any) => Number(d.valor ?? d.value ?? 0));
        const min = valores.length ? Math.min(...valores) : null;
        if (mounted) setMinValor(min !== null && !Number.isNaN(min) ? min : null);
      } catch (err: any) {
        if (mounted) setError(err.message || "Erro ao calcular frete");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    compute();

    return () => { mounted = false; };
  }, [productId, weightKg, quantity, subtotal]);

  if (loading) return <p className="text-sm text-gray-500">Calculando frete...</p>;
  if (error) return <p className="text-sm text-red-500">{error}</p>;
  if (minValor === null) return <p className="text-sm text-gray-500">Frete indisponível</p>;

  return (
    <p className="text-sm font-semibold text-gray-700">Frete a partir de <span className="text-lg font-extrabold text-[#9061FA]">R$ {minValor.toFixed(2)}</span></p>
  );
}
