import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface GradeInfo {
  grade: string;
  students: any[];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [grades, setGrades] = useState<GradeInfo[]>([]);
  const [loading, setLoading] = useState(true);
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

  const gradeColors = ["#006a6a", "#000666", "#4a0072", "#b85c00", "#1a5c1a"];
  const gradeIcons = ["menu_book", "science", "calculate", "history_edu", "language"];
  const gradeRooms = ["Room 402B", "Science Lab C", "Room 201A", "Room 305", "Room 108"];

  return (
    <div className="flex min-h-screen bg-[#f9f9fb]">
      {/* Persistent Left Sidebar */}
      <aside className="h-screen w-72 fixed left-0 top-0 flex flex-col bg-[#000666] text-white z-[60] shadow-2xl">
        <div className="px-8 py-8 flex items-center gap-3">
          <span className="material-symbols-outlined text-white" style={{ fontSize: 32 }}>school</span>
          <span className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>Einstein Matric</span>
        </div>
        <div className="px-6 mb-8">
          <div className="h-px bg-white/10 w-full" />
        </div>
        <nav className="flex flex-col gap-2 px-4">
          {[
            { icon: "dashboard", label: "Dashboard", active: true, path: "/dashboard" },
            { icon: "group", label: "Students", active: false, path: "/dashboard" },
            { icon: "calendar_month", label: "Schedule", active: false, path: "/dashboard" },
            { icon: "analytics", label: "Reports", active: false, path: "/dashboard" },
            { icon: "settings", label: "Settings", active: false, path: "/dashboard" },
          ].map((item) => (
            <a
              key={item.label}
              href="#"
              onClick={(e) => { e.preventDefault(); navigate(item.path); }}
              className={`flex items-center gap-4 px-6 py-4 rounded-xl transition-all ${item.active ? "bg-white/10 text-white font-bold" : "text-white/70 hover:bg-white/5"}`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-sm tracking-wide" style={{ fontFamily: 'Manrope, sans-serif' }}>{item.label}</span>
            </a>
          ))}
        </nav>
        <div className="mt-auto m-6 p-6 bg-white/5 rounded-2xl border border-white/10">
          <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest mb-1">Current Session</p>
          <p className="text-sm font-semibold">AY 2023-2024</p>
          <div className="mt-4 flex items-center gap-2 text-[10px] bg-[#006a6a] px-2 py-1 rounded-full w-fit">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            Term 2 Active
          </div>
        </div>
      </aside>

      {/* Top App Bar */}
      <header className="fixed top-0 left-72 right-0 z-50 bg-white border-b border-[#e2e2e4] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6 flex-1 max-w-3xl">
          <div className="relative w-full max-w-md hidden sm:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#767683]" style={{ fontSize: 20 }}>search</span>
            <input className="w-full bg-[#f3f3f5] border-none rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#000666]/20 placeholder:text-[#767683]" placeholder="Search students, records or classes..." />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-slate-100 transition-colors">
            <span className="material-symbols-outlined text-slate-600">notifications</span>
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-[#e2e2e4]">
            <div className="text-right">
              <p className="text-xs font-bold text-[#1a1c1d]">{user?.name || "Faculty"}</p>
              <p className="text-[10px] text-[#767683]">{user?.facultyId || "Faculty"}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#e0e0ff] flex items-center justify-center text-[#000666] font-bold cursor-pointer" onClick={() => { localStorage.clear(); navigate("/"); }}>
              {firstName.charAt(0)}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-72 pt-20 px-8 pb-12 min-h-screen w-full">
        {/* Hero Banner */}
        <section className="mt-8 mb-10">
          <div className="relative rounded-3xl overflow-hidden bg-[#000666] p-12 md:p-16 text-white shadow-xl min-h-[300px] flex items-center">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }} />
            <div className="relative z-20 max-w-2xl">
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold tracking-widest uppercase mb-6">Instructor Portal</span>
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Welcome, {firstName}!
              </h1>
              <p className="text-[#bdc2ff] text-lg md:text-xl font-medium leading-relaxed max-w-xl">
                The Digital Atheneum is ready for today's curriculum. You have {grades.length} classes assigned.
              </p>
              <div className="mt-8 flex gap-4">
                <button className="bg-[#006a6a] px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:-translate-y-0.5 transition-all">Start Morning Session</button>
                <button className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl font-bold text-sm transition-all">View Students</button>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left: Grade Cards + Bar Chart */}
          <div className="xl:col-span-2 space-y-8">
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#000666] tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>Assigned Classes</h2>
                <button className="text-[#006a6a] font-bold text-sm flex items-center gap-1 hover:underline">
                  View Full Schedule <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
                </button>
              </div>

              {loading ? (
                <div className="flex items-center gap-2 text-[#767683] py-12 justify-center">
                  <Loader2 className="h-5 w-5 animate-spin" /> Loading classes...
                </div>
              ) : grades.length === 0 ? (
                <p className="text-[#767683] text-sm">No grades assigned yet. Contact the admin.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {grades.map((g, idx) => {
                    const color = gradeColors[idx % gradeColors.length];
                    const icon = gradeIcons[idx % gradeIcons.length];
                    const room = gradeRooms[idx % gradeRooms.length];
                    const totalStudents = g.students.length;
                    return (
                      <div
                        key={g.grade}
                        className="group bg-white rounded-3xl p-8 border border-[#e2e2e4] hover:border-[#000666]/20 hover:shadow-xl transition-all duration-300 cursor-pointer"
                        onClick={() => navigate(`/students/grade/${encodeURIComponent(g.grade)}`)}
                      >
                        <div className="flex justify-between items-start mb-10">
                          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-[#000666] group-hover:bg-[#000666] group-hover:text-white transition-all">
                            <span className="material-symbols-outlined" style={{ fontSize: 36 }}>{icon}</span>
                          </div>
                          <div className="text-right">
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wider">Active</span>
                            <p className="text-xs text-[#767683] mt-2 font-medium">{room}</p>
                          </div>
                        </div>
                        <h3 className="text-4xl font-extrabold text-[#000666] mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>{g.grade}</h3>
                        <p className="text-[#767683] text-sm mb-8">Assigned Class · Mathematics</p>
                        <div className="grid grid-cols-2 gap-4 mb-8">
                          <div className="bg-[#f3f3f5] rounded-2xl p-4">
                            <p className="text-[10px] font-bold text-[#767683] uppercase mb-1">Total Students</p>
                            <p className="text-2xl font-bold text-[#1a1c1d]">{totalStudents}</p>
                          </div>
                          <div className="bg-[#f3f3f5] rounded-2xl p-4">
                            <p className="text-[10px] font-bold text-[#767683] uppercase mb-1">Subjects</p>
                            <p className="text-2xl font-bold text-[#1a1c1d]">1</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            className="flex-1 bg-[#000666] text-white py-3 rounded-xl text-xs font-bold hover:bg-[#000666]/90 transition-colors"
                            onClick={(e) => { e.stopPropagation(); navigate(`/students/grade/${encodeURIComponent(g.grade)}`); }}
                          >
                            View Students
                          </button>
                          <button className="w-12 h-12 flex items-center justify-center bg-[#e8e8ea] rounded-xl text-[#000666] hover:bg-[#bdc2ff] transition-colors">
                            <span className="material-symbols-outlined">chevron_right</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Performance Bar Chart */}
            <section className="bg-white rounded-3xl p-8 border border-[#e2e2e4] shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-[#000666]" style={{ fontFamily: 'Manrope, sans-serif' }}>Performance Analytics</h3>
                <select className="bg-[#f3f3f5] border-none rounded-lg text-xs font-bold py-2 pl-4 pr-8 focus:outline-none">
                  <option>Last 30 Days</option>
                  <option>Last Quarter</option>
                </select>
              </div>
              <div className="h-64 flex items-end justify-between gap-4 px-4">
                {[82, 65, 98, 76, 72].map((pct, i) => (
                  <div key={i} className="w-full bg-[#006a6a]/5 rounded-t-2xl relative group h-full flex flex-col justify-end">
                    <div
                      className="bg-[#006a6a]/40 rounded-t-2xl w-full transition-all duration-500 group-hover:bg-[#006a6a] relative"
                      style={{ height: `${pct}%` }}
                    >
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold text-[#006a6a] opacity-0 group-hover:opacity-100 transition-opacity">{pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-6 px-4">
                {["English", "Mathematics", "Science", "History", "Language"].map((label) => (
                  <span key={label} className="w-full text-center text-[10px] font-bold text-[#767683] tracking-widest uppercase">{label}</span>
                ))}
              </div>
            </section>
          </div>

          {/* Right: Daily Feed + Resource Card */}
          <div className="space-y-8">
            <section className="bg-white rounded-3xl p-8 border border-[#e2e2e4] shadow-sm">
              <h3 className="text-xl font-bold text-[#000666] mb-8" style={{ fontFamily: 'Manrope, sans-serif' }}>Daily Feed</h3>
              <div className="space-y-8">
                {[
                  { icon: "groups", label: "Staff Meeting", sub: "2:00 PM • Seminar Hall", bg: "bg-blue-50", color: "text-[#000666]" },
                  { icon: "assignment_late", label: "Submit Grade Reports", sub: "Due by 5:00 PM Today", bg: "bg-red-50", color: "text-[#ba1a1a]" },
                  { icon: "call", label: "Parent Call: Student", sub: "Tomorrow at 9:00 AM", bg: "bg-green-50", color: "text-[#006a6a]" },
                  { icon: "edit_note", label: "Curriculum Review", sub: "Friday morning slot", bg: "bg-slate-50", color: "text-[#767683]" },
                ].map((item) => (
                  <div key={item.label} className="flex gap-4 group cursor-pointer">
                    <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center shrink-0 group-hover:bg-[#000666] group-hover:text-white transition-all`}>
                      <span className="material-symbols-outlined">{item.icon}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1a1c1d]">{item.label}</p>
                      <p className="text-xs text-[#767683] mt-1 font-medium">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-10 py-4 bg-[#f3f3f5] text-[#000666] font-bold rounded-2xl text-sm hover:bg-[#e8e8ea] transition-colors">
                View All Tasks
              </button>
            </section>

            <section className="bg-[#1a237e] rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
              <div className="relative z-10">
                <h4 className="text-lg font-bold mb-2">Resource Center</h4>
                <p className="text-white/70 text-xs mb-6 leading-relaxed">Access teaching materials, question banks, and digital textbooks for your assigned grades.</p>
                <button className="bg-white text-[#000666] px-6 py-2 rounded-xl text-xs font-bold hover:bg-white/90 transition-all">Browse Materials</button>
              </div>
              <span className="material-symbols-outlined absolute -right-4 -bottom-4 opacity-10" style={{ fontSize: 120 }}>auto_stories</span>
            </section>
          </div>
        </div>
      </main>

      {/* FAB */}
      <button className="fixed bottom-8 right-8 w-16 h-16 bg-[#006a6a] text-white rounded-2xl flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all z-40 group">
        <span className="material-symbols-outlined group-hover:rotate-90 transition-transform" style={{ fontSize: 36 }}>add</span>
      </button>
    </div>
  );
};

export default Dashboard;
