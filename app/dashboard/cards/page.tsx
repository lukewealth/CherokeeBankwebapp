"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, Plus, Snowflake, X, Wifi, Shield, Zap,
  ShoppingBag, Plane, Monitor, Sparkles, Lock, Eye, EyeOff,
  ChevronDown, ToggleLeft, ToggleRight, AlertCircle,
} from "lucide-react";
import { useAuth } from "@/src/hooks/use-auth";
import {
  useVirtualCards,
  useCreateCard,
  useToggleFreezeCard,
} from "@/src/hooks/use-dashboard-data";

/* ─── Animation variants ─── */
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const item = {
  hidden: { y: 24, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 260, damping: 24 } },
};

/* ─── Currency config ─── */
const CURRENCIES = [
  { code: "USD", label: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", label: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", label: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "CHERO", label: "$Chero", symbol: "₵", flag: "🪙" },
];

/* ─── Mock analytics data (matched to design) ─── */
const spendingCategories = [
  { name: "Crypto Trading", pct: 45, color: "#D4AF37" },
  { name: "Cloud Services", pct: 25, color: "#3B82F6" },
  { name: "Travel & Entertainment", pct: 15, color: "#10B981" },
  { name: "Online Shopping", pct: 15, color: "#A855F7" },
];

const merchantLimits = [
  { name: "AWS Cloud", icon: Monitor, spent: 5000, limit: 10000, color: "#3B82F6" },
  { name: "OpenAI API", icon: Sparkles, spent: 2500, limit: 5000, color: "#10B981" },
  { name: "Travel Portal", icon: Plane, spent: 1200, limit: 3000, color: "#D4AF37" },
  { name: "Luxury Retail", icon: ShoppingBag, spent: 800, limit: 2000, color: "#A855F7" },
];

/* ─── Mock cards for initial display ─── */
const MOCK_CARDS = [
  {
    id: "mock-1",
    cardName: "Primary $Chero Card",
    last4: "1234",
    expiryMonth: 12,
    expiryYear: 28,
    currency: "CHERO",
    spendingLimit: "25000",
    currentSpend: "12450",
    cardType: "VIRTUAL",
    cardUsage: "MULTI_USE",
    status: "ACTIVE",
    isFrozen: false,
  },
  {
    id: "mock-2",
    cardName: "Gold Premium Card",
    last4: "5678",
    expiryMonth: 9,
    expiryYear: 26,
    currency: "USD",
    spendingLimit: "10000",
    currentSpend: "3200",
    cardType: "VIRTUAL",
    cardUsage: "MULTI_USE",
    status: "FROZEN",
    isFrozen: true,
  },
];

/* ─── SVG Donut Chart ─── */
function DonutChart({ categories, total }: { categories: typeof spendingCategories; total: string }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90">
        {categories.map((cat, i) => {
          const dash = (cat.pct / 100) * circumference;
          const gap = circumference - dash;
          const segment = (
            <circle
              key={i}
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              stroke={cat.color}
              strokeWidth="18"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          );
          offset += dash;
          return segment;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-2xl font-bold text-white">{total}</p>
        <p className="text-xs text-white/40">Total Spend</p>
      </div>
    </div>
  );
}

/* ─── Card Visual Component ─── */
function CardVisual({
  cardName,
  last4,
  expiryMonth,
  expiryYear,
  currency,
  isFrozen,
  isChero,
  compact = false,
}: {
  cardName: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  currency: string;
  isFrozen: boolean;
  isChero?: boolean;
  compact?: boolean;
}) {
  const bgClass = isChero
    ? "bg-linear-to-br from-[#0a1628] via-[#0d2040] to-[#061020]"
    : "bg-linear-to-br from-[#D4AF37]/30 via-[#D4AF37]/15 to-[#D4AF37]/5";

  const expStr = `${String(expiryMonth).padStart(2, "0")}/${String(expiryYear).slice(-2)}`;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${
        isFrozen ? "border-blue-400/30" : isChero ? "border-[#D4AF37]/20" : "border-[#D4AF37]/25"
      } ${bgClass} ${compact ? "p-5" : "p-6"} ${isFrozen ? "opacity-75" : ""}`}
    >
      {/* Frozen overlay */}
      {isFrozen && (
        <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-[1px] z-10 flex items-center justify-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30">
            <Snowflake className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 text-xs font-medium">Frozen</span>
          </div>
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Shield className={`w-4 h-4 ${isChero ? "text-[#D4AF37]" : "text-[#D4AF37]"}`} />
          <span className="text-white/70 text-xs font-medium tracking-wide">Cherokee Bank CNB</span>
        </div>
        <Wifi className="w-5 h-5 text-white/30 rotate-90" />
      </div>

      {/* Chip + contactless */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-7 rounded-md bg-linear-to-br from-[#D4AF37]/60 to-[#D4AF37]/30 border border-[#D4AF37]/20" />
      </div>

      {/* Card number */}
      <div className="mb-4">
        <p className={`font-mono tracking-[0.2em] ${compact ? "text-base" : "text-lg"} text-white/90`}>
          •••• •••• •••• {last4}
        </p>
      </div>

      {/* Bottom row */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Card Holder</p>
          <p className="text-white text-sm font-medium truncate max-w-32">{cardName || "YOUR NAME"}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Expires</p>
          <p className="text-white text-sm font-medium">{expStr}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">CVV</p>
          <p className="text-white text-sm font-medium">•••</p>
        </div>
      </div>

      {/* Currency badge */}
      <div className="absolute top-5 right-14">
        <span className="text-xs font-bold text-[#D4AF37]/60">{currency}</span>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════ */
/* ─── Card Generator Modal ─── */
/* ═════════════════════════════════════════════════════════════════ */
function CardGeneratorModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { user } = useAuth();
  const { mutate: createCard, loading: creating } = useCreateCard();

  const [cardName, setCardName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [spendingLimit, setSpendingLimit] = useState(5000);
  const [cardUsage, setCardUsage] = useState<"SINGLE_USE" | "MULTI_USE">("MULTI_USE");
  const [error, setError] = useState("");
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  const selectedCurrency = CURRENCIES.find((c) => c.code === currency)!;

  const now = new Date();
  const previewExpMonth = now.getMonth() + 1;
  const previewExpYear = now.getFullYear() + 3;

  async function handleGenerate() {
    setError("");
    if (!cardName.trim()) {
      setError("Please enter a card name");
      return;
    }

    try {
      await createCard({
        cardName: cardName.trim(),
        currency,
        spendingLimit,
        cardUsage,
      });
      // Reset form
      setCardName("");
      setCurrency("USD");
      setSpendingLimit(5000);
      setCardUsage("MULTI_USE");
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to generate card");
    }
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 30 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="relative w-full max-w-3xl bg-[#0a1628] border border-white/8 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <h2 className="text-xl font-bold text-white">Virtual Card Generator</h2>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            {/* Body */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
              {/* Left - Live Card Preview */}
              <div>
                <p className="text-sm text-white/40 font-medium mb-4">Live Card Preview</p>
                <CardVisual
                  cardName={cardName || (user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "YOUR NAME")}
                  last4="••••"
                  expiryMonth={previewExpMonth}
                  expiryYear={previewExpYear}
                  currency={currency}
                  isFrozen={false}
                  isChero={currency === "CHERO"}
                />
                <p className="text-[11px] text-white/20 mt-4 leading-relaxed">
                  Funds will be deducted from your primary Cherokee Bank CNB account.{" "}
                  <span className="text-[#D4AF37]/40">Terms & Conditions</span> apply.
                </p>
              </div>

              {/* Right - Form */}
              <div className="space-y-5">
                {/* Card Name */}
                <div>
                  <label className="text-sm text-white/50 font-medium mb-2 block">Card Name</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="e.g. Shopping Card"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#D4AF37]/30 transition-colors"
                    maxLength={40}
                  />
                </div>

                {/* Currency Selector */}
                <div>
                  <label className="text-sm text-white/50 font-medium mb-2 block">Currency</label>
                  <div className="relative">
                    <button
                      onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-white text-sm hover:border-white/12 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-lg">{selectedCurrency.flag}</span>
                        <span>{selectedCurrency.label}</span>
                        <span className="text-white/30">({selectedCurrency.code})</span>
                      </span>
                      <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${showCurrencyDropdown ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {showCurrencyDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="absolute z-20 top-full mt-1 w-full bg-[#0d1e35] border border-white/10 rounded-xl overflow-hidden shadow-xl"
                        >
                          {CURRENCIES.map((c) => (
                            <button
                              key={c.code}
                              onClick={() => {
                                setCurrency(c.code);
                                setShowCurrencyDropdown(false);
                              }}
                              className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 transition-colors ${
                                currency === c.code ? "bg-[#D4AF37]/10 text-[#D4AF37]" : "text-white"
                              }`}
                            >
                              <span className="text-lg">{c.flag}</span>
                              <span>{c.label}</span>
                              <span className="text-white/30 ml-auto">{c.code}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Spending Limit Slider */}
                <div>
                  <label className="text-sm text-white/50 font-medium mb-2 block">Spending Limit</label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-2xl font-bold">
                        {selectedCurrency.symbol}{spendingLimit.toLocaleString()}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={100}
                      max={100000}
                      step={100}
                      value={spendingLimit}
                      onChange={(e) => setSpendingLimit(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #D4AF37 ${(spendingLimit / 100000) * 100}%, rgba(255,255,255,0.1) ${(spendingLimit / 100000) * 100}%)`,
                      }}
                    />
                    <div className="flex justify-between text-[10px] text-white/25">
                      <span>{selectedCurrency.symbol}100</span>
                      <span>{selectedCurrency.symbol}100,000</span>
                    </div>
                  </div>
                </div>

                {/* Card Usage Toggle */}
                <div>
                  <label className="text-sm text-white/50 font-medium mb-3 block">Card Usage</label>
                  <div className="flex rounded-xl overflow-hidden border border-white/8">
                    <button
                      onClick={() => setCardUsage("SINGLE_USE")}
                      className={`flex-1 py-3 text-sm font-medium transition-all ${
                        cardUsage === "SINGLE_USE"
                          ? "bg-[#D4AF37]/15 text-[#D4AF37] border-r border-[#D4AF37]/20"
                          : "bg-white/3 text-white/40 border-r border-white/8 hover:bg-white/5"
                      }`}
                    >
                      <Zap className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                      Single Use
                    </button>
                    <button
                      onClick={() => setCardUsage("MULTI_USE")}
                      className={`flex-1 py-3 text-sm font-medium transition-all ${
                        cardUsage === "MULTI_USE"
                          ? "bg-[#D4AF37]/15 text-[#D4AF37]"
                          : "bg-white/3 text-white/40 hover:bg-white/5"
                      }`}
                    >
                      <Lock className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                      Multi-Use
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20"
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <p className="text-red-300 text-xs">{error}</p>
                  </motion.div>
                )}

                {/* Generate Button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerate}
                  disabled={creating}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-[#061B3A] transition-all disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg, #D4AF37 0%, #f8e192 50%, #D4AF37 100%)",
                    boxShadow: "0 4px 24px rgba(212, 175, 55, 0.25)",
                  }}
                >
                  {creating ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="inline-block w-4 h-4 border-2 border-[#061B3A]/30 border-t-[#061B3A] rounded-full"
                      />
                      Generating...
                    </span>
                  ) : (
                    "Generate Card"
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═════════════════════════════════════════════════════════════════ */
/* ─── Main Page ─── */
/* ═════════════════════════════════════════════════════════════════ */
export default function VirtualCardsPage() {
  const { data, loading, execute: refetchCards } = useVirtualCards();
  const { mutate: toggleFreeze } = useToggleFreezeCard();
  const [showGenerator, setShowGenerator] = useState(false);
  const [localCards, setLocalCards] = useState<any[]>([]);

  // Merge API cards with mock fallback
  useEffect(() => {
    if (data?.cards && data.cards.length > 0) {
      setLocalCards(data.cards);
    } else if (!loading) {
      setLocalCards(MOCK_CARDS);
    }
  }, [data, loading]);

  const handleToggleFreeze = useCallback(
    async (cardId: string, currentlyFrozen: boolean) => {
      // Optimistic update
      setLocalCards((prev) =>
        prev.map((c) =>
          c.id === cardId
            ? { ...c, isFrozen: !currentlyFrozen, status: !currentlyFrozen ? "FROZEN" : "ACTIVE" }
            : c
        )
      );

      try {
        await toggleFreeze({ id: cardId, frozen: !currentlyFrozen });
      } catch {
        // Revert on failure
        setLocalCards((prev) =>
          prev.map((c) =>
            c.id === cardId
              ? { ...c, isFrozen: currentlyFrozen, status: currentlyFrozen ? "FROZEN" : "ACTIVE" }
              : c
          )
        );
      }
    },
    [toggleFreeze]
  );

  const activeCards = localCards.filter((c) => c.status === "ACTIVE" || c.status === "FROZEN");

  return (
    <>
      <motion.div
        className="max-w-340 mx-auto space-y-8 pb-12"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* ─── Page Header ─── */}
        <motion.div variants={item} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Virtual Cards & Banking</h1>
            <p className="text-white/40 text-sm mt-1">Manage your virtual cards, spending limits, and analytics</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowGenerator(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#D4AF37]/30 text-[#D4AF37] text-sm font-semibold hover:bg-[#D4AF37]/8 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Generate New Card
          </motion.button>
        </motion.div>

        {/* ─── Active Virtual Cards ─── */}
        <motion.div variants={item}>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#D4AF37]" />
            Active Virtual Cards
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeCards.map((card) => (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group"
              >
                <CardVisual
                  cardName={card.cardName}
                  last4={card.last4}
                  expiryMonth={card.expiryMonth}
                  expiryYear={card.expiryYear}
                  currency={card.currency}
                  isFrozen={card.isFrozen}
                  isChero={card.currency === "CHERO"}
                  compact
                />

                {/* Controls overlay */}
                <div className="absolute bottom-4 right-4 z-20 flex items-center gap-3">
                  {/* Freeze toggle */}
                  <button
                    onClick={() => handleToggleFreeze(card.id, card.isFrozen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-colors"
                    title={card.isFrozen ? "Unfreeze card" : "Freeze card"}
                  >
                    {card.isFrozen ? (
                      <>
                        <ToggleRight className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-300 text-[11px] font-medium">Frozen</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-300 text-[11px] font-medium">Active</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Spending progress bar */}
                <div className="mt-3 px-1">
                  <div className="flex items-center justify-between text-[11px] text-white/40 mb-1.5">
                    <span>Spent: ${Number(card.currentSpend).toLocaleString()}</span>
                    <span>Limit: ${Number(card.spendingLimit).toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min((Number(card.currentSpend) / Number(card.spendingLimit)) * 100, 100)}%`,
                      }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{
                        background: "linear-gradient(90deg, #D4AF37, #f8e192)",
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Add New Card Placeholder */}
            <motion.button
              whileHover={{ scale: 1.02, borderColor: "rgba(212,175,55,0.3)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowGenerator(true)}
              className="flex flex-col items-center justify-center gap-3 min-h-56 rounded-2xl border border-dashed border-white/10 bg-white/2 hover:bg-white/4 transition-all cursor-pointer"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/8 border border-[#D4AF37]/15 flex items-center justify-center">
                <Plus className="w-6 h-6 text-[#D4AF37]/60" />
              </div>
              <p className="text-white/30 text-sm font-medium">Generate New Card</p>
            </motion.button>
          </div>
        </motion.div>

        {/* ─── Analytics & Limits ─── */}
        <motion.div variants={item}>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#D4AF37]" />
            Analytics & Limits
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Spending Analytics */}
            <div className="rounded-2xl border border-white/6 bg-[#0a1628]/80 backdrop-blur-xl p-6">
              <h4 className="text-base font-semibold text-white mb-6">Spending Analytics</h4>
              <DonutChart categories={spendingCategories} total="$45,230" />

              {/* Legend */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                {spendingCategories.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-2.5">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <div className="min-w-0">
                      <p className="text-white/70 text-xs truncate">{cat.name}</p>
                      <p className="text-white text-sm font-semibold">{cat.pct}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Merchant-Specific Limits */}
            <div className="rounded-2xl border border-white/6 bg-[#0a1628]/80 backdrop-blur-xl p-6">
              <h4 className="text-base font-semibold text-white mb-6">Merchant-Specific Limits</h4>
              <div className="space-y-5">
                {merchantLimits.map((m) => {
                  const Icon = m.icon;
                  const pct = (m.spent / m.limit) * 100;
                  return (
                    <div key={m.name}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${m.color}15` }}
                          >
                            <Icon className="w-4 h-4" style={{ color: m.color }} />
                          </div>
                          <span className="text-white text-sm font-medium">{m.name}</span>
                        </div>
                        <span className="text-white/40 text-xs">
                          ${m.spent.toLocaleString()}{" "}
                          <span className="text-white/20">/</span>{" "}
                          ${m.limit.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: m.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── Footer ─── */}
        <motion.footer variants={item} className="pt-8 border-t border-white/4 text-center">
          <p className="text-[11px] text-white/20">
            &copy; {new Date().getFullYear()} Cherokee Bank CNB. All rights reserved. Virtual cards are subject to our{" "}
            <span className="text-[#D4AF37]/40 hover:text-[#D4AF37]/60 cursor-pointer">Terms & Conditions</span>.
          </p>
        </motion.footer>
      </motion.div>

      {/* Card Generator Modal */}
      <CardGeneratorModal
        isOpen={showGenerator}
        onClose={() => setShowGenerator(false)}
        onCreated={() => refetchCards()}
      />
    </>
  );
}
