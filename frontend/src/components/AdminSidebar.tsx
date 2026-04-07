import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const NAV = [
  { icon: "dashboard",  label: "Dashboard",         path: "/admin/dashboard" },
  { icon: "school",     label: "Teachers",           path: "/admin/teachers"  },
  { icon: "group",      label: "Students",           path: "/admin/students"  },
  { icon: "analytics",  label: "Academic Reports",   path: "/admin/reports"   },
  { icon: "settings",   label: "Settings",           path: "/admin/settings"  },
];

const AdminSidebar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { pathname } = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-full w-[280px] z-50 bg-slate-50 flex flex-col py-8 gap-2">
      {/* Branding */}
      <div className="px-8 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1a237e] flex items-center justify-center">
            <span className="material-symbols-outlined text-white">school</span>
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-[#000666] leading-tight" style={{ fontFamily: "Manrope, sans-serif" }}>Einstein Matric</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500">Higher Secondary</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-grow flex flex-col gap-1 px-4">
        {NAV.map(item => {
          const active = pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-4 px-6 py-3 mx-0 rounded-full transition-all font-medium w-full text-left ${
                active
                  ? "bg-[#1a237e] text-white"
                  : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span className="material-symbols-outlined" style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* New Entry CTA */}
      <div className="px-4 mt-4">
        <button 
          onClick={() => toast({ title: "New Entry", description: "Opening enrollment form..." })}
          className="w-full bg-gradient-to-br from-[#000666] to-[#1a237e] text-white rounded-full py-3 px-6 font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg"
        >
          <span className="material-symbols-outlined">add</span>
          <span>New Entry</span>
        </button>
      </div>

      {/* Bottom links */}
      <div className="mt-auto border-t border-slate-200 pt-4 px-4 space-y-1">
        <button 
          onClick={() => toast({ title: "Support", description: "Contacting technical support..." })}
          className="flex items-center gap-4 text-slate-600 px-6 py-3 hover:bg-slate-200 rounded-full w-full"
        >
          <span className="material-symbols-outlined">contact_support</span>
          <span className="font-medium">Support</span>
        </button>
        <button
          onClick={() => { localStorage.clear(); navigate("/"); }}
          className="flex items-center gap-4 text-red-500 px-6 py-3 hover:bg-red-50 rounded-full w-full"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
