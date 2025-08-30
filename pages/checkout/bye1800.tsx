// pages/checkout/bye5785.tsx
import { useEffect } from "react";

export default function Bye1800Page() {
  useEffect(() => {
    async function start() {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku: "bye1800", role: "rich", region: "rich" }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    }
    start();
  }, []);

  return <p className="text-white p-6">Redirecting to Stripe Checkout…</p>;
}
