// backend/controllers/orderController.js

import { pool as db } from '../db.ts';

// Função Auxiliar: Calcular o Preço do Pedido com base no DB
const calculateOrderPrice = async (items) => {
    // 1. Extrai IDs dos produtos
    const productIds = items.map(item => item.productId);
    
    // 2. Busca os preços ATUAIS dos produtos no DB (segurança)
    const query = `
        SELECT id, price 
        FROM products 
        WHERE id = ANY($1::int[])
    `;
    const productRes = await db.query(query, [productIds]);
    
    // Mapeia preços e verifica se todos os IDs foram encontrados
    const productPrices = productRes.rows.reduce((map, p) => {
        map[p.id] = parseFloat(p.price);
        return map;
    }, {});
    
    // 3. Calcula o subtotal e verifica a integridade dos dados
    let subtotal = 0;
    const itemsWithPrice = [];
    
    for (const item of items) {
        const price = productPrices[item.productId];
        if (price === undefined) {
            throw new Error(`Produto com ID ${item.productId} não encontrado ou sem preço.`);
        }
        
        const unit_price = price;
        subtotal += unit_price * item.quantity;
        
        itemsWithPrice.push({
            ...item,
            unit_price: unit_price
        });
    }

    return { subtotal, itemsWithPrice };
};


// Função Principal: Criar um Novo Pedido (/orders POST)
export const createOrder = async (req, res) => {
    // 🚨 ASSUNÇÃO: req.user.id é fornecido pelo middleware de autenticação
    const userId = req.user.id; 
    
    const { 
        shippingAddress, 
        shippingCost, 
        paymentMethod, 
        items, // Lista de { productId, quantity }
    } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'O carrinho está vazio.' });
    }
    // ⚠️ Atenção: Com o Frete Grátis, o custo de frete PODE ser 0. 
    // Removi a validação de que deve ser > 0 para não quebrar a lógica de Fortaleza.
    
    // Inicia uma Transação Segura
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        // 1. Calcular valores e buscar preços do DB
        const { subtotal, itemsWithPrice } = await calculateOrderPrice(items);

        let totalAmount = subtotal + parseFloat(shippingCost);
        let discount = 0;
        
        // Aplicar desconto PIX (5%)
        if (paymentMethod === 'pix') {
            discount = subtotal * 0.05;
            totalAmount -= discount;
        }
        
        // Formata o endereço para JSONB
        const shippingAddressJson = JSON.stringify(shippingAddress);

        // 2. Criar registro na tabela 'orders'
        const orderQuery = `
            INSERT INTO orders (user_id, total_amount, shipping_address_json, shipping_cost, payment_method)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, total_amount
        `;
        const orderRes = await client.query(orderQuery, [
            userId, 
            totalAmount.toFixed(2), 
            shippingAddressJson, 
            parseFloat(shippingCost).toFixed(2), 
            paymentMethod
        ]);
        const orderId = orderRes.rows[0].id;
        
        // 3. Inserir itens na tabela 'order_items'
        const itemValues = itemsWithPrice.map((item, index) => {
            return `($${1 + index * 4}, $${2 + index * 4}, $${3 + index * 4}, $${4 + index * 4})`;
        }).join(', ');
        
        const itemParams = itemsWithPrice.flatMap(item => [
            orderId, 
            item.productId, 
            item.quantity, 
            item.unit_price.toFixed(2)
        ]);
        
        const itemsQuery = `
            INSERT INTO order_items (order_id, product_id, quantity, unit_price)
            VALUES ${itemValues}
        `;
        
        await client.query(itemsQuery, itemParams);
        
        // 4. Simular processamento de pagamento
        let paymentDetails = null;
        if (paymentMethod === 'pix') {
            // Mock da URL de Pagamento (PicPay/PagSeguro/etc.)
            paymentDetails = { 
                paymentUrl: `https://mock-payment.com/pix/order/${orderId}/${totalAmount.toFixed(2)}`,
                qrCode: 'base64_qr_code_mock'
            };
        }
        
        // 5. Commit da Transação
        await client.query('COMMIT');
        
        // 6. Retorna o sucesso
        res.status(201).json({
            message: 'Pedido criado com sucesso!',
            orderId: orderId,
            totalAmount: totalAmount.toFixed(2),
            paymentDetails: paymentDetails
        });

    } catch (error) {
        await client.query('ROLLBACK'); // Desfaz tudo em caso de erro
        console.error('Erro ao criar pedido:', error);
        res.status(500).json({ error: 'Falha interna do servidor ao processar o pedido.' });
    } finally {
        client.release();
    }
};

// Função para Buscar Detalhes de um Pedido
export const getOrderDetails = async (req, res, next: unknown) => {
    // 🚨 ASSUNÇÃO: req.user.id é fornecido pelo middleware de autenticação
    const userId = req.user.id; 
    const orderId = req.params.id;

    if (!orderId) {
        return res.status(400).json({ error: 'ID do pedido é obrigatório.' });
    }

    try {
        // 1. Buscar o pedido principal e garantir que pertence ao usuário
        const orderQuery = `
            SELECT 
                id, total_amount, status, shipping_address_json, 
                shipping_cost, payment_method, tracking_code, created_at
            FROM orders
            WHERE id = $1 AND user_id = $2
        `;
        const orderRes = await db.query(orderQuery, [orderId, userId]);
        const order = orderRes.rows[0];

        if (!order) {
            return res.status(404).json({ error: 'Pedido não encontrado ou acesso negado.' });
        }

        // 2. Buscar os itens do pedido (JOIN com products para obter nome e URL da imagem)
        const itemsQuery = `
            SELECT 
                oi.quantity, oi.unit_price, p.name AS product_name, p.image_url
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = $1
        `;
        const itemsRes = await db.query(itemsQuery, [orderId]);
        
        // 3. Montar o objeto final
        const responseData = {
            ...order,
            shipping_address_json: order.shipping_address_json, // O JSONB é retornado como objeto/string
            items: itemsRes.rows,
            created_at: order.created_at.toISOString(),
        };

        res.status(200).json(responseData);
    } catch (error) {
        console.error('Erro ao buscar detalhes do pedido:', error);
        res.status(500).json({ error: 'Falha interna ao buscar detalhes do pedido.' });
    }
};

export const listUserOrders = async (req, res) => {
    // A rota GET /orders lista apenas os pedidos do usuário autenticado.
    const userId = req.user.id; 

    try {
        const ordersQuery = `
            SELECT 
                id, total_amount, status, created_at, payment_method, shipping_cost
            FROM orders
            WHERE user_id = $1
            ORDER BY created_at DESC
        `;
        const ordersRes = await db.query(ordersQuery, [userId]);
        
        // Formata os dados para garantir consistência (ex: toFixed(2) e ISOString)
        const formattedOrders = ordersRes.rows.map(order => ({
            ...order,
            created_at: order.created_at.toISOString(),
            total_amount: parseFloat(order.total_amount).toFixed(2),
            shipping_cost: parseFloat(order.shipping_cost).toFixed(2)
        }));

        res.status(200).json(formattedOrders);
    } catch (error) {
        console.error('Erro ao listar pedidos do usuário:', error);
        res.status(500).json({ error: 'Falha interna ao listar pedidos.' });
    }
};


// Função: Cancelar Pedido e Reverter Estoque (Admin)
export const cancelOrder = async (req, res, next: unknown) => {
    // Requer verifyAdmin no middleware
    const orderId = req.params.id;

    if (!orderId) {
        return res.status(400).json({ error: 'ID do pedido é obrigatório.' });
    }

    const client = await db.connect();
    try {
        await client.query('BEGIN');

        // 1. Verificar o status atual do pedido
        const orderRes = await client.query(
            'SELECT status FROM orders WHERE id = $1',
            [orderId]
        );

        if (orderRes.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Pedido não encontrado.' });
        }

        const currentStatus = orderRes.rows[0].status;

        // Pedidos 'shipped' ou 'delivered' não devem ser cancelados diretamente por aqui.
        if (currentStatus === 'shipped' || currentStatus === 'delivered') {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: `O pedido está em status "${currentStatus}" e não pode ser cancelado via API.` });
        }

        // 2. Mudar o status para 'cancelled'
        const updateOrderQuery = `
            UPDATE orders 
            SET status = 'cancelled', updated_at = NOW() 
            WHERE id = $1 
            RETURNING id
        `;
        await client.query(updateOrderQuery, [orderId]);

        // 3. Reverter Estoque: Buscar itens do pedido
        const itemsRes = await client.query(
            'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
            [orderId]
        );
        const itemsToRestore = itemsRes.rows;

        // 4. Repor Estoque
        for (const item of itemsToRestore) {
            await client.query(
                'UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2',
                [item.quantity, item.product_id]
            );
        }

        // 5. Finalizar Transação
        await client.query('COMMIT');

        // TODO: Em um sistema real, você também reverteria o pagamento no PicPay/gateway e enviaria uma notificação ao cliente.

        res.status(200).json({ 
            message: `Pedido ${orderId} cancelado e estoque revertido com sucesso.`,
            newStatus: 'cancelled'
        });

    } catch (error) {
        await client.query('ROLLBACK'); 
        console.error('Erro ao cancelar pedido e reverter estoque:', error);
        res.status(500).json({ error: 'Falha interna ao processar o cancelamento.' });
    } finally {
        client.release();
    }
};

// #########################################
// 💡 FUNÇÃO ADICIONADA PARA CORRIGIR O ERRO: Listar Todos os Pedidos (Admin)
// #########################################
export const listAllOrders = async (req, res, next: unknown) => {
    // Requer middleware de verificação de administrador (verifyAdmin) na rota
    try {
        const ordersQuery = `
            SELECT 
                o.id, u.email AS user_email, o.total_amount, o.status, 
                o.created_at, o.payment_method, o.shipping_cost
            FROM orders o
            JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
        `;
        const ordersRes = await db.query(ordersQuery);
        
        // Formata os dados para garantir consistência
        const formattedOrders = ordersRes.rows.map(order => ({
            ...order,
            created_at: order.created_at.toISOString(),
            total_amount: parseFloat(order.total_amount).toFixed(2),
            shipping_cost: parseFloat(order.shipping_cost).toFixed(2)
        }));

        res.status(200).json(formattedOrders);
    } catch (error) {
        console.error('Erro ao listar todos os pedidos (Admin):', error);
        res.status(500).json({ error: 'Falha interna ao listar todos os pedidos.' });
    }
};

// #########################################
// 7. Função: Atualizar Status e Rastreio (Admin)
// #########################################
export const updateOrderStatus = async (req, res, next: unknown) => {
    // Requer middleware de verificação de administrador (verifyAdmin) na rota
    const orderId = req.params.id;
    // O body deve conter o novo status e o código de rastreio (opcional)
    const { status, trackingCode } = req.body; 

    if (!orderId) {
        return res.status(400).json({ error: 'ID do pedido é obrigatório.' });
    }
    if (!status) {
        return res.status(400).json({ error: 'O novo status é obrigatório.' });
    }

    try {
        const updateQuery = `
            UPDATE orders 
            SET 
                status = $1, 
                tracking_code = $2,
                updated_at = NOW()
            WHERE id = $3
            RETURNING id, status, tracking_code
        `;
        
        // Se o trackingCode for vazio, passamos NULL para o banco de dados.
        const result = await db.query(updateQuery, [
            status, 
            trackingCode || null, 
            orderId
        ]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Pedido não encontrado.' });
        }
        
        // 💡 DICA PROFISSIONAL: Em um sistema real, se o status for 'shipped', 
        // você enviaria um e-mail com o código de rastreio ao cliente aqui.

        res.status(200).json({ 
            message: `Status do Pedido ${orderId} atualizado com sucesso.`,
            orderId: result.rows[0].id,
            newStatus: result.rows[0].status,
            trackingCode: result.rows[0].tracking_code
        });

    } catch (error) {
        console.error('Erro ao atualizar status do pedido:', error);
        res.status(500).json({ error: 'Falha interna do servidor ao atualizar o status.' });
    }
};