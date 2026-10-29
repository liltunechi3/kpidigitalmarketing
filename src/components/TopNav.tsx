"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SidebarSignOut } from "@/components/SidebarSignOut";
import { IconBell, IconFlame } from "@/components/icons";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

export function TopNav({
  nav,
  fullName,
  roleLabel,
  isAdmin,
  initials,
}: {
  nav: NavItem[];
  fullName: string;
  roleLabel: string;
  isAdmin: boolean;
  initials: string;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <>
      {/* Desktop top bar */}
      <header className="sticky top-4 z-30 mx-4 mt-4 hidden md:block">
        <div className="mx-auto flex max-w-7xl items-center gap-3 rounded-2xl border border-black/[0.06] bg-white/90 px-4 py-2.5 shadow-[0_1px_2px_rgba(16,15,10,0.05),0_12px_32px_-18px_rgba(16,15,10,0.35)] backdrop-blur">
          <Link href="/dashboard" className="flex shrink-0 items-center gap-2 pr-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-ink text-accent">
              <IconFlame className="h-4 w-4" />
            </span>
            <span className="hidden text-sm font-semibold tracking-tight text-neutral-900 lg:inline">
              KPI Digital
            </span>
          </Link>

          <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
            {nav.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                    active
                      ? "bg-ink text-white shadow-sm"
                      : "text-neutral-600 hover:bg-cream-100"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2 pl-2">
            <button
              type="button"
              aria-label="Notifikasi"
              className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-cream-100 hover:text-neutral-900"
            >
              <IconBell className="h-4 w-4" />
            </button>
            <div className="group relative flex items-center gap-2 rounded-full py-1 pl-1 pr-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-ink">
                {initials}
              </div>
              <div className="hidden text-left xl:block">
                <p className="max-w-[140px] truncate text-xs font-medium text-neutral-900">{fullName}</p>
                <p className="truncate text-[11px] text-neutral-400">
                  {roleLabel}
                  {isAdmin && " · Admin"}
                </p>
              </div>
            </div>
            <SidebarSignOut />
          </div>
        </div>
      </header>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 border-b border-black/[0.06] bg-white/95 backdrop-blur md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-ink text-accent">
              <IconFlame className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-neutral-900">KPI Digital Marketing</p>
              <p className="text-[11px] text-neutral-400">
                {fullName} &middot; {roleLabel}
                {isAdmin && " · Admin"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Notifikasi"
              className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:bg-cream-100"
            >
              <IconBell className="h-4 w-4" />
            </button>
            <SidebarSignOut />
          </div>
        </div>
        <nav className="flex gap-1.5 overflow-x-auto px-3 pb-3">
          {nav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  active ? "bg-ink text-white" : "bg-cream-100 text-neutral-600"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
    </>
  );
}
