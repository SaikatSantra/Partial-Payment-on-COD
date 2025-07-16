import { json } from "@remix-run/node";
import { prisma } from "../db.server";

export const action = async ({ request }) => {
  const payload = await request.json();

  // Simulate payment success for test
  if (payload.event === "payment.captured") {
    const paymentId = payload.paymentId;
    await prisma.partialPayment.updateMany({
      where: { paymentId },
      data: { status: "paid" },
    });
  }

  return json({ ok: true });
};