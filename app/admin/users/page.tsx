"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui";
import { motion } from "framer-motion";
import { SkeletonTable } from "@/src/components/animations/skeleton-loader";
import { TransitionFade, SlideIn } from "@/src/components/animations/loading-states";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
};

const mockUsers = [
  { id: 1, name: "John Doe", email: "john@example.com", status: "ACTIVE", kyc: "VERIFIED", joinDate: "2024-01-15", balance: 5420.50 },
  { id: 2, name: "Jane Smith", email: "jane@example.com", status: "ACTIVE", kyc: "VERIFIED", joinDate: "2024-01-20", balance: 12300.00 },
  { id: 3, name: "Bob Wilson", email: "bob@example.com", status: "ACTIVE", kyc: "PENDING", joinDate: "2024-02-01", balance: 3150.75 },
  { id: 4, name: "Alice Brown", email: "alice@example.com", status: "FROZEN", kyc: "VERIFIED", joinDate: "2024-02-05", balance: 8900.00 },
  { id: 5, name: "Charlie Davis", email: "charlie@example.com", status: "SUSPENDED", kyc: "REJECTED", joinDate: "2024-02-10", balance: 0.00 },
];

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [loading, setLoading] = useState(false);

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-500/20 text-emerald-400";
      case "FROZEN":
        return "bg-amber-500/20 text-amber-400";
      case "SUSPENDED":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-white/10 text-white/60";
    }
  };

  const getKycColor = (kyc: string) => {
    switch (kyc) {
      case "VERIFIED":
        return "bg-emerald-500/20 text-emerald-400";
      case "PENDING":
        return "bg-amber-500/20 text-amber-400";
      case "REJECTED":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-white/10 text-white/60";
    }
  };


  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
        <p className="text-white/60">View and manage all platform users</p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 md:items-end md:justify-between">
        <div className="flex-1">
          <label className="block text-sm font-medium text-white/80 mb-2">Search Users</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-accent/50 transition-colors"
            />
            <span className="material-icons absolute left-3 top-3 text-white/40">search</span>
          </div>
        </div>
        <div className="md:w-48">
          <label className="block text-sm font-medium text-white/80 mb-2">Filter by Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-accent/50 transition-colors"
          >
            <option value="ALL" className="bg-background-dark">All Users</option>
            <option value="ACTIVE" className="bg-background-dark">Active</option>
            <option value="FROZEN" className="bg-background-dark">Frozen</option>
            <option value="SUSPENDED" className="bg-background-dark">Suspended</option>
          </select>
        </div>
      </motion.div>

      {/* Users Table Card */}
      <motion.div variants={itemVariants}>
        <Card className="cherokee-card border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-white">Users ({filteredUsers.length})</CardTitle>
            <span className="text-xs text-white/40">Total: {mockUsers.length}</span>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-icons text-4xl text-white/20 mb-3 block">person_off</span>
                <p className="text-white/40">No users found matching your criteria</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-screen overflow-y-auto">
                {filteredUsers.map((user, idx) => (
                  <SlideIn key={user.id} direction="up" delay={idx * 50}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-brand-accent/20 flex items-center justify-center flex-shrink-0">
                            <span className="material-icons text-brand-accent">person</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-bold text-sm">{user.name}</p>
                            <p className="text-xs text-white/40 truncate">{user.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getKycColor(user.kyc)}`}>
                            KYC: {user.kyc}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(user.status)}`}>
                            {user.status}
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                          >
                            <span className="material-icons text-white/60 text-lg">more_vert</span>
                          </motion.button>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-white/5 flex justify-between text-xs text-white/40">
                        <span>Joined: {user.joinDate}</span>
                        <span>Balance: ${user.balance.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                      </div>
                    </motion.div>
                  </SlideIn>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
