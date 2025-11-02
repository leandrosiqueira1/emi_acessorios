// backend/routers/orders.js
import express, { Request, Response } from "express";
import { pool as db } from "../db.ts";
import { verifyToken } from "../middlewares/auth.ts";
import {
  createOrder,
  getOrderDetails,
  listUserOrders,
} from "../controllers/orderController.js";

// Tipagem do usuário autenticado (adicionada via middleware)
declare global {
  namespace Express {
    interface Request {
      user?: {
        is_admin: any;
        id: number;
        username: string;
        email: string;
      };
    }
  }
}

// Tipos auxiliares
interface OrderItem {
  productId: number;
  quantity: number;
  unitPrice?: number;
}

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  [key: string]: string;
}

interface CreateOrderBody {
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  shippingCost: number;
  paymentMethod: "pix" | "credit_card" | "boleto";
}

const router = express.Router();

// Configurações do PicPay e Frontend (vêm do .env)
const {
  PICPAY_API_URL,
  PICPAY_TOKEN,
  PICPAY_SELLER_TOKEN,
  FRONTEND_URL = "http://localhost:3000",
} = process.env;

// -----------------------------------------------------------------------------
// POST /api/orders → Cria um pedido e inicia o pagamento (checkout)
// -----------------------------------------------------------------------------
router.post("/", verifyToken, async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { items, shippingAddress, shippingCost, paymentMethod } =
    req.body as CreateOrderBody;

  if (!userId) {
    return res.status(401).json({ error: "Usuário não autenticado." });
  }

  if (!items || items.length === 0 || !shippingAddress || !paymentMethod) {
    return res.status(400).json({ error: "Dados do pedido incompletos." });
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    let totalAmount = 0;
    const orderItems: OrderItem[] = [];

    // 1️⃣ Validação, cálculo do total e checagem de estoque
    for (const item of items) {
      const productRes = await client.query<{
        price: number;
        stock_quantity: number;
      }>("SELECT price, stock_quantity FROM products WHERE id = $1", [
        item.productId,
      ]);

      const product = productRes.rows[0];

      if (!product || product.stock_quantity < item.quantity) {
        throw new Error(
          `Estoque insuficiente para o produto ID ${item.productId}.`
        );
      }

      totalAmount += product.price * item.quantity;
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
      });
    }

    // 2️⃣ Cálculo do total e desconto PIX
    let finalAmount = totalAmount + shippingCost;
    if (paymentMethod === "pix") {
      finalAmount = totalAmount * 0.95 + shippingCost;
    }

    // 3️⃣ Criação do pedido
    const orderRes = await client.query<{ id: number }>(
      `INSERT INTO orders (user_id, total_amount, status, shipping_address_json, shipping_cost, payment_method)
       VALUES ($1, $2, 'pending', $3, $4, $5)
       RETURNING id`,
      [userId, finalAmount, JSON.stringify(shippingAddress), shippingCost, paymentMethod]
    );

    const orderId = orderRes.rows[0].id;

    // 4️⃣ Inserção dos itens e baixa no estoque
    for (const item of orderItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.productId, item.quantity, item.unitPrice]
      );

      await client.query(
        "UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2",
        [item.quantity, item.productId]
      );
    }

    // 5️⃣ Integração com PicPay
    let paymentResponse: any = null;

    if (paymentMethod === "pix" || paymentMethod === "credit_card") {
      const picpayBody = {
        referenceId: orderId,
        callbackUrl: `${FRONTEND_URL}/api/picpay/callback`,
        returnUrl: `${FRONTEND_URL}/order/${orderId}/success`,
        value: finalAmount.toFixed(2),
        buyer: {
          firstName: req.user?.username,
          document: "000.000.000-00",
          email: req.user?.email || "cliente@exemplo.com",
          phone: "99999999999",
        },
      };

      const response = await fetch(PICPAY_API_URL!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-picpay-token": PICPAY_TOKEN!,
          "x-seller-token": PICPAY_SELLER_TOKEN!,
        },
        body: JSON.stringify(picpayBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Falha na API PicPay: ${errorData.message || response.statusText}`
        );
      }

      paymentResponse = await response.json();
    }

    await client.query("COMMIT");

    res.status(201).json({
      orderId,
      finalAmount: finalAmount.toFixed(2),
      paymentDetails: paymentResponse,
    });
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Erro no checkout:", error.message || error);
    res
      .status(500)
      .json({ error: "Falha ao finalizar o pedido. " + error.message });
  } finally {
    client.release();
  }
});

// -----------------------------------------------------------------------------
// GET /api/orders → Listar pedidos do usuário autenticado
// -----------------------------------------------------------------------------
router.get("/", verifyToken, listUserOrders);

// -----------------------------------------------------------------------------
// GET /api/orders/:id → Buscar detalhes de um pedido específico
// -----------------------------------------------------------------------------
router.get("/:id", verifyToken, getOrderDetails);

export default router;
