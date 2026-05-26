import { STAGE_LABELS, STAGE_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function StageBadge({ stage, className }: { stage: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", STAGE_COLORS[stage], className)}>
      {STAGE_LABELS[stage] ?? stage}
    </span>
  );
}
