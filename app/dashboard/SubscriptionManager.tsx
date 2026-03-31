"use client";

import { useState } from "react";

export default function SubscriptionManager({ currentPlan }: { currentPlan: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async (priceId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url; 
      else setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/billing", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3 mt-4">
      {currentPlan === "NONE" ? (
        <>
          <button
            onClick={() => handleCheckout("price_1TGxvbEKHIIiuzwa8XL8fJT4")} 
            disabled={isLoading}
            className="w-full bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Subscribe Monthly"}
          </button>
          <button
            onClick={() => handleCheckout("price_1TGxxbEKHIIiuzwac2lDMuaM")} 
            disabled={isLoading}
            className="w-full bg-gray-100 text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Subscribe Yearly (Save 15%)"}
          </button>
        </>
      ) : (
        <button 
          onClick={handleManageBilling}
          disabled={isLoading}
          className="w-full bg-gray-100 text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition disabled:opacity-50"
        >
          {isLoading ? "Loading..." : "Manage Billing"}
        </button>
      )}
    </div>
  );
}