"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitWinnerProof(winningId: string, proofUrl: string) {
  await prisma.winning.update({
    where: { id: winningId },
    data: { 
      proofUrl,
      status: "PENDING" // Moves from 'none' to 'pending review'
    },
  });
  revalidatePath("/dashboard");
}

export async function updatePayoutStatus(winningId: string, newStatus: "APPROVED" | "REJECTED" | "PAID") {
  await prisma.winning.update({
    where: { id: winningId },
    data: { status: newStatus },
  });
  revalidatePath("/admin");
}