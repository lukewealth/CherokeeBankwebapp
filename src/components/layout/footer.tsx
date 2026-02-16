import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#050a18] pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-8">
        {/* Top grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/">
              <Image
                src="/branding/logos/cherokee-logo.png"
                alt="Cherokee Digital"
                width={50}
                height={25}
                className="object-contain mb-3"
                style={{ width: 'auto', height: 'auto' }}
              />
            </Link>
            <p className="text-[11px] text-white/25 leading-relaxed max-w-50 mb-4">
              Next-generation digital banking powered by AI and blockchain.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-2">
              {/* X / Twitter */}
              <a href="#" className="group p-1.5 rounded-md bg-white/3 border border-white/5 hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 transition-all duration-300">
                <svg viewBox="0 0 24 24" className="w-3 h-3 text-white/25 group-hover:text-[#D4AF37] transition-colors" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="#" className="group p-1.5 rounded-md bg-white/3 border border-white/5 hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 transition-all duration-300">
                <svg viewBox="0 0 24 24" className="w-3 h-3 text-white/25 group-hover:text-[#D4AF37] transition-colors" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" className="group p-1.5 rounded-md bg-white/3 border border-white/5 hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 transition-all duration-300">
                <svg viewBox="0 0 24 24" className="w-3 h-3 text-white/25 group-hover:text-[#D4AF37] transition-colors" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              {/* Facebook */}
              <a href="#" className="group p-1.5 rounded-md bg-white/3 border border-white/5 hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 transition-all duration-300">
                <svg viewBox="0 0 24 24" className="w-3 h-3 text-white/25 group-hover:text-[#D4AF37] transition-colors" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Products</h4>
            <ul className="space-y-2">
              <li><Link href="/dashboard/wallets" className="text-[11px] text-white/25 hover:text-[#D4AF37] transition-colors">Wallets</Link></li>
              <li><Link href="/dashboard/crypto" className="text-[11px] text-white/25 hover:text-[#D4AF37] transition-colors">$CHERO Token</Link></li>
              <li><Link href="/dashboard/send" className="text-[11px] text-white/25 hover:text-[#D4AF37] transition-colors">Transfers</Link></li>
              <li><Link href="/dashboard/ai" className="text-[11px] text-white/25 hover:text-[#D4AF37] transition-colors">AI Banking</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-[11px] text-white/25 hover:text-[#D4AF37] transition-colors">About Us</Link></li>
              <li><Link href="/careers" className="text-[11px] text-white/25 hover:text-[#D4AF37] transition-colors">Careers</Link></li>
              <li><a href="#" className="text-[11px] text-white/25 hover:text-[#D4AF37] transition-colors">Press</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/legal" className="text-[11px] text-white/25 hover:text-[#D4AF37] transition-colors">Terms</Link></li>
              <li><Link href="/legal" className="text-[11px] text-white/25 hover:text-[#D4AF37] transition-colors">Privacy</Link></li>
              <li><a href="#" className="text-[11px] text-white/25 hover:text-[#D4AF37] transition-colors">AML Policy</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Support</h4>
            <ul className="space-y-2">
              <li><Link href="/support" className="text-[11px] text-white/25 hover:text-[#D4AF37] transition-colors">Help Center</Link></li>
              <li><Link href="/support" className="text-[11px] text-white/25 hover:text-[#D4AF37] transition-colors">Contact</Link></li>
              <li><a href="#" className="text-[11px] text-white/25 hover:text-[#D4AF37] transition-colors">Status</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/5 pt-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-white/15">&copy; {new Date().getFullYear()} Cherokee Digital Bank. All rights reserved.</p>
          <div className="flex items-center gap-3 text-[10px] text-white/15">
            <span>PCI DSS</span>
            <span className="w-px h-2.5 bg-white/10" />
            <span>SOC 2</span>
            <span className="w-px h-2.5 bg-white/10" />
            <span>ISO 27001</span>
            <span className="w-px h-2.5 bg-white/10" />
            <span>GDPR</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
