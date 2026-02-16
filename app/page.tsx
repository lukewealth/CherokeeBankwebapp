"use client";

import Link from "next/link";
import Image from "next/image";
import { FlyingAirplane } from "@/src/components/landing/flying-airplane";
import { FloatingCities } from "@/src/components/landing/floating-cities";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0b1120] text-white">
      {/* Hero Section — full bleed, no container */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Globe Image — right side, fading into navy */}
        <div className="absolute top-0 right-0 bottom-0 w-[65%] z-0">
          <Image
            src="/ui/backgrounds/globe-night.jpg"
            alt="Earth at night"
            fill
            className="object-cover object-[65%_center]"
            priority
          />
          {/* Left fade into navy */}
          <div className="absolute inset-0 bg-linear-to-r from-[#0b1120] via-[#0b1120]/60 to-transparent" />
          {/* Bottom fade into navy */}
          <div className="absolute inset-0 bg-linear-to-t from-[#0b1120] via-transparent to-transparent" />
          {/* Top subtle fade */}
          <div className="absolute inset-0 bg-linear-to-b from-[#0b1120]/40 via-transparent to-transparent" />
          {/* Right edge fade */}
          <div className="absolute top-0 right-0 bottom-0 w-24 bg-linear-to-l from-[#0b1120]/50 to-transparent" />
          {/* Gold connection arcs overlay */}
          <svg className="absolute inset-0 w-full h-full z-10 opacity-40" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 150 350 Q 350 100 600 200" stroke="url(#arcGold)" strokeWidth="1" fill="none" className="flight-arc" />
            <path d="M 100 400 Q 400 150 700 280" stroke="url(#arcGold)" strokeWidth="0.8" fill="none" className="flight-arc" style={{ animationDelay: '0.5s' }} />
            <path d="M 200 450 Q 450 200 650 350" stroke="url(#arcGold)" strokeWidth="0.6" fill="none" className="flight-arc" style={{ animationDelay: '1s' }} />
            <path d="M 300 500 Q 500 250 750 300" stroke="url(#arcGold)" strokeWidth="0.8" fill="none" className="flight-arc" style={{ animationDelay: '1.5s' }} />
            <path d="M 80 300 Q 300 50 550 150" stroke="url(#arcGold)" strokeWidth="0.7" fill="none" className="flight-arc" style={{ animationDelay: '0.8s' }} />
            <circle cx="600" cy="200" r="2" fill="#D4AF37" className="animate-pulse" />
            <circle cx="700" cy="280" r="2" fill="#D4AF37" className="animate-pulse" style={{ animationDelay: '0.3s' }} />
            <circle cx="550" cy="150" r="1.5" fill="#D4AF37" className="animate-pulse" style={{ animationDelay: '0.6s' }} />
            <circle cx="650" cy="350" r="2" fill="#D4AF37" className="animate-pulse" style={{ animationDelay: '0.9s' }} />
            <defs>
              <linearGradient id="arcGold" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Flying Airplane */}
          <FlyingAirplane />

          {/* City names across the globe */}
          <FloatingCities />
        </div>

        {/* Navigation */}
        <nav className="relative z-20 flex items-center justify-between px-10 lg:px-16 py-7">
          <Link href="/">
            <Image
              src="/branding/logos/cherokee-logo.png"
              alt="Cherokee Digital"
              width={45}
              height={23}
              className="object-contain"
              style={{ width: 'auto', height: 'auto' }}
            />
          </Link>

          <div className="hidden md:flex items-center gap-10">
            <div className="flex items-center gap-8 text-sm font-medium text-white/60">
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <Link href="/dashboard/wallets" className="hover:text-white transition-colors">Wallets</Link>
              <Link href="/dashboard/transactions" className="hover:text-white transition-colors">Transactions</Link>
            </div>
            <Link
              href="/support"
              className="px-6 py-2 text-sm font-medium border border-white/25 rounded-full hover:bg-white/10 transition-all"
            >
              Contact
            </Link>
          </div>
        </nav>

        {/* Hero Content — left aligned */}
        <div className="relative z-20 flex-1 flex items-center px-10 lg:px-16 pt-32 pb-40">
          <div className="max-w-xl flex flex-col gap-6">
            <h1 className="text-5xl md:text-6xl lg:text-[4.25rem] font-light tracking-tight leading-[1.08]">
              The Future of<br />
              Global Banking
            </h1>

            <p className="text-base text-white/50 font-light max-w-md leading-relaxed">
              Unbank the Globe with multi-currency banking
              and our gold-backed $Chero token.
            </p>

            <div className="flex flex-wrap gap-4 mt-2">
              <Link
                href="/register"
                className="px-8 py-3 text-sm font-semibold rounded-full bg-linear-to-r from-[#D4AF37] to-[#b8962e] text-[#0b1120] shadow-lg shadow-[#D4AF37]/20 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:scale-[1.02] transition-all"
              >
                Open Account
              </Link>
              <Link
                href="/dashboard/crypto"
                className="px-8 py-3 text-sm font-semibold rounded-full border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/70 transition-all"
              >
                Explore $Chero
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light mt-6 mb-4">
            AI &amp; Blockchain Powered{" "}
            <span className="text-[#D4AF37]">Finance</span>
          </h2>
          <p className="text-lg text-white/40 max-w-2xl mx-auto">
            Cherokee Digital fuses artificial intelligence with blockchain technology to deliver a truly global financial platform.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: "psychology", title: "AI-Powered Insights", desc: "GPT-4 driven fraud detection, predictive budgeting, and intelligent spend analysis across all your accounts." },
            { icon: "token", title: "$CHERO Blockchain Token", desc: "Gold-backed digital token with staking rewards, DeFi integration, and transparent on-chain settlement." },
            { icon: "language", title: "Global Transfers", desc: "Instant cross-border payments across 180+ countries with real-time FX conversion and zero hidden fees." },
            { icon: "account_balance_wallet", title: "Multi-Currency Vaults", desc: "Hold USD, EUR, GBP, and $CHERO in institutional-grade digital vaults with AES-256 encryption." },
            { icon: "currency_bitcoin", title: "Crypto Exchange", desc: "Trade BTC, ETH, and USDT with real-time market data, instant settlement, and deep liquidity pools." },
            { icon: "shield", title: "Zero-Trust Security", desc: "Blockchain-verified identity, zero-knowledge proofs, 2FA, and full KYC/AML compliance built in." },
          ].map((f) => (
            <div key={f.title} className="cherokee-card p-8 group hover:scale-[1.02] transition-all">
              <div className="w-14 h-14 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center mb-6 group-hover:bg-[#D4AF37]/20 transition-colors">
                <span className="material-icons text-[#D4AF37] text-2xl">{f.icon}</span>
              </div>
              <h3 className="text-lg font-bold mb-3">{f.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-8 py-24 text-center">
        <div className="cherokee-card p-16 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#D4AF37]/10 blur-[100px] rounded-full" />
          <div className="relative z-10">
            <h2 className="text-4xl font-light mb-4">
              Ready to Join the{" "}
              <span className="text-[#D4AF37]">Future?</span>
            </h2>
            <p className="text-white/50 mb-8 max-w-lg mx-auto">
              Open your Cherokee Digital account today and access multi-currency wallets, crypto trading, and AI-powered banking.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/register" className="px-8 py-3 text-sm font-semibold rounded-full bg-linear-to-r from-[#D4AF37] to-[#b8962e] text-[#0b1120] shadow-lg shadow-[#D4AF37]/20 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all">
                Open Free Account
              </Link>
              <Link href="/support" className="px-8 py-3 text-sm font-semibold rounded-full border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* App Download Section */}
      <section className="relative z-10 py-20 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-75 bg-[#D4AF37]/5 blur-[120px] rounded-full" />
        </div>
        <div className="relative max-w-5xl mx-auto px-8">
          <div className="rounded-2xl p-10 md:p-14 flex flex-col md:flex-row items-center gap-10" style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(6,27,58,0.6) 50%, rgba(212,175,55,0.05) 100%)", border: "1px solid rgba(212,175,55,0.12)" }}>
            {/* Phone mockup — live CSS recreation of app screenshot */}
            <div className="shrink-0 relative w-52 md:w-56">
              {/* Phone body */}
              <div className="relative rounded-4xl border-2 border-white/10 overflow-hidden shadow-2xl shadow-black/50" style={{ background: "#0b1628" }}>
                {/* Notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 rounded-full bg-black z-30" />

                {/* Screen content */}
                <div className="px-4 pt-10 pb-5 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-full border-2 border-[#D4AF37]/50 bg-[#D4AF37]/10 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#D4AF37]" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                    </div>
                    <span className="text-[11px] font-semibold text-white">Hello, Alex</span>
                    <div className="relative">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#D4AF37]" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
                      <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                    </div>
                  </div>

                  {/* Balance card */}
                  <div className="rounded-xl px-4 py-4" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] text-white/40 uppercase tracking-wider">Total Balance</span>
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white/30" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                    </div>
                    <div className="text-xl font-bold text-white tracking-tight">$12,480.50</div>
                    <div className="text-[8px] text-white/30 mt-0.5">Primary Checking Account</div>
                  </div>

                  {/* Quick actions */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { icon: "M7 11l5-5 5 5M12 6v13", label: "Send" },
                      { icon: "M17 13l-5 5-5-5M12 18V5", label: "Receive" },
                      { icon: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z", label: "Bills" },
                      { icon: "M17 3H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7V5h10v14zm-4-4h2v2h-2zm0-8h2v6h-2z", label: "Top-up" },
                    ].map((a) => (
                      <div key={a.label} className="flex flex-col items-center gap-1">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#D4AF37]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d={a.icon} />
                          </svg>
                        </div>
                        <span className="text-[7px] text-white/40">{a.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Recent Activity */}
                  <div>
                    <h4 className="text-[10px] font-bold text-white mb-2">Recent Activity</h4>
                    {/* AI insight */}
                    <div className="rounded-lg px-3 py-2 mb-2.5" style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.15)" }}>
                      <div className="flex items-start gap-2">
                        <span className="text-[#D4AF37] text-[10px]">&#x2728;</span>
                        <span className="text-[7px] text-white/50 leading-relaxed">You&apos;ve spent 15% less on dining out this month. Keep it up!</span>
                      </div>
                    </div>
                    {/* Transactions */}
                    <div className="space-y-2">
                      {[
                        { name: "Amazon", date: "Today", amount: "-$89.99", color: "text-white/70" },
                        { name: "Starbucks", date: "Yesterday", amount: "-$5.75", color: "text-white/70" },
                        { name: "Incoming Transfer", date: "Apr 15, 2024", amount: "+$1,200.00", color: "text-emerald-400" },
                        { name: "Metro Transit", date: "Apr 14, 2024", amount: "-$2.50", color: "text-white/70" },
                      ].map((t) => (
                        <div key={t.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
                              <span className="text-[8px] text-white/30">&#9679;</span>
                            </div>
                            <div>
                              <div className="text-[8px] font-medium text-white/70">{t.name}</div>
                              <div className="text-[6px] text-white/25">{t.date}</div>
                            </div>
                          </div>
                          <span className={`text-[8px] font-semibold ${t.color}`}>{t.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Glow behind phone */}
              <div className="absolute -inset-4 bg-[#D4AF37]/5 blur-2xl rounded-full -z-10" />
            </div>

            {/* Text + Badges */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-light mb-3">
                Bank Anywhere, <span className="text-[#D4AF37]">Anytime</span>
              </h2>
              <p className="text-sm text-white/45 max-w-md leading-relaxed mb-8">
                Download the Cherokee Digital app for instant access to your wallets, transfers, $CHERO staking, and AI-powered insights — right from your pocket.
              </p>

              {/* Store badges */}
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                {/* Google Play */}
                <a
                  href="#"
                  className="group flex items-center gap-3 px-5 py-3 rounded-xl border border-white/10 hover:border-[#D4AF37]/40 bg-white/3 hover:bg-[#D4AF37]/5 transition-all duration-300"
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-white/50 group-hover:text-[#D4AF37] transition-colors" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 010 1.38l-2.302 2.302L15.395 12l2.303-2.492zM5.864 3.458L16.8 9.79l-2.302 2.302L5.864 3.458z"/>
                  </svg>
                  <div className="text-left">
                    <span className="block text-[9px] text-white/40 uppercase tracking-wider leading-none group-hover:text-white/50 transition-colors">Get it on</span>
                    <span className="block text-sm font-semibold text-white/80 group-hover:text-white transition-colors">Google Play</span>
                  </div>
                </a>

                {/* App Store */}
                <a
                  href="#"
                  className="group flex items-center gap-3 px-5 py-3 rounded-xl border border-white/10 hover:border-[#D4AF37]/40 bg-white/3 hover:bg-[#D4AF37]/5 transition-all duration-300"
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-white/50 group-hover:text-[#D4AF37] transition-colors" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <span className="block text-[9px] text-white/40 uppercase tracking-wider leading-none group-hover:text-white/50 transition-colors">Download on the</span>
                    <span className="block text-sm font-semibold text-white/80 group-hover:text-white transition-colors">App Store</span>
                  </div>
                </a>
              </div>

              <p className="mt-4 text-[10px] text-white/20">Available on iOS 16+ and Android 12+. Free to download.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────── Global Bank Footer ──────── */}
      <footer className="relative z-10 border-t border-white/5 bg-[#050a18]">
        {/* Main footer grid */}
        <div className="max-w-7xl mx-auto px-8 pt-16 pb-10">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/">
                <Image
                  src="/branding/logos/cherokee-logo.png"
                  alt="Cherokee Digital"
                  width={43}
                  height={21}
                  className="object-contain mb-4"
                  style={{ width: 'auto', height: 'auto' }}
                />
              </Link>
              <p className="text-xs text-white/30 leading-relaxed max-w-50">
                Next-generation digital banking powered by AI and blockchain technology.
              </p>
              {/* Social Icons */}
              <div className="flex items-center gap-3 mt-5">
                {/* Twitter / X */}
                <a href="#" className="group p-2 rounded-lg bg-white/3 border border-white/5 hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 transition-all duration-300">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white/30 group-hover:text-[#D4AF37] transition-colors" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                {/* LinkedIn */}
                <a href="#" className="group p-2 rounded-lg bg-white/3 border border-white/5 hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 transition-all duration-300">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white/30 group-hover:text-[#D4AF37] transition-colors" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                {/* Instagram */}
                <a href="#" className="group p-2 rounded-lg bg-white/3 border border-white/5 hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 transition-all duration-300">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white/30 group-hover:text-[#D4AF37] transition-colors" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
                {/* Facebook */}
                <a href="#" className="group p-2 rounded-lg bg-white/3 border border-white/5 hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 transition-all duration-300">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white/30 group-hover:text-[#D4AF37] transition-colors" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                {/* YouTube */}
                <a href="#" className="group p-2 rounded-lg bg-white/3 border border-white/5 hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 transition-all duration-300">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white/30 group-hover:text-[#D4AF37] transition-colors" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Products */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4">Products</h4>
              <ul className="space-y-2.5">
                <li><Link href="/dashboard/wallets" className="text-xs text-white/30 hover:text-[#D4AF37] transition-colors">Multi-Currency Wallets</Link></li>
                <li><Link href="/dashboard/crypto" className="text-xs text-white/30 hover:text-[#D4AF37] transition-colors">$CHERO Token</Link></li>
                <li><Link href="/dashboard/send" className="text-xs text-white/30 hover:text-[#D4AF37] transition-colors">Global Transfers</Link></li>
                <li><Link href="/dashboard/transactions" className="text-xs text-white/30 hover:text-[#D4AF37] transition-colors">Transaction History</Link></li>
                <li><Link href="/dashboard/ai" className="text-xs text-white/30 hover:text-[#D4AF37] transition-colors">AI Banking</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4">Company</h4>
              <ul className="space-y-2.5">
                <li><Link href="/about" className="text-xs text-white/30 hover:text-[#D4AF37] transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="text-xs text-white/30 hover:text-[#D4AF37] transition-colors">Careers</Link></li>
                <li><a href="#" className="text-xs text-white/30 hover:text-[#D4AF37] transition-colors">Press &amp; Media</a></li>
                <li><a href="#" className="text-xs text-white/30 hover:text-[#D4AF37] transition-colors">Investor Relations</a></li>
                <li><a href="#" className="text-xs text-white/30 hover:text-[#D4AF37] transition-colors">Partnerships</a></li>
              </ul>
            </div>

            {/* Legal & Compliance */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4">Legal</h4>
              <ul className="space-y-2.5">
                <li><Link href="/legal" className="text-xs text-white/30 hover:text-[#D4AF37] transition-colors">Terms of Service</Link></li>
                <li><Link href="/legal" className="text-xs text-white/30 hover:text-[#D4AF37] transition-colors">Privacy Policy</Link></li>
                <li><a href="#" className="text-xs text-white/30 hover:text-[#D4AF37] transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="text-xs text-white/30 hover:text-[#D4AF37] transition-colors">AML Policy</a></li>
                <li><a href="#" className="text-xs text-white/30 hover:text-[#D4AF37] transition-colors">KYC Compliance</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4">Support</h4>
              <ul className="space-y-2.5">
                <li><Link href="/support" className="text-xs text-white/30 hover:text-[#D4AF37] transition-colors">Help Center</Link></li>
                <li><Link href="/support" className="text-xs text-white/30 hover:text-[#D4AF37] transition-colors">Contact Us</Link></li>
                <li><a href="#" className="text-xs text-white/30 hover:text-[#D4AF37] transition-colors">API Documentation</a></li>
                <li><a href="#" className="text-xs text-white/30 hover:text-[#D4AF37] transition-colors">System Status</a></li>
                <li><a href="#" className="text-xs text-white/30 hover:text-[#D4AF37] transition-colors">Security</a></li>
              </ul>
            </div>
          </div>

          {/* Regulatory badges divider */}
          <div className="border-t border-white/5 pt-8 pb-6">
            <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] text-white/15 font-medium tracking-wider uppercase">
              <span>PCI DSS Compliant</span>
              <span className="w-px h-3 bg-white/10" />
              <span>SOC 2 Type II</span>
              <span className="w-px h-3 bg-white/10" />
              <span>ISO 27001</span>
              <span className="w-px h-3 bg-white/10" />
              <span>GDPR Ready</span>
              <span className="w-px h-3 bg-white/10" />
              <span>256-bit Encryption</span>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-white/20">
              &copy; {new Date().getFullYear()} Cherokee Digital Bank. All Rights Reserved. NMLS #1234567
            </p>
            <div className="flex items-center gap-4 text-[11px] text-white/20">
              <span>Member FDIC</span>
              <span className="w-px h-3 bg-white/10" />
              <span>Equal Housing Lender</span>
              <span className="w-px h-3 bg-white/10" />
              <a href="#" className="hover:text-[#D4AF37] transition-colors">Sitemap</a>
              <span className="w-px h-3 bg-white/10" />
              <a href="#" className="hover:text-[#D4AF37] transition-colors">Accessibility</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
