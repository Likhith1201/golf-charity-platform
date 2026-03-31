"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function executeMonthlyDraw() {
  // 1. Generate 5 random winning numbers between 1 and 45
  const winningNumbers = Array.from({ length: 5 }, () => Math.floor(Math.random() * 45) + 1);

  try {
    // 2. Create the Draw record
    const newDraw = await prisma.draw.create({
      data: {
        month: new Date(),
        winningNumbers,
        isPublished: true,
      },
    });

    // 3. Find all active users and their scores
    const activeUsers = await prisma.user.findMany({
      where: { subscriptionStatus: "ACTIVE" },
      include: { scores: true },
    });

    // 4. Check each user for matches
    for (const user of activeUsers) {
      const userScoreValues = user.scores.map(s => s.value);
      
      // Count how many of the user's scores exist in the winning numbers
      const matches = userScoreValues.filter(val => winningNumbers.includes(val)).length;

      //  Only create winnings for 3, 4, or 5 matches
      if (matches >= 3) {
        let prizeAmount = 0;
        if (matches === 5) prizeAmount = 500; // Example placeholder values
        if (matches === 4) prizeAmount = 100;
        if (matches === 3) prizeAmount = 20;

        await prisma.winning.create({
          data: {
            userId: user.id,
            drawId: newDraw.id,
            matchCount: matches,
            prizeAmount,
            status: "PENDING",
          },
        });
      }
    }

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    return { success: true, numbers: winningNumbers };
  } catch (error) {
    console.error("Draw failed:", error);
    return { success: false };
  }
}