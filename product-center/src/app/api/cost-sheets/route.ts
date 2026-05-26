import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { canManageCostSheets } from "@/lib/permissions";

export async function GET() {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sheets = await db.costSheet.findMany({
    where: { isActive: true },
    orderBy: { yearMonth: "desc" },
  });

  return NextResponse.json(sheets);
}

export async function POST(req: NextRequest) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageCostSheets(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const data = await req.json();
  const sheet = await db.costSheet.create({ data: { ...data, createdById: session.id } });
  return NextResponse.json(sheet, { status: 201 });
}
