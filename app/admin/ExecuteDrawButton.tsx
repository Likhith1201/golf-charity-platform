"use client";

export default function ExecuteDrawButton() {
  return (
    <button 
      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition shadow-lg shadow-blue-500/20"
      onClick={() => alert("Draw execution API requires banking compliance module. (Simulation complete!)")}
    >
      Execute Monthly Draw
    </button>
  );
}