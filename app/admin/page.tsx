import { createCharity, deleteCharity } from "../actions/charityActions";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import Link from "next/link";
import LogoutButton from "../dashboard/LogoutButton";
import ExecuteDrawButton from "./ExecuteDrawButton"; 

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const ADMIN_EMAIL = "golfplatform@gmail.com"; 
  
  if (!session || session.user?.email !== ADMIN_EMAIL) {
    redirect("/dashboard"); 
  }

  // Fetch users AND the new charities
  const allUsers = await prisma.user.findMany({ include: { charity: true } });
  const allCharities = await prisma.charity.findMany();

  const activeUsers = allUsers.filter((u: any) => u.subscriptionStatus === "ACTIVE");
  let totalRevenue = 0;
  let totalCharityPool = 0;

  activeUsers.forEach((user: any) => {
    const fee = user.subscriptionPlan === "YEARLY" ? 100 : 10;
    totalRevenue += fee;
    const percentage = user.charityPercentage ? (user.charityPercentage / 100) : 0.10;
    totalCharityPool += (fee * percentage);
  });

  const prizePool = (totalRevenue - totalCharityPool) * 0.5;

  return (
    <div className="min-h-screen bg-gray-900 pb-12">
      <nav className="bg-black shadow-sm px-6 py-4 flex justify-between items-center border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">Platform Admin Hub</h1>
        <LogoutButton />
      </nav>

      <main className="max-w-7xl mx-auto mt-8 px-6 space-y-8">
        
        {/* FINANCIAL METRICS  */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-pink-900/20 p-6 rounded-xl border border-pink-900/50">
                <p className="text-pink-400 text-sm">Charity Pool</p>
                <p className="text-2xl font-bold text-pink-500">${totalCharityPool.toFixed(2)}</p>
            </div>
            <div className="bg-blue-900/20 p-6 rounded-xl border border-blue-900/50">
                <p className="text-blue-400 text-sm">Prize Pool</p>
                <p className="text-2xl font-bold text-blue-500">${prizePool.toFixed(2)}</p>
            </div>
        </div>

        {/* CHARITY MANAGEMENT  */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <h3 className="text-white font-bold text-lg mb-4">Add New Charity</h3>
                <form action={createCharity} className="space-y-4">
                    <input name="name" placeholder="Charity Name" className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-white" required />
                    <textarea name="description" placeholder="Description" className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-white h-24" required />
                    <input name="imageUrl" placeholder="Logo Image URL (optional)" className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-white" />
                    <button type="submit" className="w-full bg-green-600 hover:bg-green-50 text-white font-bold py-2 rounded-md transition">Add Charity</button>
                </form>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <h3 className="text-white font-bold text-lg mb-4">Existing Charities</h3>
                <div className="space-y-2">
                    {allCharities.map((charity) => (
                        <div key={charity.id} className="flex justify-between items-center p-3 bg-gray-900 rounded-md border border-gray-700">
                            <div>
                                <p className="text-white font-medium">{charity.name}</p>
                                <p className="text-gray-500 text-xs">{charity.description.substring(0, 40)}...</p>
                            </div>
                            {/* We will add a delete button next */}
                        </div>
                    ))}
                    {allCharities.length === 0 && <p className="text-gray-500 text-sm">No charities added yet.</p>}
                </div>
            </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h3 className="text-white font-bold text-lg mb-4">Monthly Draw Controls</h3>
            <ExecuteDrawButton />
        </div>

      </main>
    </div>
  );
}