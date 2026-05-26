"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { canManageCostSheets } from "@/lib/permissions";

export async function createCostSheet(formData: FormData) {
  const session = await requireSession();
  if (!canManageCostSheets(session)) throw new Error("权限不足，仅财务部可维护成本表");

  const name = formData.get("name") as string;
  const yearMonth = formData.get("yearMonth") as string;
  const itemsRaw = formData.get("items") as string;

  let items = [];
  try { items = JSON.parse(itemsRaw || "[]"); } catch {}

  await db.costSheet.create({
    data: { name, yearMonth, items, createdById: session.id },
  });

  revalidatePath("/cost-sheets");
}

export async function toggleCostSheetActive(id: string, isActive: boolean) {
  const session = await requireSession();
  if (!canManageCostSheets(session)) throw new Error("权限不足");
  await db.costSheet.update({ where: { id }, data: { isActive } });
  revalidatePath("/cost-sheets");
}
