export default function LegalPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="mb-12">
        <span className="px-3 py-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
          Legal
        </span>
        <h1 className="text-5xl font-extrabold text-white mt-6 mb-4">Legal</h1>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="material-icons text-[#D4AF37]">description</span>
            Terms of Service
          </h2>
          <div className="cherokee-card p-8 text-sm text-white/50 space-y-4 leading-relaxed">
            <p>
              By accessing or using Cherokee Bank services, you agree to be bound by these Terms of Service.
              Cherokee Bank provides digital banking services including multi-currency wallets, cryptocurrency
              trading, peer-to-peer transfers, and merchant payment solutions.
            </p>
            <p>
              Users must be at least 18 years of age and complete identity verification (KYC) to access all
              services. You are responsible for maintaining the security of your account credentials and for
              all activities that occur under your account.
            </p>
            <p>
              Cherokee Bank reserves the right to suspend or terminate accounts that violate these terms,
              engage in fraudulent activity, or fail to comply with applicable regulations.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="material-icons text-[#D4AF37]">privacy_tip</span>
            Privacy Policy
          </h2>
          <div className="cherokee-card p-8 text-sm text-white/50 space-y-4 leading-relaxed">
            <p>
              Cherokee Bank is committed to protecting your privacy. We collect personal information
              necessary for identity verification, fraud prevention, and service delivery. This includes
              name, email, phone number, government-issued ID, and transaction data.
            </p>
            <p>
              We implement industry-standard security measures including AES-256 encryption, secure data
              storage, and regular security audits. Your data is never sold to third parties.
            </p>
            <p>
              We may share information with regulatory authorities as required by law, and with service
              providers who assist in operating our platform under strict confidentiality agreements.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="material-icons text-[#D4AF37]">shield</span>
            AML/KYC Policy
          </h2>
          <div className="cherokee-card p-8 text-sm text-white/50 space-y-4 leading-relaxed">
            <p>
              Cherokee Bank maintains a comprehensive Anti-Money Laundering (AML) and Know Your Customer (KYC)
              program in compliance with applicable regulations. All users must complete identity verification
              before accessing financial services.
            </p>
            <p>
              We employ real-time transaction monitoring, risk scoring, and suspicious activity reporting.
              Transactions involving sanctioned countries (OFAC list) are automatically blocked.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
