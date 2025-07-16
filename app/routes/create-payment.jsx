import { json } from '@remix-run/node';
import { createPartialPayment } from '../../server/razorpay';

export const action = async ({ request }) => {
  const data = await request.json();
  const { orderId, totalAmount } = data;

  const tenPercent = Math.ceil(totalAmount * 0.1 * 100); // in paise

  const payment = await createPartialPayment(orderId, tenPercent);

  return json({
    id: payment.id,
    amount: payment.amount,
    url: `https://checkout.razorpay.com/v1/checkout.js?order_id=${payment.id}`,
  });
};
