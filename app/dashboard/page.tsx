import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import LogoutButton from "./LogoutButton";
import ScoreEntry from "./ScoreEntry";
import CharitySelection from "./CharitySelection";
import SubscriptionManager from "./SubscriptionManager"; 
import Link from "next/link";   

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/login");
  }

  const userProfile = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      scores: {
        orderBy: [
          { date: "desc" },
          { createdAt: "desc" }
        ],
        take: 5,
      },
      charity: true,
      winnings: true,
    },
  });

  if (!userProfile) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Digital Heroes Charity Golf</h1>
          <div className="hidden md:flex gap-4">
            <Link href="/dashboard" className="text-sm font-medium text-black">
              Dashboard
            </Link>
            <Link href="/leaderboard" className="text-sm font-medium text-gray-500 hover:text-black transition">
              Leaderboard
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 hidden sm:block">Welcome, {userProfile.name}</span>
          <LogoutButton />
        </div>
      </nav>

      {/* Main Dashboard Grid */}
      <main className="max-w-7xl mx-auto mt-8 px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Scores & Action */}
        <div className="md:col-span-2 space-y-6">
          <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Your Latest Scores</h2>
              <ScoreEntry />
            </div>
            
            {userProfile.scores.length > 0 ? (
              <div className="space-y-3">
                {userProfile.scores.map((score: any, index: number) => (
                  <div key={score.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-500">Score #{index + 1}</span>
                    <span className="text-xl font-bold text-black">{score.value} pts</span>
                    <span className="text-sm text-gray-500">{new Date(score.date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <p className="text-sm text-gray-500">No scores recorded yet.</p>
                <p className="text-xs text-gray-400 mt-1">Enter 5 scores to qualify for the next draw.</p>
              </div>
            )}
          </section>

          <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Winnings & Participation</h2>
            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-sm text-green-800 font-medium">Total Won</p>
                  <p className="text-2xl font-bold text-green-900">$0.00</p>
               </div>
               <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-800 font-medium">Upcoming Draw</p>
                  <p className="text-lg font-bold text-blue-900">End of Month</p>
               </div>
            </div>
          </section>
        </div>

        {/* Right Column: Settings & Subscriptions */}
        <div className="space-y-6">
          <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Subscription</h2>
            <div className="flex items-center gap-3 mb-4">
              <div className={`h-3 w-3 rounded-full ${userProfile.subscriptionStatus === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="font-medium">{userProfile.subscriptionStatus === 'ACTIVE' ? 'Active' : 'Inactive'}</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">Current Plan: {userProfile.subscriptionPlan}</p>
            
            <SubscriptionManager currentPlan={userProfile.subscriptionPlan} />
          </section>

          <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Your Impact</h2>
            {userProfile.charity ? (
              <div>
                <p className="font-medium text-black">{userProfile.charity.name}</p>
                <p className="text-sm text-gray-500 mb-4">Receiving {userProfile.charityPercentage}% of your fee</p>
              </div>
            ) : (
              <div className="mb-4">
                <p className="text-sm text-gray-500">No charity selected yet.</p>
              </div>
            )}
            <CharitySelection />
          </section>
        </div>

      </main>
    </div>
  );
}