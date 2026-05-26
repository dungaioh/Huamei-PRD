import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { canSeeProduct } from "@/lib/permissions";
import { generateProductCode } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const stage = searchParams.get("stage");
  const q = searchParams.get("q");

  const products = await db.product.findMany({
    where: {
      ...(stage ? { currentStage: stage as never } : {}),
      ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { code: { contains: q, mode: "insensitive" } }] } : {}),
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(products.filter(p => canSeeProduct(session, p.currentStage as never)));
}

export async function POST(req: NextRequest) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const product = await db.product.create({
    data: {
      ...data,
      code: generateProductCode(),
      source: "api",
    },
  });

  return NextResponse.json(product, { status: 201 });
}
