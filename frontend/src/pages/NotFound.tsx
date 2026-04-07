import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  return (
    <div className="min-h-screen bg-[#f9f9fb] text-[#1a1c1d]" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl flex justify-between items-center w-full px-6 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#000666] flex items-center justify-center">
            <span className="material-symbols-outlined text-white">school</span>
          </div>
          <span className="text-xl font-bold text-[#000666] tracking-tight" style={{ fontFamily: "Manrope, sans-serif" }}>Einstein Matric</span>
        </div>
        <div className="hidden md:flex items-center gap-8 font-bold text-[11px] uppercase tracking-widest">
          <button onClick={() => navigate(role === "admin" ? "/admin/dashboard" : "/dashboard")} className="text-slate-500 hover:text-[#000666] transition-colors">Portals</button>
          <button className="text-slate-500 hover:text-[#000666] transition-colors">Resources</button>
          <button className="text-slate-500 hover:text-[#000666] transition-colors">Contact Support</button>
        </div>
        <button className="p-2 text-slate-500 hover:bg-slate-50 transition-colors rounded-full">
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </header>

      {/* Main 404 Canvas */}
      <main className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-6 relative overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#000666]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-[#006a6a]/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-3xl w-full text-center z-10">
          {/* Illustration */}
          <div className="mb-12 relative">
            <div className="flex justify-center mb-10">
              <div className="relative">
                <div className="w-48 h-48 bg-white rounded-[2rem] flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[#bdc2ff]" style={{ fontSize: 96, fontVariationSettings: "'wght' 200" }}>auto_stories</span>
                </div>
                {/* Floating badge – school icon */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-[#90efef] text-[#006e6e] rounded-full flex items-center justify-center shadow-lg border-4 border-[#f9f9fb] rotate-12">
                  <span className="material-symbols-outlined text-3xl">school</span>
                </div>
                {/* Floating badge – search_off */}
                <div className="absolute -bottom-6 -left-8 w-20 h-20 bg-[#1a237e] text-white rounded-full flex items-center justify-center shadow-lg border-4 border-[#f9f9fb] -rotate-12">
                  <span className="material-symbols-outlined text-4xl">search_off</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-[#006a6a] uppercase tracking-[0.2em] text-sm font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>
                Error Code 404
              </h2>
              <h1 className="text-5xl md:text-7xl font-extrabold text-[#000666] tracking-tight leading-tight" style={{ fontFamily: "Manrope, sans-serif" }}>
                Page Not Found
              </h1>
              <p className="text-[#454652] text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
                It seems this chapter has been misplaced. The record you are searching for is not available in the digital archives at this time.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate(role === "admin" ? "/admin/dashboard" : "/dashboard")}
              className="px-10 py-4 bg-gradient-to-br from-[#000666] to-[#1a237e] text-white rounded-full font-bold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-3"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              <span className="material-symbols-outlined">dashboard</span>
              Return to Dashboard
            </button>
            <button className="px-10 py-4 text-[#000666] font-bold text-lg hover:bg-[#000666]/5 rounded-full transition-all flex items-center gap-3">
              <span className="material-symbols-outlined">help_outline</span>
              Help Center
            </button>
          </div>

          {/* Contextual Links */}
          <div className="mt-20 pt-8 border-t border-[#c6c5d4]/30 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              { title: "Student Records",    desc: "Access grading modules and attendance logs directly."             },
              { title: "Academic Calendar",  desc: "View upcoming exams, holidays, and school events."               },
              { title: "Gradebook Entry",    desc: "Submit latest assessments for your designated classes."          },
            ].map(link => (
              <div key={link.title} className="group cursor-pointer">
                <h3 className="text-[#000666] font-bold mb-2 flex items-center gap-2 group-hover:text-[#006a6a] transition-colors" style={{ fontFamily: "Manrope, sans-serif" }}>
                  {link.title} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </h3>
                <p className="text-sm text-slate-500">{link.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center bg-[#f3f3f5]">
        <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400" style={{ fontFamily: "Manrope, sans-serif" }}>
          Einstein Matric Higher Secondary School © 2024 • Excellence Through Knowledge
        </p>
      </footer>
    </div>
  );
};

export default NotFound;
