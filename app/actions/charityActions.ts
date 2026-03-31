"use client"; // We use this so we can call it from our forms

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCharity(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const isFeatured = formData.get("isFeatured") === "on";

  await prisma.charity.create({
    data: {
      name,
      description,
      imageUrl,
      isFeatured,
    },
  });

  // This tells Next.js to refresh the data on the pages below
  revalidatePath("/admin");
  revalidatePath("/charities");
}

export async function deleteCharity(id: string) {
  await prisma.charity.delete({
    where: { id },
  });
  revalidatePath("/admin");
  revalidatePath("/charities");
}