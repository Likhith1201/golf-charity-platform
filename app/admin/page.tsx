import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import Link from "next/link";
import LogoutButton from "../dashboard/LogoutButton";
import ExecuteDrawButton from "./ExecuteDrawButton"; 

export default async function AdminDashboard() {
  // 1. Secure the page: Only allow the Master Admin email
  const session = await getServerSession(authOptions);
  const ADMIN_EMAIL = "golfplatform@gmail.com"; 
  
  if (!session || session.user?.email !== ADMIN_EMAIL) {
    redirect("/dashboard"); 
  }

  // 2. Fetch all users and their charity data
  const allUsers = await prisma.user.findMany({
    include: { charity: true },
  });

  // 3. Calculate Platform Financials
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
  const operatingProfit = (totalRevenue - totalCharityPool) * 0.5;

  return (
    <div className="min-h-screen bg-gray-900 pb-12">
      <nav className="bg-black shadow-sm px-6 py-4 flex justify-between items-center border-b border-gray-800">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold tracking-tight text-white">Platform Admin Hub</h1>
          <div className="hidden md:flex gap-4">
            <Link href="/dashboard" className="text-sm font-medium text-gray-400 hover:text-white transition">
              Exit to App
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-green-400 font-bold tracking-wide">● SYSTEM SECURE</span>
          <div className="bg-gray-800 px-3 py-1 rounded-md">
            <LogoutButton />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto mt-8 px-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white">Financial Overview</h2>
          <p className="text-gray-400 mt-2">Real-time breakdown of subscriptions, charity pools, and prizes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <p className="text-sm text-gray-400 font-medium mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-2">{activeUsers.length} Active Subscribers</p>
          </div>
          
          <div className="bg-pink-900/20 rounded-xl p-6 border border-pink-900/50">
            <p className="text-sm text-pink-400 font-medium mb-1">Charity Pool</p>
            <p className="text-3xl font-bold text-pink-500">${totalCharityPool.toFixed(2)}</p>
            <p className="text-xs text-pink-700 mt-2">Ready for donation</p>
          </div>

          <div className="bg-blue-900/20 rounded-xl p-6 border border-blue-900/50">
            <p className="text-sm text-blue-400 font-medium mb-1">Prize Pool</p>
            <p className="text-3xl font-bold text-blue-500">${prizePool.toFixed(2)}</p>
            <p className="text-xs text-blue-700 mt-2">Next Draw: End of Month</p>
          </div>

          <div className="bg-green-900/20 rounded-xl p-6 border border-green-900/50">
            <p className="text-sm text-green-400 font-medium mb-1">Operating Profit</p>
            <p className="text-3xl font-bold text-green-500">${operatingProfit.toFixed(2)}</p>
            <p className="text-xs text-green-700 mt-2">Platform retained</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">Active Subscriber Log</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700 text-sm text-gray-500">
                    <th className="pb-3">User</th>
                    <th className="pb-3">Plan</th>
                    <th className="pb-3">Charity %</th>
                    <th className="pb-3">Supporting</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {activeUsers.map((user: any) => (
                    <tr key={user.id}>
                      <td className="py-3 text-white font-medium">{user.name}</td>
                      <td className="py-3 text-gray-300">{user.subscriptionPlan}</td>
                      <td className="py-3 text-gray-300">{user.charityPercentage}%</td>
                      <td className="py-3 text-gray-400 text-sm">{user.charity?.name || "None"}</td>
                    </tr>
                  ))}
                  {activeUsers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-gray-500">No active subscribers yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Monthly Draw</h3>
              <p className="text-sm text-gray-400 mb-6">
                Execute the monthly draw to assign the ${prizePool.toFixed(2)} prize pool to the highest qualifying scorer.
              </p>
            </div>
            <ExecuteDrawButton />
          </div>
        </div>
      </main>
    </div>
  );
}