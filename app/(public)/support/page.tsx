export default function SupportPage() {
  const faqs = [
    { q: 'How do I create an account?', a: 'Click "Get Started" on our homepage. Fill in your details, verify your email with the OTP, and complete KYC verification to unlock all features.' },
    { q: 'How do I buy cryptocurrency?', a: 'Navigate to the Crypto section in your dashboard. Select the cryptocurrency you want to buy, choose your funding wallet, enter the amount, and confirm.' },
    { q: 'What currencies are supported?', a: 'We support USD, EUR, GBP, and our native CHERO token for fiat. For crypto, we support Bitcoin (BTC), Ethereum (ETH), and Tether (USDT).' },
    { q: 'How does the merchant POS work?', a: 'Set up your merchant account from the Merchant section. You\'ll receive a unique POS ID that customers can use to send payments directly to your business wallet.' },
    { q: 'Is my data secure?', a: 'Yes. We use bank-grade encryption (AES-256), mandatory KYC/AML compliance, real-time fraud detection, OFAC sanctions screening, and two-factor authentication.' },
    { q: 'How can I contact support?', a: 'You can use our AI assistant for instant help, or email Info@cherokeebank.org for complex issues. Our team responds within 24 hours.' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="mb-12">
        <span className="px-3 py-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
          Help Center
        </span>
        <h1 className="text-5xl font-extrabold text-white mt-6 mb-4">Support Center</h1>
        <p className="text-lg text-white/40">
          Find answers to common questions or reach out to our team.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <details key={i} className="cherokee-card p-6 group cursor-pointer">
            <summary className="flex items-center justify-between font-bold text-white list-none">
              <span className="flex items-center gap-3">
                <span className="material-icons text-[#D4AF37] text-sm">help_outline</span>
                {faq.q}
              </span>
              <span className="material-icons text-white/20 group-open:rotate-180 transition-transform text-sm">expand_more</span>
            </summary>
            <p className="text-sm text-white/40 mt-4 pl-8 leading-relaxed">{faq.a}</p>
          </details>
        ))}
      </div>

      <div className="cherokee-card p-10 mt-12 text-center relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#D4AF37]/5 rounded-full blur-[80px]" />
        <div className="relative z-10">
          <span className="material-icons text-[#D4AF37] text-3xl mb-4 block">headset_mic</span>
          <h2 className="text-xl font-bold text-white mb-2">Still need help?</h2>
          <p className="text-sm text-white/30 mb-6">Our support team is available 24/7</p>
          <a
            href="mailto:Info@cherokeebank.org"
            className="btn-gold inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm"
          >
            <span className="material-icons text-sm">email</span>
            Email Us
          </a>

          <div className="mt-6 text-left text-sm text-white/40 space-y-2">
            <div>
              <strong>Addresses:</strong>
              <div>Postfach 33, 9428 Walzenhausen, Switzerland</div>
              <div>Ruth Street, Hamilton, Ontario L8L 6P9, Canada</div>
              <div>APT Block 6 Shop 252 Tradefair, Lagos, Nigeria</div>
            </div>

            <div>
              <strong>Phone:</strong>
              <div>+1 416-949-1920</div>
              <div>+44 7424 497570</div>
              <div>+233 554 076 720</div>
              <div>+234 811 083 9737</div>
              <div>+234 805 757 6666</div>
            </div>

            <div>
              <strong>Email:</strong>
              <div><a className="underline" href="mailto:Info@cherokeebank.org">Info@cherokeebank.org</a></div>
              <div><a className="underline" href="mailto:cherokeedigitalbank@gmail.com">cherokeedigitalbank@gmail.com</a></div>
            </div>

            <div>
              <strong>Website:</strong>
              <div><a className="underline" href="https://www.cherokeebank.org">www.cherokeebank.org</a></div>
            </div>

            <div className="pt-3">
              <strong>Socials:</strong>
              <div className="flex items-center gap-3 mt-2">
                <a href="https://x.com/Cherokeedigital" className="text-[#D4AF37] underline">X</a>
                <a href="https://www.instagram.com/cherokeedigital" className="text-[#D4AF37] underline">Instagram</a>
                <a href="https://www.tiktok.com/@cherokeedigital" className="text-[#D4AF37] underline">TikTok</a>
                <a href="https://www.linkedin.com/groups/16181066" className="text-[#D4AF37] underline">LinkedIn</a>
                <a href="https://www.facebook.com/profile.php?id=61584556345351" className="text-[#D4AF37] underline">Facebook</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
