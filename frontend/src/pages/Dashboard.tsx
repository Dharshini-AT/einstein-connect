import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "@/lib/api";
import { Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GRADE_ICONS = ["menu_book", "science", "functions", "history_edu", "language", "calculate"];
const GRADE_COLORS = [
  { bg: "bg-blue-50",   icon: "text-[#000666]", hover: "group-hover:bg-[#000666] group-hover:text-white",   status: "bg-green-100 text-green-700",  statusLabel: "In Progress" },
  { bg: "bg-teal-50",   icon: "text-[#006a6a]", hover: "group-hover:bg-[#006a6a] group-hover:text-white",   status: "bg-amber-100 text-amber-700",  statusLabel: "Up Next"     },
  { bg: "bg-purple-50", icon: "text-purple-700", hover: "group-hover:bg-purple-700 group-hover:text-white",  status: "bg-slate-100 text-slate-700",  statusLabel: "Tomorrow"    },
  { bg: "bg-rose-50",   icon: "text-rose-700",   hover: "group-hover:bg-rose-700 group-hover:text-white",    status: "bg-blue-100 text-blue-700",    statusLabel: "Scheduled"   },
  { bg: "bg-amber-50",  icon: "text-amber-700",  hover: "group-hover:bg-amber-700 group-hover:text-white",   status: "bg-green-100 text-green-700",  statusLabel: "In Progress" },
  { bg: "bg-indigo-50", icon: "text-indigo-700", hover: "group-hover:bg-indigo-700 group-hover:text-white",  status: "bg-slate-100 text-slate-700",  statusLabel: "Planned"     },
];

const DAILY_FEED = [
  { icon: "groups",           bgColor: "bg-blue-50",  iconColor: "text-[#000666]",  hoverBg: "group-hover:bg-[#000666]",  title: "Staff Meeting",            sub: "2:00 PM • Seminar Hall"      },
  { icon: "assignment_late",  bgColor: "bg-red-50",   iconColor: "text-[#ba1a1a]",  hoverBg: "group-hover:bg-[#ba1a1a]",  title: "Submit Grade 8 Reports",   sub: "Due by 5:00 PM Today"        },
  { icon: "call",             bgColor: "bg-green-50", iconColor: "text-[#006a6a]",  hoverBg: "group-hover:bg-[#006a6a]",  title: "Parent Call: Aryan V.",     sub: "Tomorrow at 9:00 AM"         },
  { icon: "edit_note",        bgColor: "bg-slate-50", iconColor: "text-[#767683]",  hoverBg: "group-hover:bg-slate-300",  title: "Curriculum Review",        sub: "Friday morning slot"          },
];

const NAV = [
  { icon: "dashboard",    label: "Dashboard",     path: "/dashboard"           },
  { icon: "group",        label: "Students",      path: "/students"            }, 
  { icon: "analytics",    label: "Reports",       path: "/reports"             },
  { icon: "settings",     label: "Settings",      path: "/settings"            },
];

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { pathname } = useLocation();
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showClasses, setShowClasses] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const firstName = user?.name?.split(" ")[0] || "Faculty";

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const assignedGrades: string[] = user?.assignedGrades || [];
        const gradeData = await Promise.all(
          assignedGrades.map(async (grade: string) => {
            const students = await api.get(`/grades/${encodeURIComponent(grade)}/students`);
            return { grade, students };
          })
        );
        setGrades(gradeData);
      } catch (err) {
        console.error("Failed to fetch grade data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, []);

  const barData = [
    { label: "Maths",    pct: 82, active: false },
    { label: "Science",  pct: 65, active: false },
    { label: "English",  pct: 98, active: true  },
    { label: "History",  pct: 76, active: false },
    { label: "Language", pct: 72, active: false },
  ];

  return (
    <div className="flex min-h-screen bg-[#f9f9fb]" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* ── Persistent Navy Sidebar ── */}
      <aside className="h-screen w-72 fixed left-0 top-0 flex flex-col bg-[#000666] text-white z-[60] shadow-2xl">
        {/* Brand */}
        <div className="px-8 py-8 flex items-center gap-3">
          <span className="material-symbols-outlined text-white" style={{ fontSize: 32 }}>school</span>
          <span className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: "Manrope, sans-serif" }}>Einstein Matric</span>
        </div>
        <div className="px-6 mb-6">
          <div className="h-px bg-white/10 w-full" />
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-4 flex-grow">
          {NAV.map(item => {
            const active = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  if (item.path === "/students") {
                    setShowClasses(true);
                  } else if (item.path.startsWith("/admin") || item.path === "/dashboard") {
                    navigate(item.path);
                  } else {
                    toast({ title: "Coming Soon", description: `${item.label} module is under development.` });
                  }
                }}
                className={`flex items-center gap-4 rounded-xl px-6 py-4 font-bold transition-all text-left w-full text-sm tracking-wide ${active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"}`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

      </aside>

      {/* ── Top App Bar ── */}
      <header className="fixed top-0 left-72 right-0 z-50 bg-white border-b border-[#e2e2e4] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6 flex-1 max-w-3xl">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#767683]">search</span>
            <input
              className="w-full bg-[#f3f3f5] border-none rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#000666]/20 placeholder:text-[#767683]"
              placeholder="Search students, records or classes..."
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-slate-100 transition-colors">
            <span className="material-symbols-outlined text-slate-600">notifications</span>
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-[#e2e2e4]">
            <div className="text-right">
              <p className="text-xs font-bold text-[#1a1c1d]">{user.name || "Faculty"}</p>
              <p className="text-[10px] text-[#767683]">{user.subject || "Teacher"}</p>
            </div>
            <button
              onClick={() => setShowProfile(true)}
              className="w-10 h-10 rounded-full bg-[#e0e0ff] flex items-center justify-center text-[#000666] font-bold text-lg border border-[#e2e2e4] hover:ring-2 hover:ring-[#000666]/20 transition"
            >
              {(user.name || "F").charAt(0)}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Canvas ── */}
      <main className="ml-72 pt-20 px-8 pb-12 min-h-screen w-full">
        {/* Hero */}
        <section className="mt-8 mb-10">
          <div className="relative rounded-3xl overflow-hidden bg-[#000666] p-12 text-white shadow-xl min-h-[280px] flex items-center">
            <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }} />
            <div className="relative z-20 max-w-2xl">
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold tracking-widest uppercase mb-6">Instructor Portal</span>
              <h1 className="text-5xl font-extrabold tracking-tight mb-4" style={{ fontFamily: "Manrope, sans-serif" }}>
                Welcome, {firstName}!
              </h1>
              <p className="text-[#bdc2ff] text-lg font-medium leading-relaxed max-w-xl">
                You have {grades.length} grade{grades.length !== 1 ? "s" : ""} assigned this term.
                {loading ? "" : ` Total of ${grades.reduce((sum, g) => sum + g.students.length, 0)} students in your classes.`}
              </p>
              <div className="mt-8 flex gap-4">
                <button 
                  onClick={() => toast({ title: "Session Started", description: "The morning session has been initialized." })}
                  className="bg-[#006a6a] px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  Start Morning Session
                </button>
                <button 
                  onClick={() => toast({ title: "Requests", description: "You have 3 pending student requests." })}
                  className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl font-bold text-sm transition-all"
                >
                  Review Requests
                </button>
              </div>
            </div>
            {/* Decorative right gradient blob */}
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#1a237e]/60 to-transparent" />
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* ── Left: Assigned Classes + Bar Chart ── */}
          <div className="xl:col-span-2 space-y-8">
            {/* Assigned Classes */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#000666] tracking-tight" style={{ fontFamily: "Manrope, sans-serif" }}>Assigned Classes</h2>
                <button onClick={() => setShowClasses(true)} className="text-[#006a6a] font-bold text-sm flex items-center gap-1 hover:underline">
                  View Full Schedule <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>

              {loading ? (
                <div className="flex items-center gap-2 text-slate-400 py-12"><Loader2 className="h-5 w-5 animate-spin" /> Loading classes...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {grades.map((g, idx) => {
                    const col = GRADE_COLORS[idx % GRADE_COLORS.length];
                    const icon = GRADE_ICONS[idx % GRADE_ICONS.length];
                    return (
                      <div
                        key={g.grade}
                        className="group bg-white rounded-3xl p-6 border border-[#e2e2e4] hover:border-[#000666]/20 hover:shadow-xl transition-all duration-300 cursor-pointer"
                        onClick={() => navigate(`/students/grade/${encodeURIComponent(g.grade)}`)}
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div className={`w-12 h-12 ${col.bg} rounded-xl flex items-center justify-center ${col.icon} ${col.hover} transition-all`}>
                            <span className="material-symbols-outlined text-2xl">{icon}</span>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 ${col.status} rounded-full text-[10px] font-bold uppercase tracking-wider`}>{col.statusLabel}</span>
                            <p className="text-[10px] text-[#767683] mt-1 font-medium">
                              {user.subject || "General"}
                            </p>
                          </div>
                        </div>
                        <h3 className="text-2xl font-extrabold text-[#000666] mb-1" style={{ fontFamily: "Manrope, sans-serif" }}>{g.grade}</h3>
                        <p className="text-[#767683] text-xs mb-6">{user.subject || "General Studies"}</p>
                        <div className="flex items-center justify-between bg-[#f3f3f5] rounded-xl p-4 mb-6">
                          <div>
                            <p className="text-[10px] font-bold text-[#767683] uppercase mb-1">Students</p>
                            <p className="text-xl font-bold text-[#1a1c1d]">{g.students.length}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-[#767683] uppercase mb-1">Grade</p>
                            <p className="text-xl font-bold text-[#1a1c1d]">{g.grade.replace("Grade ", "")}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="flex-1 bg-[#000666] text-white py-2.5 rounded-xl text-xs font-bold hover:bg-[#1a237e] transition-colors"
                            onClick={e => { e.stopPropagation(); navigate(`/students/grade/${encodeURIComponent(g.grade)}`); }}
                          >
                            View Students
                          </button>
                          <button className="w-10 h-10 flex items-center justify-center bg-[#e8e8ea] rounded-xl text-[#000666] hover:bg-[#e0e0ff] transition-colors">
                            <span className="material-symbols-outlined text-xl">chevron_right</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}

                </div>
              )}
            </section>

            {/* Performance Analytics Bar Chart */}
            <section className="bg-white rounded-3xl p-8 border border-[#e2e2e4] shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-[#000666]" style={{ fontFamily: "Manrope, sans-serif" }}>Performance Analytics</h3>
                <select className="bg-[#f3f3f5] border-none rounded-lg text-xs font-bold py-2 pl-4 pr-8 focus:outline-none">
                  <option>Last 30 Days</option>
                  <option>Last Quarter</option>
                </select>
              </div>
              <div className="h-56 flex items-end justify-between gap-4 px-4">
                {barData.map(bar => (
                  <div key={bar.label} className="w-full relative group h-full flex flex-col justify-end bg-[#006a6a]/5 rounded-t-2xl">
                    <div
                      className={`${bar.active ? "bg-[#006a6a]" : "bg-[#006a6a]/40"} rounded-t-2xl w-full transition-all duration-500 relative`}
                      style={{ height: `${bar.pct}%` }}
                    >
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-bold text-[#006a6a] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {bar.pct}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-6 px-2 text-[10px] font-bold text-[#767683] tracking-widest uppercase">
                {barData.map(bar => (
                  <span key={bar.label} className="w-full text-center">{bar.label}</span>
                ))}
              </div>
            </section>
          </div>

          {/* ── Right: Daily Feed + Resource Center ── */}
          <div className="space-y-8">
            {/* Daily Feed */}
            <section className="bg-white rounded-3xl p-8 border border-[#e2e2e4] shadow-sm">
              <h3 className="text-xl font-bold text-[#000666] mb-8" style={{ fontFamily: "Manrope, sans-serif" }}>Daily Feed</h3>
              <div className="space-y-6">
                {DAILY_FEED.map((item, idx) => (
                  <div key={idx} className="flex gap-4 group cursor-pointer">
                    <div className={`w-12 h-12 rounded-2xl ${item.bgColor} ${item.iconColor} flex items-center justify-center shrink-0 ${item.hoverBg} group-hover:text-white transition-all`}>
                      <span className="material-symbols-outlined">{item.icon}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1a1c1d]">{item.title}</p>
                      <p className="text-xs text-[#767683] mt-1 font-medium">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => toast({ title: "Tasks", description: "Viewing all daily tasks and reminders." })}
                className="w-full mt-8 py-4 bg-[#f3f3f5] text-[#000666] font-bold rounded-2xl text-sm hover:bg-[#e8e8ea] transition-colors"
              >
                View All Tasks
              </button>
            </section>

          </div>
        </div>
      </main>

      {/* ── FAB ── */}
      <button className="fixed bottom-8 right-8 w-16 h-16 bg-[#006a6a] text-white rounded-2xl flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all z-40 group">
        <span className="material-symbols-outlined text-4xl group-hover:rotate-90 transition-transform">add</span>
      </button>

      {/* ── Faculty Profile Overlay ── */}
      {showProfile && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[50] flex justify-end items-start p-4 md:p-6"
          onClick={() => setShowProfile(false)}
        >
          <div
            className="w-full max-w-sm bg-white shadow-2xl rounded-[2rem] overflow-hidden flex flex-col mt-16"
            onClick={e => e.stopPropagation()}
          >
            {/* Header Strip */}
            <div className="h-32 bg-gradient-to-br from-[#000666] to-[#1a237e] relative">
              <div className="absolute inset-0 opacity-20 bg-gradient-to-tr from-white/40 to-transparent" />
              <button
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
                onClick={() => setShowProfile(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* Body */}
            <div className="px-8 pb-8 -mt-16 relative flex flex-col">
              {/* Avatar */}
              <div className="mx-auto mb-6 relative">
                <div className="w-32 h-32 rounded-[2rem] border-4 border-white bg-[#e0e0ff] flex items-center justify-center text-[#000666] font-extrabold text-4xl shadow-xl">
                  {(user.name || "F").charAt(0)}
                </div>
                <div className="absolute bottom-2 right-2 bg-white p-1.5 rounded-full shadow-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                </div>
              </div>
              {/* Name */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-extrabold text-[#000666] tracking-tight" style={{ fontFamily: "Manrope, sans-serif" }}>{user.name}</h2>
                <p className="text-[#767683] uppercase tracking-widest text-[11px] mt-1 font-semibold">{user.subject || "Faculty"}</p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <span className="px-3 py-1 bg-[#90efef] text-[#006e6e] text-[10px] font-bold uppercase rounded-full">Active</span>
                  <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>circle</span> Present
                  </span>
                </div>
              </div>
              {/* Detail rows */}
              <div className="space-y-3 mb-8">
                {[
                  { icon: "id_card",  label: "Faculty ID",   value: user.facultyId || "FAC-001"          },
                  { icon: "mail",     label: "Email",        value: user.email || "—"                     },
                  { icon: "schedule", label: "Grades",       value: (user.assignedGrades || []).join(", ") },
                ].map(row => (
                  <div key={row.label} className="flex items-center p-4 bg-[#f3f3f5] rounded-2xl hover:bg-[#e0e0ff]/40 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#000666] shadow-sm mr-4">
                      <span className="material-symbols-outlined">{row.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-widest text-[#767683]">{row.label}</p>
                      <p className="text-sm font-bold text-[#000666] truncate">{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Actions */}
              <div className="pt-6 border-t border-[#e2e2e4] flex flex-col gap-3">
                <button className="w-full py-4 bg-[#e8e8ea] hover:bg-[#e2e2e4] text-[#000666] font-bold rounded-2xl flex items-center justify-center gap-2 transition-all">
                  <span className="material-symbols-outlined">manage_accounts</span> Manage Profile
                </button>
                <button
                  onClick={() => { localStorage.clear(); navigate("/"); }}
                  className="w-full py-4 bg-red-50 hover:bg-[#ba1a1a] hover:text-white text-[#ba1a1a] font-bold rounded-2xl flex items-center justify-center gap-2 transition-all"
                >
                  <span className="material-symbols-outlined">logout</span> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ── Assigned Classes Modal ── */}
      {showClasses && (
        <AssignedClassesModal
          grades={grades}
          user={user}
          onClose={() => setShowClasses(false)}
          navigate={navigate}
        />
      )}
    </div>
  );
};

export default FacultyDashboard;

// ── Assigned Classes Modal (exported separately for reuse)
export const AssignedClassesModal = ({ grades, user, onClose, navigate }: any) => {
  const CARD_ICONS = ["auto_stories", "analytics", "functions", "calculate", "science", "history_edu"];
  const BG_ICONS   = ["calculate",    "functions", "auto_stories", "science", "analytics", "menu_book"];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-[#000666]/20 backdrop-blur-md" />
      <div className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-8 pb-0">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-[2rem] bg-[#e0e0ff] flex items-center justify-center text-[#000666] font-extrabold text-4xl rotate-3 hover:rotate-0 transition-transform duration-500 ring-4 ring-[#e0e0ff]">
                  {(user?.name || "F").charAt(0)}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-[#006a6a] text-white p-1.5 rounded-full border-4 border-white">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-black tracking-[0.2em] text-[#006a6a] bg-[#90efef] px-2 py-1 rounded-md">Senior Faculty</span>
                <h3 className="text-3xl font-extrabold text-[#000666] tracking-tighter mt-2" style={{ fontFamily: 'Manrope, sans-serif' }}>{user?.name}</h3>
                <p className="text-[#454652]">Department of {user?.subject || "General Studies"}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#e8e8ea] transition-colors">
              <span className="material-symbols-outlined text-[#767683]">close</span>
            </button>
          </div>
          <div className="mt-10 mb-6 flex items-center gap-2">
            <span className="w-8 h-[2px] bg-[#006a6a]" />
            <h4 className="text-sm font-black uppercase tracking-[0.15em] text-[#000666]">Assigned Classes</h4>
          </div>
        </div>

        {/* Bento Cards */}
        <div className="p-8 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {grades.map((g: any, idx: number) => (
            <button
              key={g.grade}
              onClick={() => { onClose(); navigate(`/students/grade/${encodeURIComponent(g.grade)}`); }}
              className="group relative flex flex-col text-left p-8 bg-[#f3f3f5] hover:bg-[#e0e0ff]/60 transition-all duration-300 rounded-[1.5rem] overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined" style={{ fontSize: 96 }}>{BG_ICONS[idx % BG_ICONS.length]}</span>
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-[#000666] group-hover:text-white transition-colors text-[#000666]">
                  <span className="material-symbols-outlined">{CARD_ICONS[idx % CARD_ICONS.length]}</span>
                </div>
                <h5 className="text-2xl font-bold text-[#000666] mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>{g.grade}</h5>
                <p className="text-[#454652] font-medium text-sm">{g.students.length} Students Enrolled</p>
              </div>
              <div className="mt-8 flex items-center gap-2 text-[#006a6a] font-bold text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                <span>View Records</span>
                <span className="material-symbols-outlined text-sm">arrow_forward_ios</span>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-[#f3f3f5]/60 flex justify-between items-center">
          <div className="flex -space-x-3">
            {['#cbd5e1','#94a3b8','#e2e8f0'].map((c, i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white" style={{ backgroundColor: c }} />
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-white bg-[#1a237e] flex items-center justify-center text-[10px] text-white font-bold">+{Math.max(0, grades.length - 2)}</div>
          </div>
          <button className="text-[#000666] font-bold text-xs uppercase tracking-widest hover:text-[#006a6a] transition-colors">Manage All Assignments</button>
        </div>
      </div>
    </div>
  );
};
