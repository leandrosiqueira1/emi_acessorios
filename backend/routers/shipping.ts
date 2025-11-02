// backend/routers/shipping.js
import express from "express";
import { fetchRealShippingOptions } from "../services/freteService.ts";

const router = express.Router();

const ZIP_ORIGIN = process.env.SHIPPING_ORIGIN_ZIP || "57000000";
const FREE_SHIPPING_MIN = parseFloat(process.env.FREE_SHIPPING_MIN || "150.00"); // mínimo p/ grátis

router.post("/calculate", async (req, res) => {
  console.log("📦 [DEBUG] /shipping/calculate - Body recebido:", req.body);

  try {
    const { destinationCep, subtotal, items } = req.body;

    // 🔹 Validações básicas
    if (!destinationCep) {
      return res.status(400).json({ error: "destinationCep é obrigatório." });
    }

    const destCep = String(destinationCep).replace(/\D/g, "");
    if (destCep.length !== 8) {
      return res.status(400).json({ error: "CEP inválido (precisa ter 8 dígitos)." });
    }

    // 🔹 Frete grátis para compras acima do mínimo
    const fretes = [];
    const freeShipping = parseFloat(subtotal || 0) >= FREE_SHIPPING_MIN;

    if (freeShipping) {
      fretes.push({
        service: "Frete Grátis",
        type: "FREE",
        cost: 0,
        deliveryTime: "2 a 5 dias úteis",
        description: `Frete grátis em pedidos acima de R$ ${FREE_SHIPPING_MIN.toFixed(2)}`,
      });
    }

    // 🔹 Calcula peso/medidas total (mock básico — usa defaults caso o frontend não envie)
    const totalWeightKg =
      items?.reduce((sum, item) => sum + (item.weight_kg || 0.2) * item.quantity, 0) || 0.5;
    const totalLengthCm = 20;
    const totalHeightCm = 10;
    const totalWidthCm = 15;

    // 🔹 Consulta real Correios (caso não tenha frete grátis)
    if (!freeShipping) {
      console.log("📡 Consultando API Correios...");
      const correiosResults = await fetchRealShippingOptions(
        ZIP_ORIGIN,
        destCep,
        totalWeightKg,
        totalLengthCm,
        totalHeightCm,
        totalWidthCm
      );

      correiosResults.forEach((r) => {
        fretes.push({
          service: r.service,
          type: r.type,
          cost: r.cost,
          deliveryTime: r.deliveryTime,
        });
      });

      // Motoboy local (opcional, simulado)
      fretes.push({
        service: "Motoboy (Somente região metropolitana)",
        type: "MOTO",
        cost: subtotal >= 150 ? 0 : 15.0,
        deliveryTime: "1 dia útil",
      });
    }

    console.log("✅ Fretes calculados:", fretes);
    return res.json(fretes);
  } catch (err) {
    console.error("❌ Erro ao calcular frete:", err);
    res.status(500).json({ error: "Erro ao calcular frete." });
  }
});

export default router;
