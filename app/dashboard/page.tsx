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
      winnings: {
        orderBy: { createdAt: "desc" }
      },
    },
  });

  if (!userProfile) {
    redirect("/login");
  }

  // Calculate Total Winnings for the UI
  const totalWon = userProfile.winnings.reduce((acc, win) => acc + win.prizeAmount, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center border-b border-gray-100">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Digital Heroes Charity Golf</h1>
          <div className="hidden md:flex gap-4">
            <Link href="/dashboard" className="text-sm font-medium text-black">
              Dashboard
            </Link>
            <Link href="/leaderboard" className="text-sm font-medium text-gray-500 hover:text-black transition">
              Leaderboard
            </Link>
            <Link href="/charities" className="text-sm font-medium text-gray-500 hover:text-black transition">
              Charity Directory
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
          
          {/* SCORES SECTION */}
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
                {userProfile.scores.length < 5 && (
                  <p className="text-xs text-orange-600 font-medium mt-2">
                    ⚠️ You need {5 - userProfile.scores.length} more scores to qualify for draws.
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <p className="text-sm text-gray-500">No scores recorded yet.</p>
                <p className="text-xs text-gray-400 mt-1">Enter 5 scores to qualify for the next draw.</p>
              </div>
            )}
          </section>

          {/* WINNINGS SECTION  */}
          <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Winnings & Verification</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
               <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-sm text-green-800 font-medium">Total Prize Money</p>
                  <p className="text-2xl font-bold text-green-900">${totalWon.toFixed(2)}</p>
               </div>
               <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-800 font-medium">Draw Status</p>
                  <p className="text-lg font-bold text-blue-900">Monthly Rolling</p>
               </div>
            </div>

            {userProfile.winnings.length > 0 ? (
              <div className="space-y-4">
                {userProfile.winnings.map((win: any) => (
                  <div key={win.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🏆</span>
                        <p className="font-bold text-gray-900">${win.prizeAmount} Prize</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Match Type: {win.matchCount} Numbers</p>
                    </div>
                    
                    <div className="flex flex-col items-end justify-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        win.status === 'PAID' ? 'bg-green-100 text-green-700' : 
                        win.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {win.status}
                      </span>
                      {!win.proofUrl && win.status === 'PENDING' && (
                        <Link 
                          href={`/dashboard/verify/${win.id}`}
                          className="text-xs text-blue-600 font-bold mt-2 hover:underline"
                        >
                          Upload Score Proof →
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic text-center py-4">
                No prizes won yet. Ensure you have 5 active scores for the next monthly draw!
              </p>
            )}
          </section>
        </div>

        {/* Right Column: Settings & Subscriptions */}
        <div className="space-y-6">
          
          {/* SUBSCRIPTION PANEL */}
          <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Subscription</h2>
            <div className="flex items-center gap-3 mb-4">
              <div className={`h-3 w-3 rounded-full ${userProfile.subscriptionStatus === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="font-medium">{userProfile.subscriptionStatus === 'ACTIVE' ? 'Status: Active' : 'Status: Inactive'}</span>
            </div>
            <p className="text-sm text-gray-600 mb-4 uppercase text-xs font-bold tracking-widest">
              Plan: {userProfile.subscriptionPlan}
            </p>
            
            <SubscriptionManager currentPlan={userProfile.subscriptionPlan} />
          </section>

          {/* CHARITY IMPACT PANEL */}
          <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Your Impact</h2>
            {userProfile.charity ? (
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  {userProfile.charity.imageUrl && (
                    <img src={userProfile.charity.imageUrl} className="h-8 w-8 rounded-full object-cover" alt="" />
                  )}
                  <p className="font-bold text-black">{userProfile.charity.name}</p>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  You are contributing <span className="font-bold text-gray-900">{userProfile.charityPercentage}%</span> of your subscription fee to this cause.
                </p>
              </div>
            ) : (
              <div className="mb-6">
                <p className="text-sm text-gray-500 italic">No charity selected. Your contributions are currently held in a general pool.</p>
              </div>
            )}
            <CharitySelection />
            <Link href="/charities" className="block text-center mt-4 text-xs font-bold text-blue-600 hover:text-blue-800">
              Browse Charity Directory →
            </Link>
          </section>
        </div>

      </main>
    </div>
  );
}