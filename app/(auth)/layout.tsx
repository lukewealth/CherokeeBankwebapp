import { CherokeeBankLogo } from "@/src/components/layout";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#050810] p-6 relative">
      {/* Globe background */}
      <div className="globe-bg" />
      {/* Background effects */}
      <div className="fixed inset-0 star-field pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="relative z-10 mb-8">
        <CherokeeBankLogo size="large" />
      </div>
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
