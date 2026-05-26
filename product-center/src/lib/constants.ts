export const STAGE_LABELS: Record<string, string> = {
  PROPOSAL: "需求提案",
  FILING: "建档",
  INITIAL_QUOTE: "初报价",
  REVIEW: "需求审核",
  PRODUCTION: "正式出品",
  FINAL_QUOTE: "终报价",
  LAUNCH: "上市",
  REJECTED: "已拒绝",
};

export const STAGE_COLORS: Record<string, string> = {
  PROPOSAL: "bg-slate-100 text-slate-700",
  FILING: "bg-blue-100 text-blue-700",
  INITIAL_QUOTE: "bg-yellow-100 text-yellow-700",
  REVIEW: "bg-purple-100 text-purple-700",
  PRODUCTION: "bg-orange-100 text-orange-700",
  FINAL_QUOTE: "bg-pink-100 text-pink-700",
  LAUNCH: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export const STAGE_ORDER = [
  "PROPOSAL",
  "FILING",
  "INITIAL_QUOTE",
  "REVIEW",
  "PRODUCTION",
  "FINAL_QUOTE",
  "LAUNCH",
] as const;

export const NEXT_STAGE: Record<string, string> = {
  PROPOSAL: "FILING",
  FILING: "INITIAL_QUOTE",
  INITIAL_QUOTE: "REVIEW",
  REVIEW: "PRODUCTION",
  PRODUCTION: "FINAL_QUOTE",
  FINAL_QUOTE: "LAUNCH",
};

export const DEPARTMENT_LABELS: Record<string, string> = {
  PRODUCT: "产品部",
  FINANCE: "财务部",
  DESIGN: "设计部",
  TECH: "技术部",
  PROCUREMENT: "采购部",
  MARKETING: "市场部",
  SALES: "销售部",
};

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "管理员",
  MEMBER: "成员",
  VIEWER: "只读",
};

export const TASK_STATUS_LABELS: Record<string, string> = {
  TODO: "待处理",
  IN_PROGRESS: "进行中",
  DONE: "已完成",
  BLOCKED: "受阻",
};

export const PRIORITY_LABELS: Record<string, string> = {
  LOW: "低",
  MEDIUM: "中",
  HIGH: "高",
  URGENT: "紧急",
};

export const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-blue-100 text-blue-600",
  HIGH: "bg-orange-100 text-orange-600",
  URGENT: "bg-red-100 text-red-600",
};
