import {
  reactExtension,
  Banner,
  BlockStack,
  Button,
  Text,
  useApi,
  useInstructions,
  useTranslate,
  useSelectedPaymentOptions,
  useBuyerJourneyIntercept,
} from "@shopify/ui-extensions-react/checkout";
import { useState } from "react";

export default reactExtension("purchase.checkout.actions.render-before", () => (
  <Extension />
));

function Extension() {
  const translate = useTranslate();
  const { cost } = useApi();
  const instructions = useInstructions();
  const selectedPaymentOptions = useSelectedPaymentOptions();
  const paymentOption = selectedPaymentOptions?.[0];
  const [partialPaymentMade, setPartialPaymentMade] = useState(false);
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentLink, setPaymentLink] = useState("");

  const isCOD =
    paymentOption?.handle?.toLowerCase().includes("cash") ||
    paymentOption?.handle?.toLowerCase().includes("cod") ||
    paymentOption?.type === "manual" ||
    paymentOption?.type === "paymentOnDelivery";

  // Block checkout if COD is selected and partial payment is not made
  useBuyerJourneyIntercept(({ canBlockProgress }) => {
    if (isCOD && !partialPaymentMade && canBlockProgress) {
      return {
        behavior: "block",
        reason: "Partial payment required",
        errors: [
          {
            message: "Please pay 10% to confirm your order before completing checkout.",
          },
        ],
      };
    }
    return { behavior: "allow" };
  });

  if (!instructions.attributes.canUpdateAttributes) {
    return (
      <Banner title="Confirm COD Payment" status="warning">
        {translate("attributeChangesAreNotSupported")}
      </Banner>
    );
  }

  if (!paymentOption) {
    return (
      <BlockStack>
        <Banner title="Confirm COD Payment" status="info">
          Please select a payment method to see partial payment options.
        </Banner>
      </BlockStack>
    );
  }

  if (!isCOD) {
    return (
      <BlockStack>
        <Banner title="Confirm COD Payment" status="info">
          Select <Text emphasis="italic">Cash on Delivery</Text> to see partial payment options.
        </Banner>
      </BlockStack>
    );
  }

  if (!cost || !cost.totalAmount) {
    return (
      <BlockStack>
        <Banner title="Confirm COD Payment" status="warning">
          Order total is not available.
        </Banner>
      </BlockStack>
    );
  }

  const total = Number(cost.totalAmount.current.amount || 0);
  const partialAmount = Math.round(total * 0.1);

  async function handlePartialPayment() {
    setPaymentError("");
    setPaymentInProgress(true);
    setPaymentLink("");
    try {
      // Generate a unique orderId for each payment
      const uniqueOrderId = `cod-partial-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const response = await fetch("https://prospects-finite-winds-utils.trycloudflare.com/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: uniqueOrderId, amount: partialAmount }),
      });
      if (!response.ok) {
        const text = await response.text();
        setPaymentError(`Network error: ${response.status} ${response.statusText}. ${text}`);
        setPaymentInProgress(false);
        return;
      }
      let data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        setPaymentError("Invalid JSON response from server.");
        setPaymentInProgress(false);
        return;
      }
      console.log("data", data);
      if (data.url) {
        setPaymentLink(data.url);
        // Do NOT use window.open or pollPaymentStatus here. Show a clickable link instead.
      } else {
        setPaymentError("Failed to create payment link. " + (data.error || JSON.stringify(data)));
      }
    } catch (err) {
      setPaymentError("Error creating payment link. " + err.message + (err.stack ? "\n" + err.stack : ""));
      console.error("handlePartialPayment error", err);
    }
    setPaymentInProgress(false);
  }

  async function pollPaymentStatus(paymentId) {
    let attempts = 0;
    const maxAttempts = 20;
    const interval = 3000; // 3 seconds
    async function checkStatus() {
      attempts++;
      try {
        const res = await fetch(`/api/check-partial-payment-status?paymentId=${paymentId}`);
        const statusData = await res.json();
        if (statusData.status === "paid") {
          setPartialPaymentMade(true);
          setPaymentError("");
          return;
        }
      } catch (err) {
        setPaymentError("Error checking payment status.");
      }
      if (attempts < maxAttempts && !partialPaymentMade) {
        setTimeout(checkStatus, interval);
      } else if (!partialPaymentMade) {
        setPaymentError("Payment not confirmed. Please try again or contact support.");
      }
    }
    checkStatus();
  }

  return (
    <BlockStack border="dotted" padding="tight">
      <Banner title="Confirm COD Payment" status="success">
        <Text>
          Please pay <Text emphasis="bold">₹{partialAmount}</Text> now to confirm your order.
        </Text>
        <Text>The remaining amount will be collected on delivery.</Text>
      </Banner>
      {!partialPaymentMade && (
        <Button
          onPress={handlePartialPayment}
          loading={paymentInProgress}
        >
          Pay 10% Now
        </Button>
      )}
      {paymentLink && !partialPaymentMade && (
        <Banner status="info">
          <BlockStack>
            <Text>Please complete your payment by copying and pasting this link into a new tab:</Text>
            <Text emphasis="bold" size="small">{paymentLink}</Text>
          </BlockStack>
        </Banner>
      )}
      {paymentError && (
        <Banner status="critical">{paymentError}</Banner>
      )}
      {partialPaymentMade && (
        <Banner status="success">Partial payment received! You can now complete your order.</Banner>
      )}
    </BlockStack>
  );
}
