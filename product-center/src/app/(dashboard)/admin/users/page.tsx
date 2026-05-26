import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { canManageUsers } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { DEPARTMENT_LABELS, ROLE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export default async function UsersPage() {
  const session = await getSession();
  if (!session || !canManageUsers(session)) redirect("/products");

  const users = await db.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <h1 className="text-xl font-semibold text-neutral-900 mb-6">用户管理</h1>
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50 text-neutral-500">
              <th className="px-4 py-3 text-left font-medium">姓名</th>
              <th className="px-4 py-3 text-left font-medium">邮箱</th>
              <th className="px-4 py-3 text-left font-medium">部门</th>
              <th className="px-4 py-3 text-left font-medium">角色</th>
              <th className="px-4 py-3 text-left font-medium">注册时间</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium text-neutral-900">{user.name}</td>
                <td className="px-4 py-3 text-neutral-500">{user.email}</td>
                <td className="px-4 py-3">{DEPARTMENT_LABELS[user.department]}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                    ${user.role === "ADMIN" ? "bg-purple-100 text-purple-700" : user.role === "MEMBER" ? "bg-blue-100 text-blue-700" : "bg-neutral-100 text-neutral-600"}`}>
                    {ROLE_LABELS[user.role]}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-400">{formatDate(user.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
