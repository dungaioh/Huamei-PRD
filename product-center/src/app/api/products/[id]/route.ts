import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { canSeeProduct } from "@/lib/permissions";
type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const product = await db.product.findUnique({
    where: { id },
    include: { stageActions: true, quotes: true, tasks: true, attachments: true },
  });

  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canSeeProduct(session, product.currentStage as never)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(product);
}
