"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, BarChart3, CheckSquare,
  FileSpreadsheet, Users, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/bi", label: "看板", icon: LayoutDashboard },
  { href: "/products", label: "产品管理", icon: Package },
  { href: "/tasks", label: "任务管理", icon: CheckSquare },
  { href: "/cost-sheets", label: "成本表", icon: FileSpreadsheet },
  { href: "/admin/users", label: "用户管理", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-neutral-200 bg-white flex flex-col h-full">
      <div className="px-6 py-5 border-b border-neutral-200">
        <span className="font-bold text-base text-neutral-900">产品中心</span>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-neutral-100 text-neutral-900 font-medium"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              {active && <ChevronRight className="ml-auto h-3 w-3" />}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
