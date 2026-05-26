type Department = "PRODUCT" | "FINANCE" | "DESIGN" | "TECH" | "PROCUREMENT" | "MARKETING" | "SALES";
type Role = "ADMIN" | "MEMBER" | "VIEWER";
type Stage = "PROPOSAL" | "FILING" | "INITIAL_QUOTE" | "REVIEW" | "PRODUCTION" | "FINAL_QUOTE" | "LAUNCH" | "REJECTED";

export interface SessionUser {
  id: string;
  role: Role;
  department: Department;
}

export function canAdvanceStage(user: SessionUser, fromStage: Stage): boolean {
  if (user.role === "ADMIN") return true;
  if (user.role === "VIEWER") return false;
  const map: Partial<Record<Stage, Department[]>> = {
    PROPOSAL: ["PRODUCT"],
    FILING: ["PRODUCT", "FINANCE"],
    INITIAL_QUOTE: ["PRODUCT"],
    REVIEW: ["PRODUCT"],
    PRODUCTION: ["PRODUCT"],
    FINAL_QUOTE: ["FINANCE"],
    LAUNCH: ["PRODUCT", "MARKETING"],
  };
  return map[fromStage]?.includes(user.department) ?? false;
}

export function canRejectStage(user: SessionUser): boolean {
  return user.role === "ADMIN" || user.department === "PRODUCT";
}

export function canManageCostSheets(user: SessionUser): boolean {
  return user.role === "ADMIN" || user.department === "FINANCE";
}

export function canCreateQuote(user: SessionUser): boolean {
  return user.role === "ADMIN" || ["PRODUCT", "FINANCE"].includes(user.department);
}

export function canUploadAttachment(user: SessionUser, stage: Stage): boolean {
  if (user.role === "ADMIN") return true;
  if (user.role === "VIEWER") return false;
  if (stage === "PRODUCTION") return true;
  return ["PRODUCT", "FINANCE"].includes(user.department);
}

export function canSeeProduct(user: SessionUser, stage: Stage): boolean {
  if (user.role === "ADMIN" || ["PRODUCT", "FINANCE"].includes(user.department)) return true;
  if (["DESIGN", "TECH", "PROCUREMENT"].includes(user.department)) return stage !== "PROPOSAL";
  if (["MARKETING", "SALES"].includes(user.department)) return stage === "LAUNCH";
  return false;
}

export function canManageUsers(user: SessionUser): boolean {
  return user.role === "ADMIN";
}
