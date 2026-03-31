import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import Link from "next/link";
import LogoutButton from "../dashboard/LogoutButton";

export default async function LeaderboardPage() {
  // 1. Secure the page
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  // 2. Fetch all users, their latest 5 scores, and their chosen charity
  const allUsers = await prisma.user.findMany({
    include: {
      scores: {
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        take: 5,
      },
      charity: true,
    },
  });

 // 3. Calculate total scores and sort the leaderboard
  const leaderboardData = allUsers
    .map((user: any) => {
      const totalScore = user.scores.reduce((sum: any, score: any) => sum + score.value, 0);
      return {
        id: user.id,
        name: user.name,
        totalScore,
        scoresPlayed: user.scores.length,
        charityName: user.charity?.name || "No charity selected",
        isActive: user.subscriptionStatus === "ACTIVE",
      };
    })
    .filter((user: any) => user.totalScore > 0) 
    .sort((a: any, b: any) => b.totalScore - a.totalScore);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Digital Heroes Charity Golf</h1>
          <div className="hidden md:flex gap-4">
            <Link href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-black transition">
              Dashboard
            </Link>
            <Link href="/leaderboard" className="text-sm font-medium text-black">
              Leaderboard
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <LogoutButton />
        </div>
      </nav>

      <main className="max-w-4xl mx-auto mt-8 px-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Global Leaderboard</h2>
          <p className="text-gray-500 mt-2">Rankings based on the total of each player's latest 5 Stableford scores.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {leaderboardData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-sm font-medium text-gray-500">
                    <th className="p-4 w-16 text-center">Rank</th>
                    <th className="p-4">Player</th>
                    <th className="p-4 text-center">Scores Entered</th>
                    <th className="p-4">Playing For</th>
                    <th className="p-4 text-right">Total Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leaderboardData.map((player: any, index: number) => (
                    <tr 
                      key={player.id} 
                      className={`hover:bg-gray-50 transition ${player.id === session.user.id ? 'bg-blue-50/50' : ''}`}
                    >
                      <td className="p-4 text-center font-bold text-gray-900">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          {player.name}
                          {player.isActive && (
                            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                              Pro
                            </span>
                          )}
                          {player.id === session.user.id && (
                            <span className="text-xs text-blue-600 font-bold">(You)</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center text-gray-500 text-sm">
                        {player.scoresPlayed} / 5
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {player.charityName}
                      </td>
                      <td className="p-4 text-right font-bold text-xl text-black">
                        {player.totalScore}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No scores have been submitted yet.</p>
              <p className="text-sm text-gray-400 mt-1">Be the first to get on the board!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}