"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/src/hooks/use-auth";
import {
  useDashboard,
  useWallets,
  useTransactions,
} from "@/src/hooks/use-dashboard-data";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  ArrowDownToLine,
  ArrowUpDown,
  CreditCard,
  Wallet,
  TrendingUp,
  Shield,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  EyeOff,
  PiggyBank,
  MoreHorizontal,
  Activity,
  ArrowRight,
  BadgeCheck,
  CircleDot,
} from "lucide-react";

/* ── Animations ── */
const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
};
const fadeIn = {
  hidden: { y: 12, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
};

/* ── Currency formatting ── */
function fmt(v: number | string, currency = "USD") {
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (isNaN(n)) return "$0.00";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `$${n.toFixed(2)}`;
  }
}

/* ── Compact number (e.g. 1.2K) ── */
function fmtCompact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(2);
}

/* ── Client-safe date formatting ── */
function useRelativeDate(dateStr: string | undefined) {
  const [text, setText] = useState("");
  useEffect(() => {
    if (!dateStr) return;
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const mins = Math.floor(diffMs / 60_000);
    const hrs = Math.floor(diffMs / 3_600_000);
    const days = Math.floor(diffMs / 86_400_000);

    if (mins < 1) setText("Just now");
    else if (mins < 60) setText(`${mins}m ago`);
    else if (hrs < 24) setText(`${hrs}h ago`);
    else if (days === 1) setText("Yesterday");
    else if (days < 7) setText(`${days}d ago`);
    else
      setText(
        d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      );
  }, [dateStr]);
  return text;
}

/* ── Greeting (client-only) ── */
function useGreeting() {
  const [g, setG] = useState("Welcome back");
  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setG("Good morning");
    else if (h < 18) setG("Good afternoon");
    else setG("Good evening");
  }, []);
  return g;
}

/* ── Status + type maps ── */
const STATUS: Record<
  string,
  { icon: typeof CheckCircle2; color: string; bg: string; label: string }
> = {
  COMPLETED: {
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/8",
    label: "Completed",
  },
  completed: {
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/8",
    label: "Completed",
  },
  PENDING: {
    icon: Clock,
    color: "text-amber-400",
    bg: "bg-amber-500/8",
    label: "Pending",
  },
  pending: {
    icon: Clock,
    color: "text-amber-400",
    bg: "bg-amber-500/8",
    label: "Pending",
  },
  FAILED: {
    icon: AlertCircle,
    color: "text-red-400",
    bg: "bg-red-500/8",
    label: "Failed",
  },
  failed: {
    icon: AlertCircle,
    color: "text-red-400",
    bg: "bg-red-500/8",
    label: "Failed",
  },
};

const TX_TYPE: Record<
  string,
  { icon: typeof ArrowUpRight; color: string; label: string }
> = {
  TRANSFER: { icon: ArrowUpRight, color: "text-blue-400", label: "Transfer" },
  DEPOSIT: {
    icon: ArrowDownLeft,
    color: "text-emerald-400",
    label: "Deposit",
  },
  WITHDRAW: {
    icon: ArrowUpRight,
    color: "text-orange-400",
    label: "Withdrawal",
  },
  EXCHANGE: { icon: ArrowUpDown, color: "text-violet-400", label: "Exchange" },
  send: { icon: ArrowUpRight, color: "text-blue-400", label: "Sent" },
  receive: { icon: ArrowDownLeft, color: "text-emerald-400", label: "Received" },
  exchange: { icon: ArrowUpDown, color: "text-violet-400", label: "Exchange" },
};

/* ── Quick action config ── */
const ACTIONS = [
  {
    icon: Send,
    label: "Send",
    href: "/dashboard/send",
    color: "text-blue-400",
    bg: "bg-blue-500/8",
  },
  {
    icon: ArrowDownToLine,
    label: "Receive",
    href: "/dashboard/wallets",
    color: "text-emerald-400",
    bg: "bg-emerald-500/8",
  },
  {
    icon: ArrowUpDown,
    label: "Exchange",
    href: "/dashboard/wallets",
    color: "text-violet-400",
    bg: "bg-violet-500/8",
  },
  {
    icon: CreditCard,
    label: "Cards",
    href: "/dashboard/cards",
    color: "text-amber-400",
    bg: "bg-amber-500/8",
  },
  {
    icon: PiggyBank,
    label: "Savings",
    href: "/dashboard/savings",
    color: "text-rose-400",
    bg: "bg-rose-500/8",
  },
  {
    icon: TrendingUp,
    label: "Invest",
    href: "/dashboard/crypto",
    color: "text-cyan-400",
    bg: "bg-cyan-500/8",
  },
];

/* ── Currency icons (no emojis) ── */
const CURRENCY_ICON: Record<string, string> = {
  USD: "US",
  EUR: "EU",
  GBP: "GB",
  CAD: "CA",
  NGN: "NG",
  BTC: "BT",
  ETH: "ET",
  CHERO: "CG",
};

const CURRENCY_COLOR: Record<string, string> = {
  USD: "#3B82F6",
  EUR: "#8B5CF6",
  GBP: "#10B981",
  CAD: "#F59E0B",
  NGN: "#06B6D4",
  BTC: "#F97316",
  ETH: "#6366F1",
  CHERO: "#C4A962",
};

/* ═══════════════════════════════════════════════════
   Transaction Row
   ═══════════════════════════════════════════════════ */
function TxRow({ tx, idx }: { tx: any; idx: number }) {
  const status = STATUS[tx.status] ?? STATUS.PENDING;
  const type = TX_TYPE[tx.type] ?? TX_TYPE.TRANSFER;
  const TypeIcon = type.icon;
  const amount =
    typeof tx.amount === "string" ? parseFloat(tx.amount) : tx.amount;
  const isCredit = tx.type === "receive" || tx.type === "DEPOSIT";
  const dateText = useRelativeDate(tx.createdAt || tx.timestamp);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.025 } }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-3.5 py-3 px-1 border-b border-white/[0.03] last:border-0 group"
    >
      {/* Icon */}
      <div
        className={`w-9 h-9 rounded-lg ${status.bg} flex items-center justify-center shrink-0`}
      >
        <TypeIcon className={`w-4 h-4 ${type.color}`} strokeWidth={1.8} />
      </div>

      {/* Description */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-white/90 leading-tight truncate">
          {tx.description || type.label}
        </p>
        <p className="text-[11px] text-white/25 mt-0.5" suppressHydrationWarning>
          {dateText || "\u2014"}
        </p>
      </div>

      {/* Amount */}
      <div className="text-right shrink-0">
        <p
          className={`text-[13px] font-semibold tabular-nums leading-tight ${isCredit ? "text-emerald-400" : "text-white/80"
            }`}
        >
          {isCredit ? "+" : "\u2212"}
          {fmt(Math.abs(amount || 0), tx.currency)}
        </p>
        <p
          className={`text-[10px] mt-0.5 font-medium ${status.color} opacity-60`}
        >
          {status.label}
        </p>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════
   Stat Card
   ═══════════════════════════════════════════════════ */
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accentColor = "text-white/30",
  loading = false,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: typeof Wallet;
  accentColor?: string;
  loading?: boolean;
}) {
  return (
    <motion.div variants={fadeIn}>
      <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-5 h-full">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-medium text-white/35 uppercase tracking-wider">
            {label}
          </span>
          <Icon className={`w-4 h-4 ${accentColor}`} strokeWidth={1.6} />
        </div>
        {loading ? (
          <div className="h-7 w-28 bg-white/[0.04] rounded-md animate-pulse" />
        ) : (
          <>
            <p className="text-xl font-semibold text-white tracking-tight leading-none">
              {value}
            </p>
            {sub && (
              <p className="text-[11px] text-white/20 mt-1.5">{sub}</p>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN DASHBOARD
   ═══════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { user } = useAuth();
  const { data: dashData, loading: dashLoading } = useDashboard();
  const { data: walletsData, loading: walletsLoading } = useWallets();
  const { data: txData, loading: txLoading } = useTransactions(8);

  const [balanceHidden, setBalanceHidden] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const greeting = useGreeting();

  /* Parse API responses */
  const stats = (dashData as any)?.stats || dashData || {};
  const totalBalance = parseFloat(stats.totalBalance) || 0;
  const wallets = Array.isArray(walletsData)
    ? walletsData
    : (walletsData as any)?.wallets || [];
  const rawTxns = Array.isArray(txData)
    ? txData
    : (txData as any)?.transactions || [];
  const filteredTxns = rawTxns.filter(
    (tx: any) =>
      !searchQuery ||
      (tx.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLoading = dashLoading || walletsLoading;

  /* Derived stats */
  const sentTotal = rawTxns
    .filter(
      (tx: any) =>
        tx.type === "TRANSFER" || tx.type === "send" || tx.type === "WITHDRAW"
    )
    .reduce(
      (s: number, tx: any) => s + Math.abs(parseFloat(tx.amount) || 0),
      0
    );
  const receivedTotal = rawTxns
    .filter((tx: any) => tx.type === "receive" || tx.type === "DEPOSIT")
    .reduce((s: number, tx: any) => s + (parseFloat(tx.amount) || 0), 0);

  const walletCount = stats.walletCount || wallets.length || 0;
  const txCount = stats.transactionCount || 0;

  return (
    <motion.div
      className="max-w-[1360px] mx-auto space-y-8 pb-16"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* ─────────────────────────────────────────────
          HEADER
          ───────────────────────────────────────────── */}
      <motion.div variants={fadeIn} className="flex items-end justify-between">
        <div>
          <p
            className="text-[13px] text-white/30 font-medium mb-1"
            suppressHydrationWarning
          >
            {greeting}
          </p>
          <h1 className="text-[22px] font-semibold text-white tracking-tight leading-tight">
            {user?.firstName || "Welcome"} {user?.lastName || ""}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* KYC badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02]">
            {stats.kycStatus === "APPROVED" ? (
              <>
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-medium text-emerald-400">
                  Verified
                </span>
              </>
            ) : (
              <>
                <Shield className="w-3.5 h-3.5 text-amber-400/70" />
                <span className="text-[11px] font-medium text-amber-400/70">
                  Pending Verification
                </span>
              </>
            )}
          </div>

          {/* Account status */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02]">
            <CircleDot
              className={`w-3 h-3 ${stats.accountStatus === "ACTIVE"
                ? "text-emerald-400"
                : "text-amber-400/70"
                }`}
            />
            <span className="text-[11px] font-medium text-white/40">
              {stats.accountStatus === "ACTIVE" ? "Active" : "Pending"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ─────────────────────────────────────────────
          BALANCE BAR
          ───────────────────────────────────────────── */}
      <motion.div variants={fadeIn}>
        <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Wallet
                  className="w-3.5 h-3.5 text-white/25"
                  strokeWidth={1.6}
                />
                <span className="text-[11px] font-medium text-white/30 uppercase tracking-wider">
                  Total Balance
                </span>
              </div>
              <div className="flex items-baseline gap-4">
                {isLoading ? (
                  <div className="h-9 w-48 bg-white/[0.04] rounded-lg animate-pulse" />
                ) : (
                  <h2 className="text-[2.25rem] font-semibold text-white tracking-tight leading-none tabular-nums">
                    {balanceHidden ? "\u2022\u2022\u2022\u2022\u2022\u2022" : fmt(totalBalance)}
                  </h2>
                )}
                <button
                  onClick={() => setBalanceHidden((b) => !b)}
                  className="p-1 rounded-md hover:bg-white/[0.04] transition-colors"
                >
                  {balanceHidden ? (
                    <EyeOff className="w-4 h-4 text-white/20" />
                  ) : (
                    <Eye className="w-4 h-4 text-white/20" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-white/20 mt-2">
                {walletCount} account{walletCount !== 1 ? "s" : ""} &middot;{" "}
                {txCount} transaction{txCount !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Quick actions — inline on desktop */}
            <div className="hidden lg:flex items-center gap-2">
              {ACTIONS.slice(0, 4).map((a) => {
                const Icon = a.icon;
                return (
                  <Link key={a.label} href={a.href}>
                    <motion.button
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                    >
                      <Icon
                        className={`w-3.5 h-3.5 ${a.color}`}
                        strokeWidth={1.8}
                      />
                      <span className="text-[12px] font-medium text-white/50">
                        {a.label}
                      </span>
                    </motion.button>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─────────────────────────────────────────────
          STAT CARDS
          ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Accounts"
          value={walletCount.toString()}
          sub={`${wallets.filter((w: any) => w.status === "ACTIVE").length} active`}
          icon={Wallet}
          accentColor="text-blue-400/50"
          loading={isLoading}
        />
        <StatCard
          label="Total Sent"
          value={balanceHidden ? "\u2022\u2022\u2022\u2022" : fmt(sentTotal)}
          sub={`${rawTxns.filter((t: any) => t.type === "TRANSFER" || t.type === "send").length} transfers`}
          icon={ArrowUpRight}
          accentColor="text-orange-400/50"
          loading={txLoading}
        />
        <StatCard
          label="Total Received"
          value={balanceHidden ? "\u2022\u2022\u2022\u2022" : fmt(receivedTotal)}
          sub={`${rawTxns.filter((t: any) => t.type === "receive" || t.type === "DEPOSIT").length} deposits`}
          icon={ArrowDownLeft}
          accentColor="text-emerald-400/50"
          loading={txLoading}
        />
        <StatCard
          label="Transactions"
          value={txCount.toString()}
          sub="All time"
          icon={Activity}
          accentColor="text-violet-400/50"
          loading={isLoading}
        />
      </div>

      {/* ─────────────────────────────────────────────
          QUICK ACTIONS — mobile grid
          ───────────────────────────────────────────── */}
      <motion.div variants={fadeIn} className="lg:hidden">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          {ACTIONS.map((a, i) => {
            const Icon = a.icon;
            return (
              <Link key={a.label} href={a.href}>
                <motion.div
                  whileTap={{ scale: 0.96 }}
                  className="flex flex-col items-center gap-2 py-3 rounded-lg border border-white/[0.04] bg-white/[0.015] hover:bg-white/[0.03] transition-colors cursor-pointer"
                >
                  <div
                    className={`w-8 h-8 rounded-lg ${a.bg} flex items-center justify-center`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 ${a.color}`}
                      strokeWidth={1.8}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-white/40">
                    {a.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* ─────────────────────────────────────────────
          MAIN CONTENT: Transactions + Sidebar
          ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Transactions */}
        <motion.div variants={fadeIn} className="lg:col-span-8">
          <div className="rounded-xl border border-white/[0.04] bg-white/[0.015]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-[14px] font-semibold text-white/80">
                  Recent Activity
                </h3>
                {rawTxns.length > 0 && (
                  <span className="text-[10px] font-medium text-white/20 bg-white/[0.04] px-1.5 py-0.5 rounded">
                    {rawTxns.length}
                  </span>
                )}
              </div>
              <Link
                href="/dashboard/transactions"
                className="flex items-center gap-1 text-[11px] text-white/30 hover:text-white/50 transition-colors font-medium"
              >
                View all
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Search */}
            <div className="px-5 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/15" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-9 pr-4 rounded-lg bg-white/[0.03] border border-white/[0.04] text-[12px] text-white/70 placeholder:text-white/15 focus:outline-none focus:border-white/10 transition-colors"
                />
              </div>
            </div>

            {/* List */}
            <div className="px-5 pb-5">
              {txLoading ? (
                <div className="space-y-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-[52px] bg-white/[0.02] rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredTxns.length > 0 ? (
                    filteredTxns.map((tx: any, i: number) => (
                      <TxRow key={tx.id} tx={tx} idx={i} />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16">
                      <Activity className="w-8 h-8 text-white/[0.06] mb-3" />
                      <p className="text-[13px] font-medium text-white/20 mb-1">
                        {searchQuery
                          ? "No matching transactions"
                          : "No transactions yet"}
                      </p>
                      <p className="text-[11px] text-white/10">
                        {searchQuery
                          ? "Try a different search term"
                          : "Your activity will appear here"}
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Right Sidebar ── */}
        <motion.div variants={fadeIn} className="lg:col-span-4 space-y-6">
          {/* Accounts */}
          <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[13px] font-semibold text-white/60">
                Accounts
              </h3>
              <Link
                href="/dashboard/wallets"
                className="text-[11px] text-white/25 hover:text-white/40 transition-colors font-medium"
              >
                Manage
              </Link>
            </div>

            {walletsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-11 bg-white/[0.03] rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : wallets.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="w-6 h-6 text-white/[0.06] mx-auto mb-2.5" />
                <p className="text-[12px] text-white/20 mb-2">
                  No accounts created
                </p>
                <Link
                  href="/dashboard/wallets"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-[#C4A962] hover:text-[#C4A962]/80 transition-colors"
                >
                  Open an account
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {wallets.slice(0, 5).map((w: any) => {
                  const balance =
                    parseFloat(w.balance) ||
                    parseFloat(w.availableBalance) ||
                    0;
                  const abbr = CURRENCY_ICON[w.currency] || w.currency?.slice(0, 2);
                  const color = CURRENCY_COLOR[w.currency] || "#6B7280";

                  return (
                    <div
                      key={w.id}
                      className="flex items-center justify-between py-2.5 px-2 -mx-2 rounded-lg hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold tracking-wider"
                          style={{
                            backgroundColor: `${color}12`,
                            color: color,
                          }}
                        >
                          {abbr}
                        </div>
                        <div>
                          <p className="text-[12px] font-medium text-white/70 leading-tight">
                            {w.currency}
                          </p>
                          <p className="text-[10px] text-white/20 leading-tight mt-0.5">
                            {w.status === "ACTIVE" ? "Active" : w.status}
                          </p>
                        </div>
                      </div>
                      <p className="text-[12px] font-semibold text-white/60 tabular-nums">
                        {balanceHidden
                          ? "\u2022\u2022\u2022\u2022"
                          : fmt(balance, w.currency)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Insights */}
          <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-5">
            <h3 className="text-[13px] font-semibold text-white/60 mb-5">
              Overview
            </h3>
            <div className="space-y-4">
              {[
                {
                  label: "Outgoing",
                  value: balanceHidden ? "\u2022\u2022\u2022\u2022" : fmt(sentTotal),
                  count: rawTxns.filter(
                    (t: any) => t.type === "TRANSFER" || t.type === "send"
                  ).length,
                  icon: Send,
                  color: "text-blue-400/60",
                  bg: "bg-blue-500/6",
                },
                {
                  label: "Incoming",
                  value: balanceHidden ? "\u2022\u2022\u2022\u2022" : fmt(receivedTotal),
                  count: rawTxns.filter(
                    (t: any) => t.type === "receive" || t.type === "DEPOSIT"
                  ).length,
                  icon: ArrowDownToLine,
                  color: "text-emerald-400/60",
                  bg: "bg-emerald-500/6",
                },
                {
                  label: "Verification",
                  value:
                    stats.kycStatus === "APPROVED"
                      ? "Verified"
                      : stats.kycStatus === "PENDING" || stats.kycStatus === "UNDER_REVIEW"
                        ? "Under Review"
                        : "Not Submitted",
                  count: null,
                  icon: Shield,
                  color: "text-amber-400/60",
                  bg: "bg-amber-500/6",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}
                    >
                      <Icon
                        className={`w-3.5 h-3.5 ${item.color}`}
                        strokeWidth={1.6}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-white/30 font-medium leading-tight">
                        {item.label}
                      </p>
                      <p className="text-[13px] font-semibold text-white/70 leading-tight mt-0.5">
                        {item.value}
                      </p>
                    </div>
                    {item.count !== null && (
                      <span className="text-[10px] text-white/15 font-medium">
                        {item.count}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div >
  );
}
