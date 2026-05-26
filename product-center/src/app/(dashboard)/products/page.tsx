import Link from "next/link";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { canSeeProduct } from "@/lib/permissions";
import { STAGE_ORDER } from "@/lib/constants";
import { StageBadge } from "@/components/products/stage-badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";

type PageProps = { searchParams?: Promise<Record<string, string | string[]>> };

export default async function ProductsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const stageFilter = (searchParams?.stage as string | undefined) ?? "";
  const q = (searchParams?.q as string | undefined) ?? "";

  const session = await getSession();
  if (!session) return null;

  const products = await db.product.findMany({
    where: {
      ...(stageFilter ? { currentStage: stageFilter as never } : {}),
      ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { code: { contains: q, mode: "insensitive" } }] } : {}),
    },
    orderBy: { updatedAt: "desc" },
  });

  const visible = products.filter((p) => canSeeProduct(session!, p.currentStage as never));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">产品管理</h1>
        <Link href="/products/new">
          <Button size="sm"><Plus className="h-4 w-4" />新建产品</Button>
        </Link>
      </div>

      {/* Stage filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <Link href="/products" className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${!stageFilter ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}>
          全部
        </Link>
        {STAGE_ORDER.map(s => (
          <Link key={s} href={`/products?stage=${s}`}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${stageFilter === s ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}>
            {s === "PROPOSAL" ? "需求提案" : s === "FILING" ? "建档" : s === "INITIAL_QUOTE" ? "初报价" : s === "REVIEW" ? "需求审核" : s === "PRODUCTION" ? "正式出品" : s === "FINAL_QUOTE" ? "终报价" : "上市"}
          </Link>
        ))}
      </div>

      {/* Search */}
      <form className="mb-4">
        <input name="q" defaultValue={q} placeholder="搜索产品名称或编号…"
          className="h-9 w-72 rounded-md border border-neutral-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900" />
        {stageFilter && <input type="hidden" name="stage" value={stageFilter} />}
      </form>

      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50 text-neutral-500">
              <th className="px-4 py-3 text-left font-medium">产品编号</th>
              <th className="px-4 py-3 text-left font-medium">产品名称</th>
              <th className="px-4 py-3 text-left font-medium">分类</th>
              <th className="px-4 py-3 text-left font-medium">当前阶段</th>
              <th className="px-4 py-3 text-left font-medium">更新时间</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {visible.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">暂无产品</td>
              </tr>
            ) : (
              visible.map(p => (
                <tr key={p.id} className="hover:bg-neutral-50 cursor-pointer">
                  <td className="px-4 py-3 font-mono text-xs text-neutral-500">{p.code}</td>
                  <td className="px-4 py-3">
                    <Link href={`/products/${p.id}`} className="font-medium text-neutral-900 hover:underline">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{p.category ?? "—"}</td>
                  <td className="px-4 py-3"><StageBadge stage={p.currentStage} /></td>
                  <td className="px-4 py-3 text-neutral-400">{formatDate(p.updatedAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
