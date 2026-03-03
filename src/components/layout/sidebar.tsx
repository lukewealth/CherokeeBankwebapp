"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home, Wallet, TrendingUp, Send, BarChart, Settings, Bot,
  Building, CreditCard, PiggyBank, ChevronLeft, ChevronRight,
} from "lucide-react"
import { cn } from "@/src/utils/helpers"
import { CherokeeBankLogo } from "./logo"

const navLinks = [
  { href: "/dashboard", icon: Home, label: "Dashboard", badge: null },
  { href: "/dashboard/wallets", icon: Wallet, label: "Wallets", badge: null },
  { href: "/dashboard/crypto", icon: TrendingUp, label: "Assets", badge: null },
  { href: "/dashboard/transactions", icon: BarChart, label: "Transactions", badge: null },
  { href: "/dashboard/send", icon: Send, label: "Send Money", badge: null },
  { href: "/dashboard/savings", icon: PiggyBank, label: "Savings", badge: null },
  { href: "/dashboard/cards", icon: CreditCard, label: "Cards", badge: null },
  { href: "/dashboard/merchant", icon: Building, label: "Merchant", badge: null },
  { href: "/dashboard/ai", icon: Bot, label: "AI Assistant", badge: null },
  { href: "/dashboard/settings", icon: Settings, label: "Settings", badge: null },
];

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "shrink-0 bg-[#040A14] border-r border-white/[0.04] flex flex-col relative transition-all duration-300 ease-in-out",
        collapsed ? "w-[60px]" : "w-[220px]"
      )}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-7 z-30 w-5 h-5 rounded-full bg-[#0a1628] border border-white/[0.08] flex items-center justify-center hover:border-white/15 transition-all"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed
          ? <ChevronRight className="w-2.5 h-2.5 text-white/30" />
          : <ChevronLeft className="w-2.5 h-2.5 text-white/30" />}
      </button>

      {/* Logo */}
      <div className={cn(
        "border-b border-white/[0.04] flex items-center transition-all duration-300",
        collapsed ? "justify-center p-3" : "px-5 py-5"
      )}>
        <CherokeeBankLogo size={collapsed ? "xs" : "xs"} />
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 flex flex-col gap-0.5 overflow-y-auto transition-all duration-300",
        collapsed ? "p-2" : "p-3"
      )}>
        {!collapsed && (
          <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/15 px-3 mb-2 mt-1">
            Menu
          </span>
        )}
        {navLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname?.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              title={collapsed ? link.label : undefined}
              className={cn(
                "flex items-center rounded-lg text-[12px] font-medium transition-all",
                collapsed ? "justify-center px-2 py-2" : "gap-2.5 px-3 py-[7px]",
                isActive
                  ? "bg-white/[0.05] text-white/90"
                  : "text-white/30 hover:text-white/50 hover:bg-white/[0.02]"
              )}
            >
              <link.icon className={cn(
                "h-[15px] w-[15px] shrink-0",
                isActive ? "text-white/70" : "text-white/25"
              )} strokeWidth={1.6} />
              {!collapsed && <span className="flex-1 truncate">{link.label}</span>}
              {!collapsed && link.badge && (
                <span className="text-[8px] font-semibold uppercase px-1.5 py-0.5 rounded bg-white/[0.05] text-white/25">
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className={cn("border-t border-white/[0.04] transition-all duration-300", collapsed ? "p-2" : "p-3")}>
        <div className={cn("rounded-lg bg-white/[0.02] border border-white/[0.03]", collapsed ? "p-2" : "px-3 py-2.5")}>
          <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-2")}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 shrink-0" />
            {!collapsed && (
              <span className="text-[10px] font-medium text-white/20">Online</span>
            )}
          </div>
          {!collapsed && (
            <p className="text-[10px] text-white/10 mt-1">Cherokee Bank v3.0</p>
          )}
        </div>
      </div>
    </aside>
  )
}
