"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/src/hooks/use-auth";
import { useDashboard, useWallets, useTransactions, useTransactionStats } from "@/src/hooks/use-dashboard-data";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, ArrowDownToLine, ArrowUpDown, CreditCard, Wallet, TrendingUp,
  Shield, Search, CheckCircle2, Clock, AlertCircle, ChevronRight,
  ArrowUpRight, ArrowDownLeft, Eye, EyeOff, Sparkles, PiggyBank,
} from "lucide-react";

/* ── Animation variants ── */
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};
const fadeUp = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 280, damping: 26 } },
};

/* ── Quick actions ── */
const quickActions = [
  { icon: Send, label: "Send", href: "/dashboard/send", color: "from-blue-500/20 to-blue-600/10", iconColor: "text-blue-400" },
  { icon: ArrowDownToLine, label: "Receive", href: "/dashboard/wallets", color: "from-emerald-500/20 to-emerald-600/10", iconColor: "text-emerald-400" },
  { icon: ArrowUpDown, label: "Exchange", href: "/dashboard/wallets", color: "from-purple-500/20 to-purple-600/10", iconColor: "text-purple-400" },
  { icon: CreditCard, label: "Cards", href: "/dashboard/cards", color: "from-amber-500/20 to-amber-600/10", iconColor: "text-amber-400" },
  { icon: PiggyBank, label: "Savings", href: "/dashboard/savings", color: "from-pink-500/20 to-pink-600/10", iconColor: "text-pink-400" },
  { icon: TrendingUp, label: "Invest", href: "/dashboard/crypto", color: "from-cyan-500/20 to-cyan-600/10", iconColor: "text-cyan-400" },
];

const statusConfig = {
  completed: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  COMPLETED: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  pending: { icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
  PENDING: { icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
  failed: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10" },
  FAILED: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10" },
};

const txTypeConfig: Record<string, { icon: typeof ArrowUpRight; color: string; label: string }> = {
  TRANSFER: { icon: ArrowUpRight, color: "text-blue-400", label: "Transfer" },
  DEPOSIT: { icon: ArrowDownLeft, color: "text-emerald-400", label: "Deposit" },
  WITHDRAW: { icon: ArrowUpRight, color: "text-orange-400", label: "Withdrawal" },
  EXCHANGE: { icon: ArrowUpDown, color: "text-purple-400", label: "Exchange" },
  send: { icon: ArrowUpRight, color: "text-blue-400", label: "Sent" },
  receive: { icon: ArrowDownLeft, color: "text-emerald-400", label: "Received" },
  exchange: { icon: ArrowUpDown, color: "text-purple-400", label: "Exchange" },
};

/* ── Format currency ── */
function fmtCurrency(v: number | string, currency = "USD") {
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (isNaN(n)) return "$0.00";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2 }).format(n);
  } catch {
    return `$${n.toFixed(2)}`;
  }
}

/* ── Format date safely (client-only to avoid hydration mismatch) ── */
function useClientDate(dateStr: string | undefined) {
  const [formatted, setFormatted] = useState("");
  useEffect(() => {
    if (!dateStr) return;
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) {
      setFormatted(`Today, ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`);
    } else if (days === 1) {
      setFormatted(`Yesterday, ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`);
    } else {
      setFormatted(d.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
    }
  }, [dateStr]);
  return formatted;
}

/* ── Greeting ── */
function useGreeting() {
  const [greeting, setGreeting] = useState("Welcome");
  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good morning");
    else if (h < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);
  return greeting;
}

/* ── Transaction row component ── */
function TxRow({ tx, i }: { tx: any; i: number }) {
  const status = statusConfig[tx.status as keyof typeof statusConfig] || statusConfig.pending;
  const txType = txTypeConfig[tx.type] || txTypeConfig.TRANSFER;
  const StatusIcon = status.icon;
  const TypeIcon = txType.icon;
  const amount = typeof tx.amount === "string" ? parseFloat(tx.amount) : tx.amount;
  const isReceive = tx.type === "receive" || tx.type === "DEPOSIT";
  const dateFormatted = useClientDate(tx.createdAt || tx.timestamp);

  return (
    <motion.div
      key={tx.id} layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0, transition: { delay: i * 0.03 } }}
      exit={{ opacity: 0, y: -6 }}
      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer group"
    >
      <div className={`w-9 h-9 rounded-xl ${status.bg} flex items-center justify-center shrink-0`}>
        <TypeIcon className={`w-4 h-4 ${txType.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{tx.description || txType.label}</p>
        <p className="text-[11px] text-white/30">{dateFormatted || "—"}</p>
      </div>
      <div className="text-right shrink-0">
        <p className={`text-sm font-bold tabular-nums ${isReceive ? "text-emerald-400" : "text-white"}`}>
          {isReceive ? "+" : "-"}{fmtCurrency(Math.abs(amount), tx.currency)}
        </p>
        <div className="flex items-center gap-1 justify-end mt-0.5">
          <StatusIcon className={`w-3 h-3 ${status.color}`} />
          <span className={`text-[10px] font-medium capitalize ${status.color}`}>{tx.status?.toLowerCase()}</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { user } = useAuth();
  const { data: dashData, loading: dashLoading } = useDashboard();
  const { data: walletsData, loading: walletsLoading } = useWallets();
  const { data: txData, loading: txLoading } = useTransactions(6);

  const [balanceHidden, setBalanceHidden] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const greeting = useGreeting();

  // Parse dashboard stats
  const stats = (dashData as any)?.stats || dashData || {};
  const totalBalance = parseFloat(stats.totalBalance) || 0;

  // Parse wallets
  const wallets = Array.isArray(walletsData) ? walletsData : (walletsData as any)?.wallets || [];

  // Parse transactions — handle both array and { transactions: [] }
  const rawTxns = Array.isArray(txData) ? txData : (txData as any)?.transactions || [];
  const filteredTxns = rawTxns.filter((tx: any) =>
    !searchQuery || (tx.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLoading = dashLoading || walletsLoading;

  // Calculate sent/received totals from real data
  const sentTotal = rawTxns
    .filter((tx: any) => tx.type === "TRANSFER" || tx.type === "send" || tx.type === "WITHDRAW")
    .reduce((sum: number, tx: any) => sum + Math.abs(parseFloat(tx.amount) || 0), 0);
  const receivedTotal = rawTxns
    .filter((tx: any) => tx.type === "receive" || tx.type === "DEPOSIT")
    .reduce((sum: number, tx: any) => sum + (parseFloat(tx.amount) || 0), 0);

  return (
    <motion.div
      className="max-w-[1400px] mx-auto space-y-6 pb-12"
      variants={stagger} initial="hidden" animate="show"
    >
      {/* ─── Row 1: Greeting + Badge ─── */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight" suppressHydrationWarning>
            {greeting}, {user?.firstName || "there"} 👋
          </h1>
          <p className="text-sm text-white/40 mt-0.5">
            Here&apos;s what&apos;s happening with your accounts today.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-xl bg-emerald-500/8 border border-emerald-500/15">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-400">
            {stats.accountStatus === "ACTIVE" ? "All Systems Secure" : "Account Pending"}
          </span>
        </div>
      </motion.div>

      {/* ─── Row 2: Balance Hero + Wallet Breakdown ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Balance Card */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <div className="relative overflow-hidden rounded-2xl border border-white/6 bg-gradient-to-br from-[#0d1a30] via-[#0a1628] to-[#071020] p-7">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4.5 h-4.5 text-white/40" />
                  <span className="text-sm font-medium text-white/50 tracking-wide">Total Portfolio</span>
                </div>
                <button onClick={() => setBalanceHidden(!balanceHidden)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                  {balanceHidden ? <EyeOff className="w-4 h-4 text-white/30" /> : <Eye className="w-4 h-4 text-white/30" />}
                </button>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-[2.75rem] font-extrabold text-white leading-none tracking-tight">
                    {isLoading ? (
                      <span className="inline-block w-64 h-12 bg-white/5 rounded-xl animate-pulse" />
                    ) : balanceHidden ? "••••••••" : fmtCurrency(totalBalance)}
                  </h2>
                  <div className="flex items-center gap-2 mt-2.5">
                    <span className="text-xs text-white/30">
                      {stats.walletCount || wallets.length || 0} wallet{(stats.walletCount || wallets.length || 0) !== 1 ? "s" : ""} · {stats.transactionCount || 0} transactions
                    </span>
                  </div>
                </div>

                {/* KYC Badge */}
                <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#D4AF37]/8 border border-[#D4AF37]/15">
                  <Shield className="w-4 h-4 text-[#D4AF37]" />
                  <div>
                    <p className="text-[#D4AF37] font-semibold text-[11px] leading-tight">
                      {stats.kycStatus === "APPROVED" ? "Verified" : "KYC Pending"}
                    </p>
                    <p className="text-[#D4AF37]/50 text-[10px] leading-tight">
                      {stats.kycStatus === "APPROVED" ? "Full Access" : "Limited Access"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Wallet Breakdown */}
        <motion.div variants={fadeUp}>
          <div className="rounded-2xl border border-white/6 bg-[#0a1628]/80 backdrop-blur-xl p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white/70">Accounts</h3>
              <Link href="/dashboard/wallets" className="text-xs text-[#D4AF37] hover:text-[#D4AF37]/80 transition-colors font-medium">
                View All
              </Link>
            </div>

            {walletsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : wallets.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="w-8 h-8 text-white/10 mx-auto mb-2" />
                <p className="text-xs text-white/20">No accounts yet</p>
                <Link href="/dashboard/wallets" className="text-xs text-[#D4AF37] font-semibold mt-2 inline-block">
                  Create Account →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {wallets.slice(0, 4).map((w: any) => {
                  const balance = parseFloat(w.balance) || parseFloat(w.availableBalance) || 0;
                  const currencyFlags: Record<string, string> = { USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", CAD: "🇨🇦" };
                  return (
                    <div key={w.id} className="flex items-center justify-between group cursor-pointer hover:bg-white/3 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{currencyFlags[w.currency] || "💰"}</span>
                        <div>
                          <p className="text-sm font-medium text-white">{w.currency}</p>
                          <p className="text-[10px] text-white/25">{w.status === "ACTIVE" ? "Active" : w.status}</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-white/80 tabular-nums">
                        {balanceHidden ? "••••" : fmtCurrency(balance, w.currency)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ─── Row 3: Quick Actions ─── */}
      <motion.div variants={fadeUp}>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.div key={action.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 + i * 0.04 } }}>
                <Link href={action.href}>
                  <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                    className="group flex flex-col items-center gap-2.5 py-4 px-3 rounded-2xl border border-white/5 hover:border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                      <Icon className={`w-4.5 h-4.5 ${action.iconColor}`} strokeWidth={2} />
                    </div>
                    <span className="text-xs font-semibold text-white/60 group-hover:text-white/80 transition-colors">{action.label}</span>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ─── Row 4: Transactions ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <div className="rounded-2xl border border-white/6 bg-[#0a1628]/80 backdrop-blur-xl">
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <h3 className="text-base font-bold text-white">Recent Transactions</h3>
              <Link href="/dashboard/transactions" className="flex items-center gap-1 text-xs text-[#D4AF37] hover:text-[#D4AF37]/80 transition-colors font-medium">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="px-6 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                <input type="text" placeholder="Search transactions..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-4 rounded-xl bg-white/4 border border-white/6 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-[#D4AF37]/25 transition-colors"
                />
              </div>
            </div>

            <div className="px-3 pb-4">
              {txLoading ? (
                <div className="space-y-2 px-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredTxns.length > 0 ? (
                    filteredTxns.map((tx: any, i: number) => <TxRow key={tx.id} tx={tx} i={i} />)
                  ) : (
                    <div className="text-center py-10">
                      <Search className="w-6 h-6 text-white/10 mx-auto mb-2" />
                      <p className="text-xs text-white/20">
                        {searchQuery ? `No results for "${searchQuery}"` : "No transactions yet"}
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </div>
        </motion.div>

        {/* Account Insights */}
        <motion.div variants={fadeUp}>
          <div className="rounded-2xl border border-white/6 bg-[#0a1628]/80 backdrop-blur-xl p-5 h-full flex flex-col">
            <h3 className="text-sm font-semibold text-white/70 mb-5">Account Insights</h3>
            <div className="space-y-5 flex-1">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Send className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-[11px] text-white/40 uppercase tracking-wider font-medium mb-0.5">Total Sent</p>
                  <p className="text-lg font-bold text-white">{balanceHidden ? "••••" : fmtCurrency(sentTotal)}</p>
                  <p className="text-[10px] text-white/25 mt-0.5">{rawTxns.filter((t: any) => t.type === "TRANSFER" || t.type === "send").length} transactions</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <ArrowDownToLine className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[11px] text-white/40 uppercase tracking-wider font-medium mb-0.5">Total Received</p>
                  <p className="text-lg font-bold text-white">{balanceHidden ? "••••" : fmtCurrency(receivedTotal)}</p>
                  <p className="text-[10px] text-white/25 mt-0.5">{rawTxns.filter((t: any) => t.type === "receive" || t.type === "DEPOSIT").length} transactions</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-[11px] text-white/40 uppercase tracking-wider font-medium mb-0.5">KYC Status</p>
                  <p className="text-lg font-bold text-white">
                    {stats.kycStatus === "APPROVED" ? "Verified ✓" : stats.kycStatus || "Pending"}
                  </p>
                  <p className="text-[10px] text-white/25 mt-0.5">
                    {stats.kycStatus === "APPROVED" ? "Full account access" : "Complete KYC for full access"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ─── Footer ─── */}
      <motion.footer variants={fadeUp} className="pt-6 border-t border-white/4 text-center">
        <div className="flex items-center justify-center gap-6 text-[11px] text-white/20 mb-2">
          <Link href="/legal" className="hover:text-[#D4AF37] transition-colors">Privacy Policy</Link>
          <Link href="/legal" className="hover:text-[#D4AF37] transition-colors">Terms of Service</Link>
          <Link href="/support" className="hover:text-[#D4AF37] transition-colors">Help Center</Link>
        </div>
        <p className="text-[10px] text-white/15">&copy; {new Date().getFullYear()} Cherokee Bank CNB. All rights reserved.</p>
      </motion.footer>
    </motion.div>
  );
}
