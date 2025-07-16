// server/razorpay.js
// import Razorpay from "razorpay";

// export const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_SECRET,
// });

// export async function createPartialPayment(orderId, amountInPaise) {
//   return await razorpay.orders.create({
//     amount: amountInPaise,
//     currency: "INR",
//     receipt: `cod-${orderId}`,
//     payment_capture: 1,
//   });
// }

import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default razorpay;