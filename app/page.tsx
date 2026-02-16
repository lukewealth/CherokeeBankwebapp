"use client";

import Link from "next/link";
import Image from "next/image";
import { FlyingAirplane } from "@/src/components/landing/flying-airplane";

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

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <Link href="/">
            <Image
              src="/branding/logos/cherokee-logo.png"
              alt="Cherokee Digital"
              width={43}
              height={21}
              className="object-contain"
              style={{ width: 'auto', height: 'auto' }}
            />
          </Link>
          <div className="flex gap-6 text-xs text-white/30">
            <Link href="/about" className="hover:text-[#D4AF37] transition-colors">About</Link>
            <Link href="/legal" className="hover:text-[#D4AF37] transition-colors">Legal</Link>
            <Link href="/support" className="hover:text-[#D4AF37] transition-colors">Support</Link>
            <Link href="/careers" className="hover:text-[#D4AF37] transition-colors">Careers</Link>
          </div>
          <p className="text-xs text-white/20">&copy; {new Date().getFullYear()} Cherokee Digital. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
