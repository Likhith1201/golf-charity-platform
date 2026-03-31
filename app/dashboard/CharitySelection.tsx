"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Define the shape of our charity data
type Charity = {
  id: string;
  name: string;
  description: string;
};

export default function CharitySelection() {
  const [isOpen, setIsOpen] = useState(false);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [selectedCharityId, setSelectedCharityId] = useState("");
  const [percentage, setPercentage] = useState(10); 
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Fetch charities when the modal opens
  useEffect(() => {
    if (isOpen) {
      fetch("/api/charities")
        .then((res) => res.json())
        .then((data) => {
          setCharities(data);
          if (data.length > 0 && !selectedCharityId) {
            setSelectedCharityId(data[0].id); // Select the first one by default
          }
        });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const res = await fetch("/api/user-charity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ charityId: selectedCharityId, percentage }),
    });

    if (res.ok) {
      setIsOpen(false);
      router.refresh(); // Instantly update the dashboard UI
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
        className="w-full bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition mt-2"
      >
        Select or Change Charity
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Support a Charity</h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose your cause
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                  {charities.map((charity) => (
                    <label 
                      key={charity.id} 
                      className={`flex flex-col p-3 border rounded-lg cursor-pointer transition ${selectedCharityId === charity.id ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="charity"
                          value={charity.id}
                          checked={selectedCharityId === charity.id}
                          onChange={(e) => setSelectedCharityId(e.target.value)}
                          className="text-black focus:ring-black"
                        />
                        <span className="font-medium text-gray-900">{charity.name}</span>
                      </div>
                      <span className="text-xs text-gray-500 ml-6 mt-1 line-clamp-2">{charity.description}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Donation Percentage (Min 10%)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={percentage}
                    onChange={(e) => setPercentage(parseInt(e.target.value))}
                    className="w-full accent-black"
                  />
                  <span className="text-lg font-bold text-black w-12 text-right">{percentage}%</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedCharityId}
                  className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition"
                >
                  {isSubmitting ? "Saving..." : "Confirm Impact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}