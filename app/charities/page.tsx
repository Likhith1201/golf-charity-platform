import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function CharityDirectory() {
  const charities = await prisma.charity.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Hero Section */}
      <header className="bg-gray-900 py-24 px-6 text-center text-white">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4">Make Your Game Count</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Every swing supports a cause. Choose where 10% of your subscription goes today.
        </p>
      </header>

      <main className="max-w-7xl mx-auto -mt-12 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {charities.map((charity) => (
            <div key={charity.id} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition duration-300">
              {charity.imageUrl ? (
                <img src={charity.imageUrl} alt={charity.name} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400 font-bold">
                  NO IMAGE
                </div>
              )}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{charity.name}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {charity.description}
                </p>
                <Link 
                  href="/dashboard" 
                  className="inline-block w-full text-center py-3 px-6 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition"
                >
                  Support This Cause
                </Link>
              </div>
            </div>
          ))}

          {charities.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-500">
              <p className="text-xl">Our charity partners are being onboarded. Check back soon!</p>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-20 text-center">
        <Link href="/dashboard" className="text-gray-500 hover:text-black font-medium">
          ← Back to Dashboard
        </Link>
      </footer>
    </div>
  );
}