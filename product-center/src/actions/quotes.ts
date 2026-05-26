"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { canCreateQuote } from "@/lib/permissions";

export async function createQuote(formData: FormData) {
  const session = await requireSession();
  if (!canCreateQuote(session)) throw new Error("权限不足");

  const productId = formData.get("productId") as string;
  const type = formData.get("type") as "INITIAL" | "FINAL";
  const costSheetId = formData.get("costSheetId") as string;
  const totalCost = parseFloat(formData.get("totalCost") as string);
  const suggestedPrice = formData.get("suggestedPrice") ? parseFloat(formData.get("suggestedPrice") as string) : undefined;
  const notes = formData.get("notes") as string;
  const breakdownRaw = formData.get("breakdown") as string;

  let breakdown = [];
  try { breakdown = JSON.parse(breakdownRaw || "[]"); } catch {}

  await db.quote.create({
    data: {
      productId,
      type,
      costSheetId: costSheetId || undefined,
      totalCost,
      suggestedPrice,
      margin: suggestedPrice ? ((suggestedPrice - totalCost) / suggestedPrice) * 100 : undefined,
      notes: notes || undefined,
      breakdown,
      createdById: session.id,
    },
  });

  revalidatePath(`/products/${productId}`);
}
