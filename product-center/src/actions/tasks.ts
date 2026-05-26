"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export async function createTask(formData: FormData) {
  await requireSession();
  const productId = formData.get("productId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const assigneeId = formData.get("assigneeId") as string;
  const stage = formData.get("stage") as string;
  const priority = (formData.get("priority") as string) || "MEDIUM";
  const dueDate = formData.get("dueDate") as string;

  await db.task.create({
    data: {
      productId,
      title,
      description: description || undefined,
      assigneeId: assigneeId || undefined,
      stage: stage as never,
      priority: priority as never,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    },
  });

  revalidatePath(`/products/${productId}`);
  revalidatePath("/tasks");
}

export async function updateTaskStatus(taskId: string, status: string) {
  await requireSession();
  const task = await db.task.update({
    where: { id: taskId },
    data: { status: status as never },
  });
  revalidatePath(`/products/${task.productId}`);
  revalidatePath("/tasks");
}
