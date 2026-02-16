"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Wallet, Repeat, Send, BarChart, Settings, Bot, Building, CreditCard, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/src/utils/helpers"
import { CherokeeBankLogo } from "./logo"

const navLinks = [
  { href: "/dashboard", icon: Home, label: "Dashboard", badge: null },
  { href: "/dashboard/wallets", icon: Wallet, label: "Wallets", badge: null },
  { href: "/dashboard/crypto", icon: Repeat, label: "Crypto", badge: "Live" },
  { href: "/dashboard/transactions", icon: BarChart, label: "Transactions", badge: null },
  { href: "/dashboard/send", icon: Send, label: "Send Money", badge: null },
  { href: "/dashboard/cards", icon: CreditCard, label: "Cards", badge: "New" },
  { href: "/dashboard/merchant", icon: Building, label: "Merchant", badge: null },
  { href: "/dashboard/ai", icon: Bot, label: "AI Assistant", badge: "New" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings", badge: null },
];

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "shrink-0 bg-[#061B3A] border-r border-white/5 flex flex-col relative transition-all duration-300 ease-in-out",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      {/* Collapse toggle arrow */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-7 z-30 w-6 h-6 rounded-full bg-[#0d2240] border border-white/10 flex items-center justify-center hover:bg-[#D4AF37]/15 hover:border-[#D4AF37]/30 transition-all group"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed
          ? <ChevronRight className="w-3 h-3 text-white/40 group-hover:text-[#D4AF37] transition-colors" />
          : <ChevronLeft className="w-3 h-3 text-white/40 group-hover:text-[#D4AF37] transition-colors" />
        }
      </button>

      {/* Logo */}
      <div className={cn("border-b border-white/5 flex items-center transition-all duration-300", collapsed ? "justify-center p-4" : "p-6")}>
        <CherokeeBankLogo size={collapsed ? "xs" : "xs"} />
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 flex flex-col gap-1 overflow-y-auto transition-all duration-300", collapsed ? "p-2" : "p-4")}>
        {!collapsed && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/20 px-3 mb-2">Main Menu</span>
        )}
        {navLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname?.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              title={collapsed ? link.label : undefined}
              className={cn(
                "flex items-center rounded-xl text-sm font-medium transition-all",
                collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
                isActive
                  ? "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              )}
            >
              <link.icon className={cn("h-4 w-4 shrink-0", isActive && "text-[#D4AF37]")} />
              {!collapsed && <span className="flex-1 truncate">{link.label}</span>}
              {!collapsed && link.badge && (
                <span className={cn(
                  "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full",
                  link.badge === "Live" ? "bg-emerald-500/20 text-emerald-400" : "bg-[#D4AF37]/20 text-[#D4AF37]"
                )}>
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className={cn("border-t border-white/5 transition-all duration-300", collapsed ? "p-2" : "p-4")}>
        <div className={cn("liquid-glass rounded-xl", collapsed ? "p-2" : "p-3")}>
          <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-2 mb-2")}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            {!collapsed && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">System Online</span>
            )}
          </div>
          {!collapsed && <div className="text-[11px] text-white/30">Cherokee Digital v3.0</div>}
        </div>
      </div>
    </aside>
  )
}
