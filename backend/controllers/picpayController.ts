// backend/controllers/picpayController.js

import { pool as db } from '../db.ts';
// **IMPORTANTE:** Este token deve ser a mesma chave secreta que o PicPay usa para autenticar o callback.
const PICPAY_TOKEN = process.env.PICPAY_TOKEN; 

/**
 * Lida com o webhook de notificação do PicPay.
 */

export const handlePicPayCallback = async (req, res) => {
    // referenceId = orderId (enviado na requisição de criação do pedido)
    const { referenceId, status } = req.body;
    
    // 1. Verificação de Segurança (Token de Callback)
    const picpayToken = req.headers['x-picpay-token']; // O PicPay geralmente envia a chave aqui

    if (picpayToken !== PICPAY_TOKEN) {
        console.warn(`Tentativa de acesso não autorizado ao webhook PicPay para referenceId: ${referenceId}`);
        // Retorna 403 (Proibido) para o PicPay em caso de token inválido
        return res.status(403).json({ error: 'Token de autenticação inválido.' });
    }

    if (!referenceId || !status) {
        return res.status(400).json({ error: 'Dados incompletos do PicPay.' });
    }

    // 2. Mapeamento e Definição do Novo Status
    let newStatus;
    switch (status) {
        case 'paid':
        case 'completed':
            newStatus = 'paid'; // O pagamento foi confirmado
            break;
        case 'refunded':
        case 'chargeback':
        case 'cancelled': // Incluindo cancelado, se o PicPay notificar
            newStatus = 'cancelled';
            break;
        default:
            // Não atualiza status temporários (pending, analysis, etc.)
            return res.status(200).json({ message: `Status ${status} recebido, nenhuma ação de atualização necessária.` });
    }

    // 3. Atualização do Status do Pedido no DB
    try {
        const updateQuery = `
            UPDATE orders 
            SET status = $1, updated_at = NOW() 
            WHERE id = $2 AND status != $1 -- Evita atualizar se o status for o mesmo
            RETURNING id, status
        `;
        const result = await db.query(updateQuery, [newStatus, referenceId]); 

        if (result.rowCount > 0) {
            console.log(`Status do Pedido ${referenceId} atualizado para ${newStatus} via PicPay Webhook.`);
        }

        // Resposta obrigatória (código 200) para o PicPay, confirmando o recebimento
        res.status(200).json({ message: 'Callback processado com sucesso.' });
        
    } catch (error) {
        console.error('Erro ao processar callback PicPay:', error);
        res.status(500).json({ error: 'Falha interna ao processar o webhook.' });
    }
};