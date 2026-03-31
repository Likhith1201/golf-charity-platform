import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { value, date } = await req.json();
    const scoreValue = parseInt(value);

    // Score range 1 - 45 
    if (isNaN(scoreValue) || scoreValue < 1 || scoreValue > 45) {
      return NextResponse.json({ message: "Score must be between 1 and 45" }, { status: 400 });
    }

    // Save the new score
    await prisma.score.create({
      data: {
        value: scoreValue,
        date: new Date(date),
        userId: session.user.id,
      },
    });

    // Enforce the rolling 5-score limit
    const allScores = await prisma.score.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { date: 'desc' },
        { createdAt: 'desc' } 
      ],
    });

    // If there are more than 5, delete the older ones
    if (allScores.length > 5) {
      const scoresToDelete = allScores.slice(5).map((score: any) => score.id);
      await prisma.score.deleteMany({
        where: {
          id: { in: scoresToDelete }
        }
      });
    }

    return NextResponse.json({ message: "Score added successfully" }, { status: 201 });
  } catch (error) {
    console.error("Score entry error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}