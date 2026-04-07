import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, X } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import AdminSidebar from "@/components/AdminSidebar";

const TeachersRegistry = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [page, setPage] = useState(1);
  const ITEMS = 10;

  const SUBJECTS = ["All", "Mathematics", "Science", "Language I", "Language II", "Social Science", "Chemistry", "Physics", "Computer Science", "Biology"];

  useEffect(() => {
    api.get("/faculty")
      .then(t => setTeachers(t))
      .catch(e => toast({ title: "Error", description: e.message, variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  const filtered = teachers.filter(t =>
    (subjectFilter === "All" || t.subject === subjectFilter) &&
    (t.name?.toLowerCase().includes(search.toLowerCase()) ||
     t.facultyId?.toLowerCase().includes(search.toLowerCase()) ||
     t.email?.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filtered.length / ITEMS);
  const paged = filtered.slice((page - 1) * ITEMS, page * ITEMS);
  const DEPT_COLOR: Record<string, string> = {
    "Mathematics":      "bg-blue-50 text-blue-800 border-blue-200",
    "Science":          "bg-green-50 text-green-800 border-green-200",
    "Language I":       "bg-purple-50 text-purple-800 border-purple-200",
    "Language II":      "bg-pink-50 text-pink-800 border-pink-200",
    "Social Science":   "bg-amber-50 text-amber-800 border-amber-200",
    "Chemistry":        "bg-cyan-50 text-cyan-800 border-cyan-200",
    "Physics":          "bg-indigo-50 text-indigo-800 border-indigo-200",
    "Computer Science": "bg-violet-50 text-violet-800 border-violet-200",
    "Biology":          "bg-emerald-50 text-emerald-800 border-emerald-200",
  };

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <AdminSidebar />

      {/* Top App Bar */}
      <header className="fixed top-0 left-[280px] right-0 z-40 bg-white/80 backdrop-blur-xl h-16 flex items-center px-8 gap-4">
        <div className="relative flex-1 max-w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 20 }}>search</span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-[#e8e8ea] border-none rounded-md focus:outline-none focus:ring-2 focus:ring-[#006a6a] text-sm"
            placeholder="Search faculty records..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex items-center gap-2 ml-2">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Filter:</span>
          <select
            className="bg-transparent border-none text-sm font-semibold text-[#000666] focus:outline-none cursor-pointer"
            value={subjectFilter}
            onChange={e => { setSubjectFilter(e.target.value); setPage(1); }}
          >
            {SUBJECTS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full"><span className="material-symbols-outlined">notifications</span></button>
          <div>
            <p className="text-sm font-bold text-[#000666] text-right">Admin</p>
            <p className="text-[10px] uppercase tracking-tighter text-slate-500">Principal Administrator</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#e0e0ff] flex items-center justify-center text-[#000666] font-bold">A</div>
        </div>
      </header>

      <main className="ml-[280px] pt-24 px-12 pb-12">
        {/* Page Header */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-4xl font-extrabold text-[#000666] tracking-tight mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>Teachers Registry</h2>
            <p className="text-slate-500 font-medium">Manage faculty information, academic assignments, and subject roles.</p>
          </div>
          <button 
            onClick={() => toast({ title: "New Faculty onboarding", description: "Opening registration form..." })}
            className="bg-gradient-to-br from-[#000666] to-[#1a237e] text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg hover:scale-[0.98] transition-transform"
          >
            <span className="material-symbols-outlined">add</span> New Entry
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          {[
            { label: "Total Faculty",   value: teachers.length, border: "border-[#006a6a]", sub: `${teachers.length} active`,   icon: "trending_up" },
            { label: "Subjects Taught", value: 9,               border: "border-[#1a237e]", sub: "Across all grades",            icon: "menu_book"   },
            { label: "Grades Covered",  value: 12,              border: "border-slate-300", sub: "Grades 1 – 12",                icon: "class"       },
            { label: "Filtered",        value: filtered.length, border: "border-[#006a6a]", sub: "Current view",                 icon: "filter_list" },
          ].map(stat => (
            <div key={stat.label} className={`bg-white p-6 rounded-xl border-l-4 ${stat.border} shadow-sm`}>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
              <p className="text-3xl font-extrabold text-[#000666]" style={{ fontFamily: "Manrope, sans-serif" }}>{stat.value}</p>
              <p className="text-xs text-[#006a6a] mt-2 font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">{stat.icon}</span> {stat.sub}
              </p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-[#f3f3f5] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-24 gap-2 text-slate-400"><Loader2 className="h-5 w-5 animate-spin" /> Loading...</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#e8e8ea]">
                    {["Faculty Member", "Employee ID", "Subject / Department", "Assigned Grades", "Actions"].map(h => (
                      <th key={h} className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white">
                  {paged.map(t => (
                    <tr key={t._id} className="hover:bg-[#e2e2e4]/50 transition-colors cursor-pointer group" onClick={() => setSelectedTeacher(t)}>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-11 h-11 rounded-full bg-[#93f2f2] flex items-center justify-center text-[#006a6a] font-bold text-sm">
                              {t.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#000666]">{t.name}</p>
                            <p className="text-[11px] text-slate-500">{t.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-mono text-slate-600">{t.facultyId}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full border ${DEPT_COLOR[t.subject || ""] || "bg-white text-[#000666] border-[#e2e2e4]"}`}>
                          {t.subject || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-1">
                          {(t.assignedGrades || []).slice(0, 3).map((g: string) => (
                            <span key={g} className="px-2 py-0.5 bg-[#006a6a]/10 text-[#006a6a] text-[10px] font-bold rounded-md">{g}</span>
                          ))}
                          {(t.assignedGrades?.length || 0) > 3 && (
                            <span className="px-2 py-0.5 bg-slate-200 text-slate-500 text-[10px] font-bold rounded-md">+{t.assignedGrades.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button className="p-2 text-slate-400 hover:text-[#000666] transition-colors" onClick={e => { e.stopPropagation(); setSelectedTeacher(t); }}>
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {paged.length === 0 && (
                    <tr><td colSpan={5} className="py-16 text-center text-slate-400">No teachers found</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div className="px-8 py-5 flex justify-between items-center bg-slate-50">
            <p className="text-xs font-medium text-slate-500">Showing {Math.min((page-1)*ITEMS+1, filtered.length)}–{Math.min(page*ITEMS, filtered.length)} of {filtered.length} teachers</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white text-slate-400 disabled:opacity-30">
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(pg => (
                <button key={pg} onClick={() => setPage(pg)} className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-bold ${page === pg ? "bg-[#000666] text-white" : "hover:bg-white text-slate-600"}`}>{pg}</button>
              ))}
              {totalPages > 5 && <span className="text-slate-400">...</span>}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white text-slate-400 disabled:opacity-30">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Teacher Detail Modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 z-[60] bg-[#1a1c1d]/40 backdrop-blur-sm flex items-center justify-center" onClick={() => setSelectedTeacher(null)}>
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#93f2f2] flex items-center justify-center text-[#006a6a] font-bold text-2xl">
                    {selectedTeacher.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#000666]" style={{ fontFamily: "Manrope, sans-serif" }}>{selectedTeacher.name}</h3>
                    <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">{selectedTeacher.subject} Department</p>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedTeacher.email}</p>
                  </div>
                </div>
                <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100" onClick={() => setSelectedTeacher(null)}>
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3">Assigned Grades ({(selectedTeacher.assignedGrades || []).length} Total)</p>
                <div className="grid grid-cols-2 gap-3">
                  {(selectedTeacher.assignedGrades || []).map((g: string) => (
                    <button
                      key={g}
                      onClick={() => { setSelectedTeacher(null); navigate(`/students/grade/${encodeURIComponent(g)}`); }}
                      className="bg-[#f3f3f5] p-4 rounded-xl border-l-4 border-[#006a6a] text-left hover:bg-[#90efef]/20 transition-colors group"
                    >
                      <p className="text-sm font-bold text-[#000666]">{g}</p>
                      <p className="text-xs text-slate-500 mt-1">{selectedTeacher.subject}</p>
                      <p className="text-[10px] text-[#006a6a] mt-2 flex items-center gap-1 group-hover:underline">
                        <span className="material-symbols-outlined" style={{ fontSize: 12 }}>open_in_new</span> View students
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button className="flex-1 py-3 bg-[#000666] text-white font-bold rounded-full hover:bg-[#1a237e] transition-colors text-sm">View Profile</button>
                <button className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-full hover:bg-slate-50 transition-colors text-sm" onClick={() => setSelectedTeacher(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachersRegistry;
