"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/src/hooks/use-auth";
import { useDashboard, useTransactions } from "@/src/hooks/use-dashboard-data";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Download, ArrowUpDown, ArrowDownToLine, ArrowUpFromLine,
  Shield, TrendingUp, Search, CheckCircle2, Clock, AlertCircle,
  CreditCard,
} from "lucide-react";

/* ── Animation variants ── */
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const item = {
  hidden: { y: 24, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 260, damping: 24 } },
};

/* ── Quick‑action config ── */
const quickActions = [
  { icon: Send,              label: "Send",     href: "/dashboard/send" },
  { icon: ArrowDownToLine,   label: "Receive",  href: "/dashboard/wallets" },
  { icon: ArrowUpDown,       label: "Convert",  href: "/dashboard/crypto" },
  { icon: CreditCard,        label: "Cards",    href: "/dashboard/cards" },
  { icon: Download,          label: "Deposit",  href: "/dashboard/wallets" },
  { icon: ArrowUpFromLine,   label: "Withdraw", href: "/dashboard/wallets" },
];

/* ── Mock transactions (matched to design) ── */
const recentTxns = [
  { id: "1", name: "Payment to",   target: "Amazon",           amount: -129.99, currency: "USD", date: "Today, 10:30 AM",      status: "completed" as const },
  { id: "2", name: "Received from", target: "John Doe",        amount: 500.00,  currency: "USD", date: "Yesterday, 4:15 PM",   status: "completed" as const },
  { id: "3", name: "Converted to",  target: "Gold Coin",       amount: 1.00,    currency: "XAU", date: "May 15, 2:00 PM",      status: "completed" as const },
  { id: "4", name: "Deposit from",  target: "Bank of America", amount: 2500.00, currency: "USD", date: "May 14, 9:00 AM",      status: "pending"   as const },
];

const statusIcons: Record<string, typeof CheckCircle2> = {
  completed: CheckCircle2,
  pending: Clock,
  failed: AlertCircle,
};
const statusColors: Record<string, string> = {
  completed: "text-emerald-400",
  pending:   "text-amber-400",
  failed:    "text-red-400",
};

/* ══════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { user } = useAuth();
  const { data: stats } = useDashboard();
  const [currencyFilter, setCurrencyFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const totalBalance = stats?.totalBalance ?? 1458200.50;

  /* Filter transactions */
  const filteredTxns = recentTxns.filter((tx) => {
    const matchesCurrency = currencyFilter === "All" || tx.currency === currencyFilter;
    const matchesSearch =
      !searchQuery ||
      tx.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCurrency && matchesSearch;
  });

  return (
    <motion.div
      className="max-w-340 mx-auto space-y-8 pb-12"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* ─── Top Row: Portfolio Balance + Recent Transactions ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Portfolio Balance Card (3‑col) ── */}
        <motion.div variants={item} className="lg:col-span-3">
          <div className="relative overflow-hidden rounded-2xl border border-[#D4AF37]/15 bg-linear-to-br from-[#0d1a30] via-[#0a1628] to-[#071020] p-8 min-h-55">
            {/* Subtle gold shimmer overlay */}
            <div className="absolute inset-0 bg-[url('/ui/gold-texture.jpg')] opacity-[0.03] mix-blend-screen pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-white/50 text-sm font-medium tracking-wide mb-1">Total Portfolio Balance</p>
                <div className="flex items-end gap-3 mb-1">
                  <h2 className="text-[3rem] sm:text-[3.6rem] font-extrabold text-white leading-none tracking-tight">
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(totalBalance)}
                  </h2>
                  <TrendingUp className="w-7 h-7 text-[#D4AF37] mb-2 shrink-0" />
                </div>
              </div>

              {/* Gold Reserve Badge */}
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-linear-to-r from-[#D4AF37]/20 to-[#D4AF37]/10 border border-[#D4AF37]/25 shrink-0">
                <Shield className="w-5 h-5 text-[#D4AF37]" />
                <div className="text-right">
                  <p className="text-[#D4AF37] font-semibold text-sm leading-tight">Gold Reserve</p>
                  <p className="text-[#D4AF37]/70 text-xs leading-tight">Backed</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Recent Transactions Card (2‑col) ── */}
        <motion.div variants={item} className="lg:col-span-2">
          <div className="rounded-2xl border border-white/6 bg-[#0a1628]/80 backdrop-blur-xl h-full flex flex-col">
            {/* Header */}
            <div className="px-6 pt-6 pb-4">
              <h3 className="text-lg font-bold text-white mb-4">Recent Transactions</h3>
              {/* Filters row */}
              <div className="flex items-center gap-3">
                {/* Currency dropdown */}
                <div className="relative">
                  <select
                    value={currencyFilter}
                    onChange={(e) => setCurrencyFilter(e.target.value)}
                    className="appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-white/5 border border-white/8 text-white text-xs font-medium focus:outline-none focus:border-[#D4AF37]/30 cursor-pointer"
                  >
                    <option value="All">Currency: All</option>
                    <option value="USD">USD</option>
                    <option value="XAU">XAU</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                  <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
                {/* Search */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-8.5 pl-3.5 pr-9 rounded-xl bg-white/5 border border-white/8 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-[#D4AF37]/30"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
                </div>
              </div>
            </div>

            {/* Column headers */}
            <div className="px-6 flex items-center text-[11px] text-white/30 font-medium uppercase tracking-wider pb-2">
              <span className="flex-1">Name</span>
              <span className="w-28 text-right mr-4">Amount</span>
              <span className="w-10 text-center">Status</span>
            </div>

            {/* Transaction rows */}
            <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
              <AnimatePresence mode="popLayout">
                {filteredTxns.map((tx, i) => {
                  const StatusIcon = statusIcons[tx.status] || CheckCircle2;
                  return (
                    <motion.div
                      key={tx.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
                      exit={{ opacity: 0, y: -8 }}
                      whileHover={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                      className="flex items-center px-3 py-3 rounded-xl transition-colors cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{tx.name}</p>
                        <p className="text-white/40 text-xs truncate">{tx.target}</p>
                      </div>
                      <div className="w-28 text-right mr-4 shrink-0">
                        <p className={`text-sm font-semibold ${tx.amount >= 0 ? "text-emerald-400" : "text-white"}`}>
                          {tx.amount >= 0 ? "+" : "-"}
                          {tx.currency === "XAU"
                            ? `${Math.abs(tx.amount).toFixed(2)} XAU`
                            : `$${Math.abs(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })} ${tx.currency}`}
                        </p>
                        <p className="text-[10px] text-white/30 mt-0.5">{tx.date}</p>
                      </div>
                      <div className="w-10 flex justify-center shrink-0">
                        <StatusIcon className={`w-5 h-5 ${statusColors[tx.status]}`} />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {filteredTxns.length === 0 && (
                <p className="text-center text-white/20 text-xs py-6">No transactions found</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ─── Quick Actions ─── */}
      <motion.div variants={item}>
        <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.25 + i * 0.06 } }}
              >
                <Link href={action.href}>
                  <motion.div
                    whileHover={{ scale: 1.04, y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    className="group relative overflow-hidden rounded-2xl border border-[#D4AF37]/15 bg-linear-to-br from-[#0f1d30] to-[#0a1525] p-6 cursor-pointer transition-all duration-300 hover:border-[#D4AF37]/35 hover:shadow-[0_8px_40px_rgba(212,175,55,0.08)]"
                  >
                    {/* Gold shimmer on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-br from-[#D4AF37]/6 via-transparent to-[#D4AF37]/3" />

                    <div className="relative z-10 flex flex-col items-start gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center group-hover:bg-[#D4AF37]/15 transition-colors">
                        <Icon className="w-5 h-5 text-[#D4AF37]" strokeWidth={2} />
                      </div>
                      <p className="text-white font-bold text-base tracking-tight">{action.label}</p>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ─── Footer ─── */}
      <motion.footer
        variants={item}
        className="pt-8 border-t border-white/4 text-center"
      >
        <div className="flex items-center justify-center gap-6 text-xs text-white/30 mb-3">
          <Link href="/legal" className="hover:text-[#D4AF37] transition-colors">Privacy Policy</Link>
          <Link href="/legal" className="hover:text-[#D4AF37] transition-colors">Terms of Service</Link>
          <Link href="/support" className="hover:text-[#D4AF37] transition-colors">Help Center</Link>
        </div>
        <p className="text-[11px] text-white/20">&copy; {new Date().getFullYear()} Cherokee Bank CNB. All rights reserved.</p>
      </motion.footer>
    </motion.div>
  );
}
