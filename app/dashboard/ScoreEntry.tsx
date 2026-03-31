"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ScoreEntry() {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const res = await fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value, date }),
    });

    if (res.ok) {
      setIsOpen(false);
      setValue("");
      // This tells Next.js to re-fetch the dashboard data instantly!
      router.refresh(); 
    } else {
      const data = await res.json();
      setError(data.message || "Something went wrong");
    }
    setIsSubmitting(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition"
      >
        + Enter New Score
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Enter Golf Score</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Score (Stableford: 1-45)
                </label>
                <input
                  type="number"
                  min="1"
                  max="45"
                  required
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="e.g., 36"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Played
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition"
                >
                  {isSubmitting ? "Saving..." : "Save Score"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}