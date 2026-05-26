import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { canAdvanceStage, canRejectStage } from "@/lib/permissions";
import { STAGE_ORDER, STAGE_LABELS, NEXT_STAGE, DEPARTMENT_LABELS } from "@/lib/constants";
import { StageBadge } from "@/components/products/stage-badge";
import { Button } from "@/components/ui/button";
import { advanceStage, rejectProduct } from "@/actions/products";
import { formatDate } from "@/lib/utils";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

type PageProps = { params: Promise<{ id: string }> };

export default async function ProductDetailPage(props: PageProps) {
  const { id } = await props.params;
  const session = await getSession();
  if (!session) return null;

  const product = await db.product.findUnique({
    where: { id },
    include: {
      stageActions: { include: { actor: true }, orderBy: { createdAt: "asc" } },
      quotes: { include: { createdBy: true }, orderBy: { createdAt: "desc" } },
      tasks: { include: { assignee: true }, orderBy: { createdAt: "desc" } },
      attachments: { include: { uploadedBy: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!product) notFound();

  const canAdvance = canAdvanceStage(session, product.currentStage as never) && NEXT_STAGE[product.currentStage];
  const canReject = canRejectStage(session) && product.currentStage !== "REJECTED" && product.currentStage !== "LAUNCH";

  const currentStageIdx = STAGE_ORDER.indexOf(product.currentStage as never);

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-mono text-neutral-400 mb-1">{product.code}</p>
          <h1 className="text-2xl font-semibold text-neutral-900">{product.name}</h1>
          {product.category && <p className="text-sm text-neutral-500 mt-1">{product.category}</p>}
        </div>
        <div className="flex items-center gap-2">
          <StageBadge stage={product.currentStage} />
          {canAdvance && (
            <form action={async () => { "use server"; await advanceStage(id); }}>
              <Button size="sm" type="submit">
                推进至 {STAGE_LABELS[NEXT_STAGE[product.currentStage]]}
              </Button>
            </form>
          )}
          {canReject && (
            <form action={async () => { "use server"; await rejectProduct(id); }}>
              <Button size="sm" variant="destructive" type="submit">拒绝</Button>
            </form>
          )}
        </div>
      </div>

      {/* Stage progress */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <h2 className="text-sm font-medium text-neutral-700 mb-4">出品进度</h2>
        <div className="flex items-center gap-0">
          {STAGE_ORDER.map((stage, i) => {
            const done = i < currentStageIdx;
            const current = i === currentStageIdx;
            const rejected = product.currentStage === "REJECTED";
            return (
              <div key={stage} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-colors
                    ${done ? "bg-green-500 border-green-500 text-white" : current && !rejected ? "bg-neutral-900 border-neutral-900 text-white" : "bg-white border-neutral-200 text-neutral-400"}`}>
                    {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className={`mt-1.5 text-xs whitespace-nowrap ${current ? "text-neutral-900 font-medium" : done ? "text-green-600" : "text-neutral-400"}`}>
                    {STAGE_LABELS[stage]}
                  </span>
                </div>
                {i < STAGE_ORDER.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 ${done ? "bg-green-400" : "bg-neutral-200"}`} />
                )}
              </div>
            );
          })}
          {product.currentStage === "REJECTED" && (
            <div className="flex flex-col items-center ml-3">
              <XCircle className="h-7 w-7 text-red-500" />
              <span className="mt-1.5 text-xs text-red-500 font-medium">已拒绝</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Proposal data */}
        {product.proposalData && (
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <h2 className="text-sm font-medium text-neutral-700 mb-3">提案数据</h2>
            <pre className="text-xs text-neutral-600 overflow-auto whitespace-pre-wrap">
              {JSON.stringify(product.proposalData, null, 2)}
            </pre>
          </div>
        )}

        {/* Description */}
        {product.description && (
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <h2 className="text-sm font-medium text-neutral-700 mb-2">需求描述</h2>
            <p className="text-sm text-neutral-600">{product.description}</p>
          </div>
        )}
      </div>

      {/* Stage history */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <h2 className="text-sm font-medium text-neutral-700 mb-4">操作记录</h2>
        <div className="space-y-3">
          {product.stageActions.map(action => (
            <div key={action.id} className="flex items-start gap-3 text-sm">
              <Clock className="h-4 w-4 text-neutral-300 mt-0.5 shrink-0" />
              <div>
                <span className="text-neutral-900 font-medium">{action.actor.name}</span>
                <span className="text-neutral-500 mx-1.5">→</span>
                <StageBadge stage={action.toStage} />
                {action.comment && <p className="text-neutral-400 text-xs mt-0.5">{action.comment}</p>}
                <p className="text-neutral-300 text-xs">{formatDate(action.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quotes */}
      {product.quotes.length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <h2 className="text-sm font-medium text-neutral-700 mb-4">报价记录</h2>
          <div className="space-y-2">
            {product.quotes.map(q => (
              <div key={q.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                <div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${q.type === "INITIAL" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                    {q.type === "INITIAL" ? "初报价" : "终报价"}
                  </span>
                  <span className="ml-2 text-xs text-neutral-400">by {q.createdBy.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-medium text-neutral-900">¥{Number(q.totalCost).toLocaleString()}</p>
                  {q.suggestedPrice && <p className="text-xs text-neutral-400">建议售价 ¥{Number(q.suggestedPrice).toLocaleString()}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attachments */}
      {product.attachments.length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <h2 className="text-sm font-medium text-neutral-700 mb-4">附件资料</h2>
          <div className="space-y-2">
            {product.attachments.map(att => (
              <div key={att.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                <div>
                  <a href={att.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">{att.fileName}</a>
                  <p className="text-xs text-neutral-400">
                    {DEPARTMENT_LABELS[att.department]} · {att.uploadedBy.name} · {formatDate(att.createdAt)}
                  </p>
                </div>
                <StageBadge stage={att.stage} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tasks */}
      {product.tasks.length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <h2 className="text-sm font-medium text-neutral-700 mb-4">相关任务</h2>
          <div className="space-y-2">
            {product.tasks.map(task => (
              <div key={task.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{task.title}</p>
                  {task.assignee && <p className="text-xs text-neutral-400">负责人：{task.assignee.name}</p>}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                  ${task.status === "DONE" ? "bg-green-100 text-green-700" : task.status === "BLOCKED" ? "bg-red-100 text-red-700" : task.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" : "bg-neutral-100 text-neutral-600"}`}>
                  {task.status === "TODO" ? "待处理" : task.status === "IN_PROGRESS" ? "进行中" : task.status === "DONE" ? "已完成" : "受阻"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
