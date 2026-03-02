export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="mb-12">
        <span className="px-3 py-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
          About Us
        </span>
        <h1 className="text-5xl font-extrabold text-white mt-6 mb-4">About Cherokee Digital</h1>
        <p className="text-lg text-white/40 max-w-2xl leading-relaxed">
          Cherokee Digital is a next-generation AI-powered financial platform built on blockchain technology.
          We combine global banking infrastructure with decentralized finance to provide a seamless experience
          for managing multi-currency wallets, trading crypto assets, and leveraging intelligent financial insights.
        </p>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
        <div className="cherokee-card p-8">
          <span className="material-icons text-[#D4AF37] text-3xl mb-4 block">public</span>
          <h3 className="text-xl font-bold text-white mb-3">Global First</h3>
          <p className="text-sm text-white/40 leading-relaxed">
            Built for a borderless world. Our platform connects 180+ countries with instant
            multi-currency transfers and real-time FX conversion.
          </p>
        </div>
        <div className="cherokee-card p-8">
          <span className="material-icons text-[#D4AF37] text-3xl mb-4 block">psychology</span>
          <h3 className="text-xl font-bold text-white mb-3">AI-Powered Finance</h3>
          <p className="text-sm text-white/40 leading-relaxed">
            GPT-4 driven insights power every decision — from fraud detection and spend analysis
            to predictive budgeting and smart portfolio management.
          </p>
        </div>
        <div className="cherokee-card p-8">
          <span className="material-icons text-[#D4AF37] text-3xl mb-4 block">token</span>
          <h3 className="text-xl font-bold text-white mb-3">Blockchain Native</h3>
          <p className="text-sm text-white/40 leading-relaxed">
            Built on distributed ledger technology with our gold-backed $CHERO token,
            staking rewards, and transparent on-chain settlement.
          </p>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12">
        <div className="cherokee-card p-8">
          <span className="material-icons text-[#D4AF37] text-2xl mb-4 block">rocket_launch</span>
          <h3 className="text-xl font-bold text-white mb-3">Our Mission</h3>
          <p className="text-sm text-white/40 leading-relaxed">
            To unbank the globe — making sophisticated financial tools accessible to everyone
            through AI intelligence and blockchain transparency.
          </p>
        </div>
        <div className="cherokee-card p-8">
          <span className="material-icons text-[#D4AF37] text-2xl mb-4 block">visibility</span>
          <h3 className="text-xl font-bold text-white mb-3">Our Vision</h3>
          <p className="text-sm text-white/40 leading-relaxed">
            A decentralized financial ecosystem where anyone, anywhere can access institutional-grade
            banking, AI-driven insights, and blockchain-secured assets.
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-6 mt-16">Platform Capabilities</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { icon: 'account_balance_wallet', text: 'Multi-currency digital vaults for USD, EUR, GBP, and $CHERO tokens' },
          { icon: 'currency_bitcoin', text: 'Real-time crypto trading — Bitcoin, Ethereum, USDT with instant settlement' },
          { icon: 'psychology', text: 'AI-powered assistant for fraud detection, spend analysis, and smart insights' },
          { icon: 'token', text: 'Gold-backed $CHERO token with staking, APY rewards, and DeFi integration' },
          { icon: 'shield', text: 'Zero-knowledge proofs, AES-256 encryption, and full KYC/AML compliance' },
          { icon: 'language', text: 'Instant global transfers across 180+ countries with live FX rates' },
        ].map((f) => (
          <div key={f.text} className="cherokee-card p-5 flex items-start gap-4">
            <span className="material-icons text-[#D4AF37]">{f.icon}</span>
            <span className="text-sm text-white/60">{f.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
