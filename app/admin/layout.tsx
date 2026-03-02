import { AdminSidebar } from "@/src/components/layout/admin-sidebar";
import { Header } from "@/src/components/layout/header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#050810]">
      {/* Globe background */}
      <div className="globe-bg" />
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 relative">
          <div className="absolute inset-0 star-field pointer-events-none opacity-20" />
          <div className="relative z-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
