"use client";

import { useState } from "react";
import { useAuth } from "@/src/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { LogoutModal } from "../ui/logout-modal";
import { LogOut, Bell, Search } from "lucide-react";
import { getInitials } from "@/src/utils/helpers";

export function Header() {
  const { user, logout } = useAuth();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogout = async () => {
    setLogoutOpen(false);
    await logout();
  };

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-white/5 bg-[#061B3A]/50 backdrop-blur-xl px-6">
        {/* Search */}
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
          <input
            type="text"
            placeholder="Search transactions, wallets..."
            className="w-full h-9 pl-10 pr-4 rounded-xl bg-white/5 border border-white/5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#D4AF37]/30 focus:ring-1 focus:ring-[#D4AF37]/20 transition-all"
          />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Live indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Live</span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-xl hover:bg-white/5 transition-colors">
            <Bell className="h-4 w-4 text-white/40" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D4AF37]" />
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-4 border-l border-white/5">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-white">
                {user ? `${user.firstName} ${user.lastName}` : ""}
              </div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider">
                {user?.role === 'ADMIN' ? 'Administrator' : 'Member'}
              </div>
            </div>
            <Avatar>
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback className="bg-[#D4AF37]/20 text-[#D4AF37] text-xs font-bold">
                {user ? getInitials(user.firstName, user.lastName) : "U"}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => setLogoutOpen(true)}
              className="p-2 rounded-xl hover:bg-red-500/10 transition-all duration-200 text-white/30 hover:text-red-400 group relative"
            >
              <LogOut className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              {/* Tooltip */}
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 text-[10px] font-medium text-white/60 bg-black/80 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Sign Out
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Logout confirmation modal */}
      <LogoutModal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
        userName={user?.firstName}
      />
    </>
  );
}
