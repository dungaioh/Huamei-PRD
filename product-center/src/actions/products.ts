"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { canAdvanceStage, canRejectStage } from "@/lib/permissions";
import { NEXT_STAGE } from "@/lib/constants";
import { generateProductCode } from "@/lib/utils";

export async function createProduct(formData: FormData) {
  const session = await requireSession();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;

  if (!name) throw new Error("产品名称必填");

  await db.product.create({
    data: {
      name,
      description: description || undefined,
      category: category || undefined,
      code: generateProductCode(),
      source: "manual",
      stageActions: {
        create: { toStage: "PROPOSAL", actorId: session.id, comment: "手动建档" },
      },
    },
  });

  revalidatePath("/products");
}

export async function advanceStage(productId: string, comment?: string) {
  const session = await requireSession();
  const product = await db.product.findUniqueOrThrow({ where: { id: productId } });

  if (!canAdvanceStage(session, product.currentStage as never)) {
    throw new Error("权限不足");
  }

  const nextStage = NEXT_STAGE[product.currentStage];
  if (!nextStage) throw new Error("已是最终阶段");

  await db.product.update({
    where: { id: productId },
    data: {
      currentStage: nextStage as never,
      stageActions: {
        create: {
          fromStage: product.currentStage as never,
          toStage: nextStage as never,
          actorId: session.id,
          comment: comment || undefined,
        },
      },
    },
  });

  revalidatePath(`/products/${productId}`);
  revalidatePath("/products");
}

export async function rejectProduct(productId: string, comment?: string) {
  const session = await requireSession();
  if (!canRejectStage(session)) throw new Error("权限不足");

  const product = await db.product.findUniqueOrThrow({ where: { id: productId } });

  await db.product.update({
    where: { id: productId },
    data: {
      currentStage: "REJECTED",
      stageActions: {
        create: {
          fromStage: product.currentStage as never,
          toStage: "REJECTED",
          actorId: session.id,
          comment: comment || "已拒绝",
        },
      },
    },
  });

  revalidatePath(`/products/${productId}`);
  revalidatePath("/products");
}
