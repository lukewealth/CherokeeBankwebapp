export default function CareersPage() {
  const positions = [
    { title: 'Senior Full-Stack Engineer', dept: 'Engineering', location: 'Remote', type: 'Full-time', icon: 'code' },
    { title: 'Blockchain Developer', dept: 'Engineering', location: 'Remote', type: 'Full-time', icon: 'link' },
    { title: 'ML / AI Engineer', dept: 'AI & Data', location: 'Remote', type: 'Full-time', icon: 'psychology' },
    { title: 'Product Designer', dept: 'Design', location: 'Remote', type: 'Full-time', icon: 'palette' },
    { title: 'Compliance Officer', dept: 'Legal', location: 'New York, NY', type: 'Full-time', icon: 'gavel' },
    { title: 'Customer Support Lead', dept: 'Operations', location: 'Remote', type: 'Full-time', icon: 'support_agent' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="mb-12">
        <span className="px-3 py-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
          Careers
        </span>
        <h1 className="text-5xl font-extrabold text-white mt-6 mb-4">Join Our Team</h1>
        <p className="text-lg text-white/40 max-w-xl">
          Help us build the future of digital banking. We&apos;re looking for passionate people
          who want to make finance accessible to everyone.
        </p>
      </div>

      <div className="space-y-4">
        {positions.map((pos) => (
          <div key={pos.title} className="cherokee-card p-6 flex items-center justify-between hover:border-[#D4AF37]/20 transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
                <span className="material-icons text-[#D4AF37] text-lg">{pos.icon}</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{pos.title}</h3>
                <p className="text-sm text-white/30 mt-0.5">{pos.dept} · {pos.location} · {pos.type}</p>
              </div>
            </div>
            <span className="text-[#D4AF37] text-sm font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Apply <span className="material-icons text-sm">arrow_forward</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
