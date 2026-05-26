import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { generateProductCode } from "@/lib/utils";

function verifyFeishuSignature(timestamp: string, token: string, body: string, secret: string): boolean {
  const str = timestamp + token + secret + body;
  const hash = crypto.createHash("sha256").update(str).digest("hex");
  return hash === token;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const secret = process.env.FEISHU_WEBHOOK_SECRET;

  if (secret) {
    const timestamp = req.headers.get("x-lark-request-timestamp") ?? "";
    const token = req.headers.get("x-lark-signature") ?? "";
    if (!verifyFeishuSignature(timestamp, token, body, secret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let payload: Record<string, unknown>;
  try { payload = JSON.parse(body); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Handle Feishu challenge (URL verification)
  if (payload.challenge) {
    return NextResponse.json({ challenge: payload.challenge });
  }

  const formData = (payload.event as Record<string, unknown>)?.form_data ?? payload;
  const name = (formData as Record<string, string>)?.product_name ?? `表单提案 ${Date.now()}`;

  await db.product.create({
    data: {
      name: String(name),
      code: generateProductCode(),
      source: "feishu",
      proposalData: formData as never,
      currentStage: "PROPOSAL",
    },
  });

  return NextResponse.json({ ok: true });
}
