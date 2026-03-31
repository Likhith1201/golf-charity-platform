import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { submitWinnerProof } from "../../../actions/winningActions";
import Link from "next/link";

export default async function VerifyWinningPage({ params }: { params: { id: string } }) {
  const winning = await prisma.winning.findUnique({
    where: { id: params.id },
    include: { user: true }
  });

  if (!winning) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 border border-gray-100">
        <div className="text-center mb-8">
          <span className="text-5xl">📄</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Verify Your Win</h1>
          <p className="text-gray-500 mt-2">
            To claim your <span className="font-bold text-black">${winning.prizeAmount}</span>, please provide a link to a screenshot of your scores.
          </p>
        </div>

        <form action={async (formData) => {
          "use server";
          const url = formData.get("proofUrl") as string;
          await submitWinnerProof(winning.id, url);
          redirect("/dashboard");
        }} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Screenshot URL (Imgur, Drive, etc.)</label>
            <input 
              name="proofUrl" 
              type="url" 
              required 
              placeholder="https://imgur.com/your-score-proof"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <button type="submit" className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition shadow-lg">
            Submit for Review
          </button>
          
          <Link href="/dashboard" className="block text-center text-sm text-gray-400 hover:text-black">
            Cancel
          </Link>
        </form>
      </div>
    </div>
  );
}