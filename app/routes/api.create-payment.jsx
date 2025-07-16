import { json } from "@remix-run/node";
import db from "../db.server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle GET requests: fetch partial payment by orderId or paymentId, and OPTIONS preflight
export async function loader({ request }) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId");
  const paymentId = url.searchParams.get("paymentId");

  if (!orderId && !paymentId) {
    return json({
      ok: false,
      message: "Missing required query param: orderId or paymentId",
      method: "GET",
    }, { status: 400, headers: corsHeaders });
  }

  try {
    const where = orderId
      ? { orderId: String(orderId) }
      : { paymentId: String(paymentId) };

    const payment = await db.partialPayment.findUnique({ where });

    if (!payment) {
      return json({
        ok: false,
        message: "Partial payment not found",
        method: "GET",
      }, { status: 404, headers: corsHeaders });
    }

    return json({
      ok: true,
      message: "Fetched partial payment successfully",
      data: payment,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error("GET /api/create-payment error:", error);
    return json({ error: "Server error" }, { status: 500, headers: corsHeaders });
  }
}

// Handle POST requests: create a partial payment
export async function action({ request }) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  try {
    const body = await request.json();
    const { orderId, amount } = body || {};

    console.log("body", body);
    if (!orderId || !amount) {
      return json({ error: "Missing required fields" }, { status: 400, headers: corsHeaders });
    }

    const paymentId = `test_${orderId}`;
    const paymentLink = `https://example.com/pay/${paymentId}`;

    // Store 10% of amount in paise (assuming amount is in rupees)
    const partialAmount = Math.round(amount * 0.1 * 100);

    const payment = await db.partialPayment.create({
      data: {
        orderId,
        paymentId,
        amount: partialAmount,
        status: "pending",
      },
    });

    return json({
      orderId: payment.orderId,
      paymentId: payment.paymentId,
      url: paymentLink,
      amount: Math.round(amount * 0.1), // 10% in rupees for display
      status: payment.status,
    }, { headers: corsHeaders });
  } catch (err) {
    console.error("❌ create-payment error:", err);
    return json({ error: "Server error" }, { status: 500, headers: corsHeaders });
  }
}