"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Wallet, Repeat, Settings, Shield } from "lucide-react"
import { cn } from "@/src/utils/helpers"
import { CherokeeBankLogo } from "./logo"

const adminNavLinks = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/wallets", icon: Wallet, label: "Wallets" },
  { href: "/admin/transactions", icon: Repeat, label: "Transactions" },
  { href: "/admin/fraud-center", icon: Shield, label: "Fraud Center" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 shrink-0 bg-[#061B3A] border-r border-white/5 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <CherokeeBankLogo size="small" />
      </div>

      {/* Admin badge */}
      <div className="px-4 pt-4 pb-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">Admin Panel</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto">
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/20 px-3 mb-2">Management</span>
        {adminNavLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/admin" && pathname?.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              )}
            >
              <link.icon className={cn("h-4 w-4", isActive && "text-[#D4AF37]")} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-white/5">
        <div className="liquid-glass rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">System Online</span>
          </div>
          <div className="text-[11px] text-white/30">Cherokee Admin v3.0</div>
        </div>
      </div>
    </aside>
  )
}
