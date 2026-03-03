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
      <header className="flex h-14 items-center justify-between border-b border-white/[0.04] bg-[#040A14]/80 backdrop-blur-md px-6">
        {/* Search */}
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/15" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full h-8 pl-9 pr-4 rounded-lg bg-white/[0.03] border border-white/[0.04] text-[12px] text-white/60 placeholder:text-white/15 focus:outline-none focus:border-white/10 transition-all"
          />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-white/[0.03] transition-colors">
            <Bell className="h-4 w-4 text-white/25" strokeWidth={1.6} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#C4A962]" />
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-white/[0.04]" />

          {/* User Profile */}
          <div className="flex items-center gap-2.5">
            <div className="text-right hidden sm:block">
              <div className="text-[12px] font-medium text-white/60 leading-tight">
                {user ? `${user.firstName} ${user.lastName}` : ""}
              </div>
              <div className="text-[10px] text-white/20 leading-tight mt-0.5">
                {user?.role === "ADMIN" ? "Admin" : "Member"}
              </div>
            </div>
            <Avatar className="h-7 w-7">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback className="bg-white/[0.05] text-white/40 text-[10px] font-semibold">
                {user ? getInitials(user.firstName, user.lastName) : "U"}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => setLogoutOpen(true)}
              className="p-1.5 rounded-lg hover:bg-white/[0.04] transition-all text-white/20 hover:text-white/40"
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={1.6} />
            </button>
          </div>
        </div>
      </header>

      <LogoutModal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
        userName={user?.firstName}
      />
    </>
  );
}
