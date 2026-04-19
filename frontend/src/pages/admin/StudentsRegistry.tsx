import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import AdminSidebar from "@/components/AdminSidebar";

const ITEMS_PER_PAGE = 15;

const StudentsRegistry = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.get("/students")
      .then(s => setStudents(s))
      .catch(e => toast({ title: "Error", description: e.message, variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  const GRADES = ["All", ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`)];

  const getAvgScore = (s: any) => {
    const all: number[] = [];
    s.subjects?.forEach((sub: any) => sub.scores?.forEach((sc: any) => all.push(sc.obtained / sc.total)));
    return all.length ? Math.round(all.reduce((a, b) => a + b, 0) / all.length * 100) : null;
  };

  const getMathScore = (s: any) => {
    const math = s.subjects?.find((sub: any) => sub.name === "Mathematics");
    if (!math?.scores?.length) return null;
    const avg = math.scores.reduce((a: number, sc: any) => a + sc.obtained, 0) / math.scores.length;
    return `${Math.round(avg)}/100`;
  };

  const getAttPct = (s: any) => {
    if (!s.attendance?.length) return null;
    const pres = s.attendance.filter((a: any) => a.status === "present").length;
    return Math.round(pres / s.attendance.length * 100);
  };

  const filtered = students.filter(s =>
    (gradeFilter === "All" || s.grade === gradeFilter) &&
    (s.name?.toLowerCase().includes(search.toLowerCase()) ||
      String(s.rollNo).padStart(3, '0').includes(search))
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? Roll numbers will be re-indexed.`)) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/students/${id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      if (!res.ok) throw new Error((await res.json()).message);
      setStudents(prev => prev.filter(s => s._id !== id));
      toast({ title: "Deleted", description: `${name} removed. Roll numbers re-indexed.` });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <AdminSidebar />

      {/* Top App Bar */}
      <header className="fixed top-0 left-[280px] right-0 z-40 bg-white/80 backdrop-blur-xl h-16 flex items-center px-8 gap-4">
        <div className="relative flex-1 max-w-2xl">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 20 }}>search</span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-[#e8e8ea] border-none rounded-md focus:outline-none focus:ring-2 focus:ring-[#006a6a] text-sm"
            placeholder="Search by roll no or name..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="ml-auto flex items-center gap-4">
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full"><span className="material-symbols-outlined">notifications</span></button>
          <div className="w-8 h-8 rounded-full bg-[#e0e0ff] flex items-center justify-center text-[#000666] font-bold text-sm">A</div>
        </div>
      </header>

      <main className="ml-[280px] pt-24 px-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-[#000666] tracking-tight mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>Students Registry</h2>
            <p className="text-slate-500 text-sm">Managing {students.length} active enrollments across all grades</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button 
              onClick={() => toast({ title: "New Enrollment", description: "Opening student registration form..." })}
              className="bg-gradient-to-br from-[#000666] to-[#1a237e] text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg hover:scale-[0.98] transition-transform"
            >
              <span className="material-symbols-outlined">person_add</span> New Student
            </button>
            <div className="flex gap-2">
              {GRADES.slice(0, 5).map(g => (
                <button
                  key={g}
                  onClick={() => { setGradeFilter(g); setPage(1); }}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full border text-sm font-semibold transition-all ${gradeFilter === g ? "bg-[#000666] text-white border-[#000666]" : "bg-white text-[#1a1c1d] border-[#c6c5d4] hover:bg-[#f3f3f5]"}`}
                >
                  {g}
                </button>
              ))}
            </div>
            <select
              className="px-4 py-2 rounded-full border border-[#c6c5d4] text-sm font-semibold bg-white text-[#000666] focus:outline-none"
              value={gradeFilter}
              onChange={e => { setGradeFilter(e.target.value); setPage(1); }}
            >
              {GRADES.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Students",    value: students.length, icon: "trending_up",   sub: "Across all grades",  color: "text-[#006a6a]" },
            { label: "Grades Active",     value: 12,              icon: "check_circle",  sub: "Grades 1 – 12",      color: "text-[#006a6a]" },
            { label: "Teachers",          value: 100,             icon: "school",        sub: "9 subjects",         color: "text-[#000666]" },
            { label: "Filtered Results",  value: filtered.length, icon: "filter_list",   sub: "Current view",       color: "text-slate-500"  },
          ].map(stat => (
            <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm flex flex-col gap-1">
              <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">{stat.label}</span>
              <span className="text-2xl font-extrabold text-[#000666]" style={{ fontFamily: "Manrope, sans-serif" }}>{stat.value}</span>
              <div className={`mt-2 text-xs font-semibold flex items-center gap-1 ${stat.color}`}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{stat.icon}</span>
                {stat.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-24 gap-2 text-slate-400"><Loader2 className="h-5 w-5 animate-spin" /> Loading...</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#f3f3f5]">
                  <tr>
                    {["Roll No", "Student Name", "Grade", "Avg Score", "Maths Score", "Action"].map(h => (
                      <th key={h} className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3f3f5]">
                  {paged.map(s => {
                    const avg = getAvgScore(s);
                    const math = getMathScore(s);
                    const att = getAttPct(s);
                    const avgStatus = avg === null ? null : avg >= 70 ? "good" : avg >= 50 ? "avg" : "weak";
                    return (
                      <tr key={s._id} className="hover:bg-[#e2e2e4]/30 transition-colors cursor-pointer group">
                        <td className="px-6 py-5 text-sm font-semibold text-[#000666]">#{String(s.rollNo).padStart(3, "0")}</td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#e0e0ff] flex items-center justify-center text-[#000666] font-bold text-sm">
                              {s.name?.charAt(0)}
                            </div>
                            <span className="font-bold text-[#1a1c1d]">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="bg-[#90efef] text-[#006e6e] text-xs font-bold px-3 py-1 rounded-full">{s.grade}</span>
                        </td>
                        <td className="px-6 py-5">
                          {avg !== null ? (
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-[#e8e8ea] rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${avgStatus === "good" ? "bg-[#006a6a]" : avgStatus === "avg" ? "bg-amber-400" : "bg-red-500"}`} style={{ width: `${avg}%` }} />
                              </div>
                              <span className="text-sm font-semibold">{avg}%</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">No data</span>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          {math ? (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${parseInt(math) >= 70 ? "bg-[#90efef] text-[#006e6e]" : parseInt(math) >= 50 ? "bg-amber-100 text-amber-700" : "bg-[#ffdad6] text-[#93000a]"}`}>
                              {math}
                            </span>
                          ) : <span className="text-slate-400 text-xs">—</span>}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/student/${s._id}`)}
                              className="text-[#000666] hover:text-[#006a6a] font-bold text-sm flex items-center gap-1"
                            >
                              View Profile <span className="material-symbols-outlined text-base">arrow_forward</span>
                            </button>
                            <button
                              onClick={() => handleDelete(s._id, s.name)}
                              className="ml-2 p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {paged.length === 0 && (
                    <tr><td colSpan={6} className="py-16 text-center text-slate-400">No students found</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-[#f3f3f5] flex items-center justify-between">
            <span className="text-sm text-slate-500 font-medium">
              Showing {Math.min((page - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} entries
            </span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-[#c6c5d4] text-slate-400 disabled:opacity-30">
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = i + 1;
                return (
                  <button key={pg} onClick={() => setPage(pg)} className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm ${page === pg ? "bg-[#000666] text-white" : "bg-white border border-[#c6c5d4] text-slate-600 hover:bg-slate-50"}`}>
                    {pg}
                  </button>
                );
              })}
              {totalPages > 5 && <span className="text-slate-400 self-center">...</span>}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-[#c6c5d4] text-slate-400 disabled:opacity-30">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Info Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#f3f3f5] p-8 rounded-xl">
            <h3 className="text-xl font-bold text-[#000666] mb-4" style={{ fontFamily: "Manrope, sans-serif" }}>Registry Health</h3>
            <div className="space-y-5">
              {[
                { label: "Data Completeness", pct: 99 },
                { label: "Score Records",     pct: 100 },
                { label: "Grade Coverage",    pct: 100 },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-semibold text-slate-600">{item.label}</span>
                    <span className="text-sm font-bold text-[#006a6a]">{item.pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#e8e8ea] rounded-full overflow-hidden">
                    <div className="bg-[#006a6a] h-full rounded-full" style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#1a237e] p-8 rounded-xl relative overflow-hidden text-white">
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>Academic Audit 2024</h3>
            <p className="text-[#bdc2ff] text-sm mb-6 leading-relaxed">Ensure all Grade 10 and Grade 12 scores are finalized before the month-end lockdown.</p>
            <button 
              onClick={() => toast({ title: "Auditor Tool", description: "Initializing institutional audit for AY 2024..." })}
              className="px-6 py-3 bg-white text-[#000666] rounded-full font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              Open Auditor Tool <span className="material-symbols-outlined">open_in_new</span>
            </button>
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentsRegistry;
