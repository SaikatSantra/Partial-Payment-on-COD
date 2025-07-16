// app/webhooks/order-create.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const orderCreateWebhook = {
  topic: 'ORDERS_CREATE',
  path: '/webhooks/orders-create',
  webhookHandler: async (_topic, shop, body) => {
    const order = JSON.parse(body);
    // Treat as COD if gateway is cash, financial_status is pending, or gateway is bogus (for dev/testing)
    const isCOD =
      (order.gateway?.toLowerCase().includes('cash')) ||
      order.financial_status === 'pending' ||
      order.gateway?.toLowerCase().includes('bogus') ||
      (order.payment_gateway_names && order.payment_gateway_names.includes('bogus'));

    if (!isCOD) return;

    const amountInPaise = Math.ceil(Number(order.total_price) * 0.1 * 100);

    await prisma.partialPayment.create({
      data: {
        orderId: String(order.id),
        paymentId: '', // No paymentId at order creation; update after payment if needed
        amount: amountInPaise,
        status: 'pending',
      },
    });
  },
};

export default orderCreateWebhook;