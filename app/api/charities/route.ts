import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Check if we have any charities in the database
    let charities = await prisma.charity.findMany({
      orderBy: { name: 'asc' }
    });

    // 2. Auto-seed: If the database is empty, create 3 default charities so we have data to test with!
    if (charities.length === 0) {
      await prisma.charity.createMany({
        data: [
          { 
            name: "Green Earth Initiative", 
            description: "Protecting local wildlife and restoring natural forests across the country.",
            isFeatured: true 
          },
          { 
            name: "Youth Tech Scholars", 
            description: "Providing laptops and coding education to underprivileged youth.",
            isFeatured: false 
          },
          { 
            name: "Fairway Foundation", 
            description: "Using the game of golf to rehabilitate veterans with physical disabilities.",
            isFeatured: true 
          }
        ]
      });
      // Fetch the newly created charities
      charities = await prisma.charity.findMany({ orderBy: { name: 'asc' } });
    }

    return NextResponse.json(charities, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch charities:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}