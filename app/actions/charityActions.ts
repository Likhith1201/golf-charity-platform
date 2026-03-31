"use server"; 

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCharity(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const isFeatured = formData.get("isFeatured") === "on";

  try {
    await prisma.charity.create({
      data: {
        name,
        description,
        imageUrl,
        isFeatured,
      },
    });

    revalidatePath("/admin");
  } catch (error) {
    console.error("Failed to create charity:", error);
  }
}

export async function deleteCharity(id: string) {
  try {
    await prisma.charity.delete({
      where: { id },
    });
    revalidatePath("/admin");
  } catch (error) {
    console.error("Failed to delete charity:", error);
  }
}