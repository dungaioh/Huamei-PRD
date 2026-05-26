import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { TASK_STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS, STAGE_LABELS } from "@/lib/constants";
import { StageBadge } from "@/components/products/stage-badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function TasksPage() {
  const session = await getSession();
  if (!session) return null;

  const tasks = await db.task.findMany({
    include: { product: true, assignee: true },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
  });

  const myTasks = tasks.filter(t => t.assigneeId === session.id);
  const allTasks = tasks;

  const groups = {
    TODO: tasks.filter(t => t.status === "TODO"),
    IN_PROGRESS: tasks.filter(t => t.status === "IN_PROGRESS"),
    BLOCKED: tasks.filter(t => t.status === "BLOCKED"),
    DONE: tasks.filter(t => t.status === "DONE"),
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-neutral-900 mb-6">任务管理</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(["TODO", "IN_PROGRESS", "BLOCKED", "DONE"] as const).map(status => (
          <div key={status} className="bg-white rounded-xl border border-neutral-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-neutral-700">{TASK_STATUS_LABELS[status]}</h2>
              <span className="text-xs text-neutral-400 bg-neutral-100 rounded-full px-2 py-0.5">
                {groups[status].length}
              </span>
            </div>
            <div className="space-y-2">
              {groups[status].map(task => (
                <div key={task.id} className="rounded-lg border border-neutral-100 p-3 text-sm hover:border-neutral-200 transition-colors">
                  <Link href={`/products/${task.productId}`} className="font-medium text-neutral-900 hover:underline text-xs">
                    {task.product.name}
                  </Link>
                  <p className="text-neutral-700 mt-0.5">{task.title}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <StageBadge stage={task.stage} className="text-[10px]" />
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[task.priority]}`}>
                      {PRIORITY_LABELS[task.priority]}
                    </span>
                  </div>
                  {task.assignee && (
                    <p className="text-xs text-neutral-400 mt-1">@{task.assignee.name}</p>
                  )}
                  {task.dueDate && (
                    <p className="text-xs text-neutral-300 mt-0.5">截止 {formatDate(task.dueDate)}</p>
                  )}
                </div>
              ))}
              {groups[status].length === 0 && (
                <p className="text-xs text-neutral-300 py-2 text-center">无任务</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
