"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    PiggyBank, Target, Plus, TrendingUp, Calendar,
    Lock, Sparkles, ChevronRight, ArrowUpRight,
} from "lucide-react";

const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};
const fadeUp = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 280, damping: 26 } },
};

/* ── Mock savings goals ── */
const savingsGoals = [
    {
        id: "1", name: "Emergency Fund", target: 25000, saved: 18500,
        icon: "🛡️", color: "#3B82F6", monthlyAdd: 500, deadline: "Dec 2026",
    },
    {
        id: "2", name: "Vacation", target: 8000, saved: 3200,
        icon: "✈️", color: "#10B981", monthlyAdd: 400, deadline: "Jun 2026",
    },
    {
        id: "3", name: "New Car", target: 45000, saved: 12000,
        icon: "🚗", color: "#8B5CF6", monthlyAdd: 800, deadline: "Mar 2027",
    },
    {
        id: "4", name: "Education Fund", target: 30000, saved: 9500,
        icon: "🎓", color: "#D4AF37", monthlyAdd: 600, deadline: "Sep 2027",
    },
];

const savingsStats = [
    { label: "Total Saved", value: "$43,200", change: "+12%", icon: PiggyBank, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Monthly Target", value: "$2,300", change: "On Track", icon: Target, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Interest Earned", value: "$340", change: "+4.2% APY", icon: TrendingUp, color: "text-[#D4AF37]", bg: "bg-[#D4AF37]/10" },
    { label: "Locked Savings", value: "$15,000", change: "6 months", icon: Lock, color: "text-purple-400", bg: "bg-purple-500/10" },
];

/* ── Progress Ring ── */
function ProgressRing({ pct, color, size = 64 }: { pct: number; color: string; size?: number }) {
    const r = (size - 8) / 2;
    const c = 2 * Math.PI * r;
    const dashOffset = c - (pct / 100) * c;

    return (
        <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
            <motion.circle
                cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="5"
                strokeLinecap="round"
                initial={{ strokeDasharray: `0 ${c}` }}
                animate={{ strokeDasharray: `${c - dashOffset} ${dashOffset}` }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            />
        </svg>
    );
}

export default function SavingsPage() {
    const [showNewGoal, setShowNewGoal] = useState(false);

    const totalSaved = savingsGoals.reduce((sum, g) => sum + g.saved, 0);
    const totalTarget = savingsGoals.reduce((sum, g) => sum + g.target, 0);
    const overallPct = Math.round((totalSaved / totalTarget) * 100);

    return (
        <motion.div
            className="max-w-[1400px] mx-auto space-y-6 pb-12"
            variants={stagger} initial="hidden" animate="show"
        >
            {/* Header */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Savings Goals</h1>
                    <p className="text-sm text-white/40 mt-0.5">Track your progress and grow your wealth.</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setShowNewGoal(!showNewGoal)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D4AF37]/20 text-[#D4AF37] text-sm font-semibold hover:bg-[#D4AF37]/5 transition-colors"
                >
                    <Plus className="w-4 h-4" /> New Goal
                </motion.button>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={fadeUp}>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {savingsStats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.label} className="rounded-2xl border border-white/6 bg-[#0a1628]/80 backdrop-blur-xl p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                        <Icon className={`w-4.5 h-4.5 ${stat.color}`} />
                                    </div>
                                    <span className="text-[11px] text-white/40 uppercase tracking-wider font-medium">{stat.label}</span>
                                </div>
                                <p className="text-xl font-bold text-white">{stat.value}</p>
                                <p className={`text-[10px] font-semibold mt-1 ${stat.color}`}>{stat.change}</p>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Overall Progress */}
            <motion.div variants={fadeUp}>
                <div className="rounded-2xl border border-white/6 bg-gradient-to-br from-[#0d1a30] via-[#0a1628] to-[#071020] p-6">
                    <div className="flex items-center gap-6">
                        <div className="relative shrink-0">
                            <ProgressRing pct={overallPct} color="#D4AF37" size={80} />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-lg font-bold text-white">{overallPct}%</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-base font-bold text-white mb-1">Overall Savings Progress</h3>
                            <p className="text-sm text-white/40 mb-3">
                                ${totalSaved.toLocaleString()} saved of ${totalTarget.toLocaleString()} total goal
                            </p>
                            <div className="h-2 rounded-full bg-white/5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${overallPct}%` }}
                                    transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                                    className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#f8e192]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Savings Goals Grid */}
            <motion.div variants={fadeUp}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {savingsGoals.map((goal, i) => {
                        const pct = Math.round((goal.saved / goal.target) * 100);
                        return (
                            <motion.div
                                key={goal.id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0, transition: { delay: 0.15 + i * 0.06 } }}
                                whileHover={{ y: -2 }}
                                className="group rounded-2xl border border-white/6 bg-[#0a1628]/80 backdrop-blur-xl p-6 hover:border-white/10 transition-all cursor-pointer"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{goal.icon}</span>
                                        <div>
                                            <h4 className="text-base font-bold text-white">{goal.name}</h4>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Calendar className="w-3 h-3 text-white/30" />
                                                <span className="text-[11px] text-white/30">{goal.deadline}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <ProgressRing pct={pct} color={goal.color} size={52} />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-xs font-bold text-white">{pct}%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-white/40">Saved</span>
                                        <span className="text-white font-bold">${goal.saved.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-white/40">Target</span>
                                        <span className="text-white/60">${goal.target.toLocaleString()}</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-white/5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: goal.color }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                    <div className="flex items-center gap-1.5">
                                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                                        <span className="text-xs text-white/40">${goal.monthlyAdd}/mo auto-save</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-xs font-semibold">Details</span>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}

                    {/* Add New Goal Card */}
                    <motion.button
                        whileHover={{ y: -2, borderColor: "rgba(212,175,55,0.2)" }}
                        whileTap={{ scale: 0.98 }}
                        className="flex flex-col items-center justify-center gap-3 min-h-[240px] rounded-2xl border border-dashed border-white/8 bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-pointer"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/5 border border-[#D4AF37]/10 flex items-center justify-center">
                            <Plus className="w-6 h-6 text-[#D4AF37]/40" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-semibold text-white/30">Create New Goal</p>
                            <p className="text-[11px] text-white/15 mt-0.5">Set a target and start saving</p>
                        </div>
                    </motion.button>
                </div>
            </motion.div>

            {/* Smart Savings Tips */}
            <motion.div variants={fadeUp}>
                <div className="rounded-2xl border border-[#D4AF37]/10 bg-gradient-to-r from-[#D4AF37]/5 via-transparent to-[#D4AF37]/3 p-5">
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                            <Sparkles className="w-4.5 h-4.5 text-[#D4AF37]" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white mb-1">Smart Savings Tip</h4>
                            <p className="text-xs text-white/40 leading-relaxed">
                                Based on your spending patterns, you could save an extra <span className="text-[#D4AF37] font-semibold">$320/month</span> by
                                enabling round-ups on your daily transactions. That's an additional <span className="text-[#D4AF37] font-semibold">$3,840/year</span> towards your goals.
                            </p>
                            <button className="text-xs text-[#D4AF37] font-semibold mt-2 hover:text-[#D4AF37]/80 transition-colors">
                                Enable Round-ups →
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
