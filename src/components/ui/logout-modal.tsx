"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { LogOut, X, ShieldAlert } from "lucide-react";

interface LogoutModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName?: string;
}

export function LogoutModal({ open, onClose, onConfirm, userName }: LogoutModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  /* Close on backdrop click */
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === backdropRef.current) onClose();
    },
    [onClose]
  );

  /* Lock body scroll when modal is open */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <style>{`
        @keyframes logout-backdrop-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes logout-panel-in {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(12px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes logout-icon-pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.3);
          }
          50% {
            box-shadow: 0 0 24px 8px rgba(239, 68, 68, 0.15);
          }
        }
        @keyframes logout-plane-fly {
          0% {
            transform: translateX(0) translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateX(60px) translateY(-30px) rotate(-15deg);
            opacity: 0;
          }
        }
        .logout-backdrop {
          animation: logout-backdrop-in 0.25s ease-out forwards;
        }
        .logout-panel {
          animation: logout-panel-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .logout-icon-ring {
          animation: logout-icon-pulse 2s ease-in-out infinite;
        }
      `}</style>

      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={handleBackdropClick}
        className="logout-backdrop fixed inset-0 z-9999 flex items-center justify-center px-4"
        style={{
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        {/* Panel */}
        <div
          ref={panelRef}
          className="logout-panel relative w-full max-w-100 rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(145deg, rgba(15, 15, 28, 0.95) 0%, rgba(6, 27, 58, 0.95) 100%)",
            border: "1px solid rgba(239, 68, 68, 0.15)",
            boxShadow: "0 24px 80px rgba(0, 0, 0, 0.5), 0 0 40px rgba(239, 68, 68, 0.08)",
          }}
        >
          {/* Decorative top gradient line */}
          <div
            className="absolute top-0 left-0 right-0 h-0.5"
            style={{
              background: "linear-gradient(90deg, transparent, #EF4444, #D4AF37, #EF4444, transparent)",
            }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 transition-colors text-white/30 hover:text-white/60 z-10"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Content */}
          <div className="px-8 pt-8 pb-6 text-center">
            {/* Icon */}
            <div className="flex justify-center mb-5">
              <div
                className="logout-icon-ring relative w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                }}
              >
                <ShieldAlert className="h-7 w-7 text-red-400" />
                {/* Mini flying plane departing the icon */}
                <svg
                  viewBox="0 0 512 512"
                  className="absolute -top-1 -right-1 w-4 h-4"
                  style={{
                    animation: "logout-plane-fly 3s ease-in-out infinite",
                  }}
                >
                  <path
                    d="M507.068,194.059c-5.3-6.143-13.759-8.507-21.481-6.013l-59.859,17.264
                    c-11.406,3.695-23.81,2.792-34.574-2.507l-68.887-33.742l61.093-80.864c4.682-4.847,5.584-12.261,2.139-18.095
                    c-3.422-5.809-10.336-8.638-16.848-6.903L247.486,116.32l23.597,11.572l-16.23,8.115l-24.69-12.095L124.278,72.015
                    C65.799,43.262,18.154,52.695,3.16,83.208c-14.994,30.522,26.591,49.402,57.102,64.395l105.696,52.041l54.749,242.78
                    c1.877,8.982,10.003,15.28,19.224,14.828c9.172-0.464,16.633-7.509,17.632-16.669l33.956-179.158l73.569,36.226
                    c47.073,21.732,97.259,19.64,112.253-10.86l32.579-70.61C513.507,208.911,512.39,200.19,507.068,194.059z"
                    fill="#D4AF37"
                    opacity="0.7"
                  />
                </svg>
              </div>
            </div>

            {/* Text */}
            <h3 className="text-xl font-semibold text-white mb-2">
              Sign Out?
            </h3>
            <p className="text-sm text-white/45 leading-relaxed max-w-70 mx-auto">
              {userName
                ? `Hey ${userName}, are you sure you want to sign out? You'll need to log in again to access your account.`
                : "Are you sure you want to sign out? You'll need to log in again to access your account."}
            </p>
          </div>

          {/* Security info pill */}
          <div className="flex justify-center px-8 pb-5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/3 border border-white/6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-white/35 font-medium tracking-wide uppercase">
                Session encrypted &bull; Data secure
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="px-8 pb-8 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 h-11 rounded-xl text-sm font-medium text-white/70 transition-all duration-200 hover:text-white hover:bg-white/6"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              Stay Signed In
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 h-11 rounded-xl text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 hover:brightness-110 hover:shadow-lg"
              style={{
                background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                boxShadow: "0 4px 16px rgba(239, 68, 68, 0.3)",
              }}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
