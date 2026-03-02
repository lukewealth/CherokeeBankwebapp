"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bell, CheckCircle2, AlertTriangle, Info, Shield, CreditCard,
    ArrowDownLeft, TrendingUp, Settings, Check, Trash2,
} from "lucide-react";

const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.06 } },
};
const fadeUp = {
    hidden: { y: 16, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 280, damping: 26 } },
};

interface Notification {
    id: string;
    type: "security" | "transaction" | "info" | "alert" | "promo";
    title: string;
    message: string;
    time: string;
    read: boolean;
}

const mockNotifications: Notification[] = [
    { id: "1", type: "security", title: "New Login Detected", message: "A new login was detected from Chrome on Windows. If this wasn't you, please secure your account immediately.", time: "2 minutes ago", read: false },
    { id: "2", type: "transaction", title: "Payment Received", message: "You received $500.00 USD from John Doe. The funds are now available in your USD wallet.", time: "1 hour ago", read: false },
    { id: "3", type: "alert", title: "Card Spending Alert", message: "Your Primary Digital Card has reached 80% of its spending limit ($8,000 / $10,000).", time: "3 hours ago", read: false },
    { id: "4", type: "info", title: "KYC Verification Update", message: "Your identity verification is currently under review. This typically takes 1-2 business days.", time: "Yesterday", read: true },
    { id: "5", type: "promo", title: "Savings Goal Milestone!", message: "Congratulations! You've reached 75% of your Emergency Fund goal. Keep up the great work!", time: "Yesterday", read: true },
    { id: "6", type: "transaction", title: "Transfer Completed", message: "Your transfer of €2,400.00 to Jane Doe (IBAN: DE12****5678) has been completed successfully.", time: "2 days ago", read: true },
    { id: "7", type: "security", title: "Password Changed", message: "Your account password was changed successfully. If you didn't make this change, contact support immediately.", time: "3 days ago", read: true },
    { id: "8", type: "info", title: "System Maintenance", message: "Scheduled maintenance will occur on Saturday 2:00 AM - 4:00 AM CET. Some services may be temporarily unavailable.", time: "4 days ago", read: true },
];

const typeConfig = {
    security: { icon: Shield, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/15" },
    transaction: { icon: ArrowDownLeft, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/15" },
    alert: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/15" },
    info: { icon: Info, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/15" },
    promo: { icon: TrendingUp, color: "text-[#D4AF37]", bg: "bg-[#D4AF37]/10", border: "border-[#D4AF37]/15" },
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState(mockNotifications);
    const [filter, setFilter] = useState<"all" | "unread">("all");

    const unreadCount = notifications.filter((n) => !n.read).length;
    const filtered = filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

    const markAsRead = (id: string) => {
        setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    };

    const markAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const deleteNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    return (
        <motion.div
            className="max-w-[900px] mx-auto space-y-6 pb-12"
            variants={stagger} initial="hidden" animate="show"
        >
            {/* Header */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Notifications</h1>
                        <p className="text-sm text-white/40 mt-0.5">
                            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllRead}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#D4AF37] hover:bg-[#D4AF37]/5 transition-colors"
                        >
                            <Check className="w-3.5 h-3.5" /> Mark All Read
                        </button>
                    )}
                    <button className="p-2.5 rounded-xl border border-white/8 hover:bg-white/5 transition-colors">
                        <Settings className="w-4 h-4 text-white/40" />
                    </button>
                </div>
            </motion.div>

            {/* Filter */}
            <motion.div variants={fadeUp} className="flex gap-1.5">
                {[
                    { key: "all" as const, label: "All" },
                    { key: "unread" as const, label: `Unread (${unreadCount})` },
                ].map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${filter === f.key
                                ? "bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/20"
                                : "bg-white/4 text-white/40 border border-white/5 hover:bg-white/6"
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </motion.div>

            {/* Notification List */}
            <motion.div variants={fadeUp}>
                <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                        {filtered.map((n, i) => {
                            const config = typeConfig[n.type];
                            const Icon = config.icon;
                            return (
                                <motion.div
                                    key={n.id} layout
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0, transition: { delay: i * 0.03 } }}
                                    exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                                    className={`group rounded-2xl border bg-[#0a1628]/80 backdrop-blur-xl p-4 transition-all cursor-pointer hover:bg-white/[0.02] ${!n.read ? `${config.border} border-l-2` : "border-white/5"
                                        }`}
                                    onClick={() => markAsRead(n.id)}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                                            <Icon className={`w-4 h-4 ${config.color}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className={`text-sm font-semibold ${!n.read ? "text-white" : "text-white/60"}`}>
                                                        {n.title}
                                                    </h4>
                                                    {!n.read && <span className="w-2 h-2 rounded-full bg-[#D4AF37] shrink-0" />}
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                                                        className="p-1 rounded-lg hover:bg-red-500/10 transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 text-white/20 hover:text-red-400" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-xs text-white/35 leading-relaxed mb-1.5">{n.message}</p>
                                            <p className="text-[10px] text-white/20">{n.time}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Empty State */}
            {filtered.length === 0 && (
                <motion.div variants={fadeUp} className="text-center py-16">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                        <Bell className="w-8 h-8 text-white/15" />
                    </div>
                    <h3 className="text-lg font-bold text-white/30 mb-2">
                        {filter === "unread" ? "No Unread Notifications" : "No Notifications"}
                    </h3>
                    <p className="text-sm text-white/15">
                        {filter === "unread" ? "You're all caught up! All notifications have been read." : "Notifications about your account will appear here."}
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
}
