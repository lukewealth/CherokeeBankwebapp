import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#050810] py-12">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <Link href="/">
          <Image
            src="/branding/logos/cherokee-logo.png"
            alt="Cherokee Digital"
            width={50}
            height={25}
            className="object-contain"
            style={{ width: 'auto', height: 'auto' }}
          />
        </Link>
        <div className="flex gap-6 text-xs text-white/30">
          <Link href="/about" className="hover:text-[#D4AF37] transition-colors">About</Link>
          <Link href="/legal" className="hover:text-[#D4AF37] transition-colors">Terms of Service</Link>
          <Link href="/legal" className="hover:text-[#D4AF37] transition-colors">Privacy Policy</Link>
          <Link href="/support" className="hover:text-[#D4AF37] transition-colors">Support</Link>
          <Link href="/careers" className="hover:text-[#D4AF37] transition-colors">Careers</Link>
        </div>
        <p className="text-xs text-white/20">&copy; {new Date().getFullYear()} Cherokee Digital. All rights reserved.</p>
      </div>
    </footer>
  );
}
