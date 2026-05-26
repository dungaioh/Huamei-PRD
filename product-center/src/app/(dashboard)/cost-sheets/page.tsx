import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { canManageCostSheets } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { toggleCostSheetActive } from "@/actions/cost-sheets";

export default async function CostSheetsPage() {
  const session = await getSession();
  if (!session) return null;

  const canManage = canManageCostSheets(session);
  const sheets = await db.costSheet.findMany({
    include: { createdBy: true },
    orderBy: { yearMonth: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">成本表管理</h1>
        {canManage && (
          <Button size="sm" asChild>
            <a href="/cost-sheets/new">新建成本表</a>
          </Button>
        )}
      </div>

      {!canManage && (
        <p className="text-sm text-neutral-400 mb-4">成本表由财务部维护，您可以查看当前有效的成本表。</p>
      )}

      <div className="space-y-3">
        {sheets.map(sheet => {
          const items = sheet.items as { category: string; unit: string; unitCost: number }[];
          return (
            <div key={sheet.id} className="bg-white rounded-xl border border-neutral-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-medium text-neutral-900">{sheet.name}</span>
                  <span className="ml-2 text-xs text-neutral-400">{sheet.yearMonth}</span>
                  {sheet.isActive && (
                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">当前有效</span>
                  )}
                </div>
                {canManage && (
                  <form action={async () => {
                    "use server";
                    await toggleCostSheetActive(sheet.id, !sheet.isActive);
                  }}>
                    <Button type="submit" size="sm" variant="outline">
                      {sheet.isActive ? "停用" : "启用"}
                    </Button>
                  </form>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-neutral-400 border-b border-neutral-100">
                      <th className="py-1.5 pr-6 font-medium">成本项</th>
                      <th className="py-1.5 pr-6 font-medium">单位</th>
                      <th className="py-1.5 font-medium">单价 (¥)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    {items.map((item, i) => (
                      <tr key={i}>
                        <td className="py-1.5 pr-6 text-neutral-700">{item.category}</td>
                        <td className="py-1.5 pr-6 text-neutral-500">{item.unit}</td>
                        <td className="py-1.5 text-neutral-900 font-medium">{item.unitCost.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-neutral-300">
                创建：{sheet.createdBy.name} · {formatDate(sheet.createdAt)}
              </p>
            </div>
          );
        })}
        {sheets.length === 0 && (
          <div className="text-center py-12 text-neutral-400">暂无成本表</div>
        )}
      </div>
    </div>
  );
}
