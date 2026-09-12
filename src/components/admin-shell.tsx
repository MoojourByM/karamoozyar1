"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth-actions";
import type { Session } from "@/lib/auth";
import { cn } from "@/components/ui";

const adminLinks = [
  { href: "/admin", label: "نمای کلی", icon: "⌂", exact: true },
  { href: "/admin/companies", label: "شرکت‌ها", icon: "▣" },
  { href: "/admin/placements", label: "پذیرش و نامه‌ها", icon: "▤" },
  { href: "/internships", label: "فرصت‌های کارآموزی", icon: "⌕" },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

export default function AdminShell({
  session,
  children,
}: {
  session: Session;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="relative -mx-4 min-h-[calc(100vh-4rem)] overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(13,148,136,0.12),transparent_34%),#f8fafc] px-4 py-5 sm:py-7">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start">
        <aside className="hidden overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur lg:block">
          <div className="border-b border-slate-100 px-5 py-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-700 text-xl font-black text-white shadow-sm shadow-teal-700/20">
                ک
              </span>
              <div>
                <p className="text-sm font-black text-slate-900">مرکز کنترل</p>
                <p className="mt-0.5 text-[11px] font-medium text-slate-400">مدیریت کارآموزیار</p>
              </div>
            </div>
          </div>

          <nav aria-label="ناوبری مدیریت" className="space-y-1 p-3">
            <p className="px-3 pb-2 pt-1 text-[10px] font-black tracking-wide text-slate-400">منوی مدیریت</p>
            {adminLinks.map((link) => {
              const active = isActive(pathname, link.href, link.exact);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition",
                    active
                      ? "bg-teal-50 text-teal-800 ring-1 ring-inset ring-teal-100"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <span className={cn("flex h-8 w-8 items-center justify-center rounded-xl text-base", active ? "bg-white text-teal-700 shadow-sm" : "bg-slate-100 text-slate-500")}>
                    {link.icon}
                  </span>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="m-3 rounded-2xl bg-slate-50 p-3">
            <p className="truncate text-xs font-black text-slate-800">{session.name}</p>
            <p className="mt-1 truncate text-[11px] font-medium text-slate-400">{session.email}</p>
            <form action={logoutAction} className="mt-3">
              <button type="submit" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700">
                خروج از حساب
              </button>
            </form>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur lg:hidden">
            <div className="min-w-0">
              <p className="text-xs font-black text-slate-900">پنل مدیریت دانشگاه</p>
              <p className="mt-0.5 truncate text-[11px] text-slate-400">{session.name}</p>
            </div>
            <form action={logoutAction}>
              <button type="submit" className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-700">
                خروج
              </button>
            </form>
          </div>

          <nav aria-label="دسترسی سریع مدیریت" className="mb-6 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {adminLinks.map((link) => {
              const active = isActive(pathname, link.href, link.exact);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "shrink-0 rounded-xl border px-3.5 py-2 text-xs font-bold transition",
                    active ? "border-teal-200 bg-teal-50 text-teal-800" : "border-slate-200 bg-white text-slate-500"
                  )}
                >
                  {link.icon} {link.label}
                </Link>
              );
            })}
          </nav>

          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}