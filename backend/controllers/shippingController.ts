import { fetchRealShippingOptions } from '../services/freteService.ts';

/**
 * Endpoint para calcular o frete usando as dimensões e peso dos itens do carrinho.
 * O frontend deve enviar CEP de destino, peso total e dimensões totais.
 * * Rota: POST /api/shipping/calculate
 */
export async function calculateShipping(req, res) {
    // Valores de origem fixos (exemplo)
    // 💡 NOTA: Mantenha o CEP de origem em variáveis de ambiente em produção.
    const zipCodeOrigin = process.env.ORIGIN_ZIP_CODE || '01001000'; 
    
    // Dados esperados do corpo da requisição POST
    const { 
        zipCodeDestination, 
        totalWeightKg, 
        totalLengthCm, 
        totalHeightCm, 
        totalWidthCm 
    } = req.body;

    // Validação básica dos dados necessários
    if (!zipCodeDestination) {
        return res.status(400).json({ 
            error: "O CEP de destino é obrigatório." 
        });
    }
    
    // totalWeightKg pode vir como string ou number do frontend.
    const weight = parseFloat(totalWeightKg);
    if (isNaN(weight) || weight <= 0) {
         // O peso é crucial para o cálculo dos Correios.
        return res.status(400).json({ 
            error: "Peso total inválido ou ausente." 
        });
    }

    try {
        // O service lida com os valores de dimensões mínimas e sanitização de peso/dimensões.
        const options = await fetchRealShippingOptions(
            zipCodeOrigin, 
            zipCodeDestination, 
            weight, 
            parseFloat(totalLengthCm || 0),
            parseFloat(totalHeightCm || 0),
            parseFloat(totalWidthCm || 0)
        );

        // Retorna as opções válidas de frete (PAC, SEDEX, etc.)
        return res.json(options);

    } catch (error) {
        console.error("Erro no controller ao calcular frete:", error);
        // Retorna 500 para falha de comunicação com o serviço dos Correios
        return res.status(500).json({ 
            error: "Falha interna ao calcular frete. Verifique as credenciais dos Correios e o CEP de origem.",
            details: error.message 
        });
    }
}
