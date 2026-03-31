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

    const { charityId, percentage } = await req.json();
    const percentValue = parseFloat(percentage);

    // Minimum contribution is 10%
    if (isNaN(percentValue) || percentValue < 10 || percentValue > 100) {
      return NextResponse.json({ message: "Contribution must be between 10% and 100%" }, { status: 400 });
    }

    // Update the user's profile in the database
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        selectedCharityId: charityId,
        charityPercentage: percentValue,
      },
    });

    return NextResponse.json({ message: "Charity updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Charity update error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}