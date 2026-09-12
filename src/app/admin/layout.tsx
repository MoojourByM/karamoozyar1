import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth";
import AdminShell from "@/components/admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireRole("admin");
  return <AdminShell session={session}>{children}</AdminShell>;
}
