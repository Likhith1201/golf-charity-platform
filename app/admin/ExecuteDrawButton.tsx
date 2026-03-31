"use client";

import { executeMonthlyDraw } from "../actions/drawActions";
import { useState } from "react";

export default function ExecuteDrawButton() {
  const [loading, setLoading] = useState(false);

  const handleDraw = async () => {
    if (!confirm("Are you sure you want to execute the monthly draw? This will calculate winners across the platform.")) return;
    
    setLoading(true);
    const result = await executeMonthlyDraw();
    setLoading(false);

    if (result.success) {
      alert(`Draw Successful! Winning Numbers: ${result.numbers?.join(", ")}`);
    } else {
      alert("Draw failed. Check console.");
    }
  };

  return (
    <button 
      onClick={handleDraw}
      disabled={loading}
      className={`w-full py-4 rounded-xl font-bold text-white transition shadow-lg ${
        loading ? "bg-gray-600" : "bg-blue-600 hover:bg-blue-500 active:scale-95"
      }`}
    >
      {loading ? "GENERATING NUMBERS..." : "Execute Monthly Draw"}
    </button>
  );
}