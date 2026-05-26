import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { STAGE_ORDER, STAGE_LABELS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BiCharts } from "./charts";

export default async function BiPage() {
  const session = await getSession();
  if (!session) return null;

  const [products, tasks, quotes] = await Promise.all([
    db.product.findMany({ select: { currentStage: true, createdAt: true } }),
    db.task.findMany({ select: { status: true } }),
    db.quote.findMany({ select: { type: true, totalCost: true, suggestedPrice: true } }),
  ]);

  const stageCounts = STAGE_ORDER.map(stage => ({
    stage,
    label: STAGE_LABELS[stage],
    count: products.filter(p => p.currentStage === stage).length,
  }));

  const taskStats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === "DONE").length,
    inProgress: tasks.filter(t => t.status === "IN_PROGRESS").length,
    blocked: tasks.filter(t => t.status === "BLOCKED").length,
  };

  const totalRevenuePotential = quotes
    .filter(q => q.type === "FINAL" && q.suggestedPrice)
    .reduce((sum, q) => sum + Number(q.suggestedPrice), 0);

  const totalCost = quotes
    .filter(q => q.type === "FINAL")
    .reduce((sum, q) => sum + Number(q.totalCost), 0);

  return (
    <div>
      <h1 className="text-xl font-semibold text-neutral-900 mb-6">数据看板</h1>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-neutral-500">总产品数</p>
            <p className="text-3xl font-bold text-neutral-900 mt-1">{products.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-neutral-500">已上市</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {products.filter(p => p.currentStage === "LAUNCH").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-neutral-500">任务完成率</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              {taskStats.total ? Math.round((taskStats.done / taskStats.total) * 100) : 0}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-neutral-500">预计总营收</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">
              ¥{(totalRevenuePotential / 10000).toFixed(1)}万
            </p>
          </CardContent>
        </Card>
      </div>

      <BiCharts stageCounts={stageCounts} taskStats={taskStats} />
    </div>
  );
}
