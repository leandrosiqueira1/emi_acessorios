// backend/services/freteServices.js
import pkg from 'node-correios';
const CorreiosClass = pkg.default || pkg;
const Service = pkg.Service || { PAC: '04510', SEDEX: '04014' };
const correios = new CorreiosClass();

/**
 * Retorna as opções reais de frete (PAC/SEDEX)
 * @returns [{ service, cost, deliveryTime, type }]
 */
export async function fetchRealShippingOptions(
  zipOrigin,
  zipDestination,
  totalWeightKg,
  totalLengthCm,
  totalHeightCm,
  totalWidthCm
) {
  try {
    const services = [Service.PAC || '04510', Service.SEDEX || '04014'];

    const results = await correios.calcPreco({
      nCdServico: services,
      sCepOrigem: String(zipOrigin).replace(/\D/g, ''),
      sCepDestino: String(zipDestination).replace(/\D/g, ''),
      nVlPeso: Number(totalWeightKg).toFixed(2),
      nCdFormato: 1,
      nVlComprimento: Math.max(16, Number(totalLengthCm) || 16),
      nVlAltura: Math.max(2, Number(totalHeightCm) || 2),
      nVlLargura: Math.max(11, Number(totalWidthCm) || 11),
      nVlValorDeclarado: 0,
      sCdMaoPropria: 'N',
      nCdAvisoRecebimento: 'N',
    });

    const arr = Array.isArray(results) ? results : [results];

    return arr
      .filter((r) => !!r.Valor)
      .map((r) => ({
        service: r.Nome || r.Codigo,
        cost: parseFloat(String(r.Valor).replace(',', '.')),
        deliveryTime: `${r.PrazoEntrega}`,
        type: r.Codigo,
      }));
  } catch (err) {
    console.error('Erro no fetchRealShippingOptions:', err);
    return [];
  }
}
