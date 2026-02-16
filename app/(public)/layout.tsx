import { Navbar } from "@/src/components/layout/navbar";
import { Footer } from "@/src/components/layout/footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#050810]">
      {/* Globe background */}
      <div className="globe-bg" />
      <Navbar />
      <main className="flex-1 pt-16 relative">
        <div className="fixed inset-0 star-field pointer-events-none opacity-30" />
        <div className="relative z-10">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
