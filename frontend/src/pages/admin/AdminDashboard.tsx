import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import AdminSidebar from "@/components/AdminSidebar";

type Tab = "overview" | "teachers" | "students";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("overview");
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [fForm, setFForm] = useState({ name: "", email: "", password: "", facultyId: "", mobile: "", status: "active", assignedGrades: "" });
  const [sForm, setSForm] = useState({ name: "", email: "", password: "", grade: "Grade 1" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [t, s] = await Promise.all([api.get("/faculty"), api.get("/students")]);
      setTeachers(t);
      setStudents(s);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- Stats calculations ---
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const gradeMap: Record<string, number> = {};
  students.forEach(s => { gradeMap[s.grade] = (gradeMap[s.grade] || 0) + 1; });
  const gradeBreakdown = Object.entries(gradeMap).sort(([a], [b]) => a.localeCompare(b));

  const getAvgScore = (student: any) => {
    const all: number[] = [];
    student.subjects?.forEach((sub: any) => sub.scores?.forEach((sc: any) => all.push(sc.obtained / sc.total)));
    return all.length > 0 ? Math.round((all.reduce((a, b) => a + b, 0) / all.length) * 100) : null;
  };

  const getAttendancePct = (student: any) => {
    if (!student.attendance?.length) return null;
    const present = student.attendance.filter((a: any) => a.status === "present").length;
    return Math.round((present / student.attendance.length) * 100);
  };

  const filteredTeachers = teachers.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.email?.toLowerCase().includes(search.toLowerCase()) ||
    t.facultyId?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.grade?.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNo?.toString().includes(search)
  );

  const handleDeleteStudent = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This will re-index all roll numbers in their grade.`)) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/students/${id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Delete failed");
      }
      setStudents(prev => prev.filter(s => s._id !== id));
      toast({ title: "Deleted", description: `${name} removed. Roll numbers re-indexed automatically.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const navItems: { icon: string; label: string; key: Tab }[] = [
    { icon: "dashboard", label: "Overview", key: "overview" },
    { icon: "person_4", label: "Faculty Table", key: "teachers" },
    { icon: "group", label: "Students Table", key: "students" },
  ];

  return (
    <div className="text-[#1a1c1d] min-h-screen bg-[#f9f9fb]">
      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Top App Bar */}
      <header className="fixed top-0 left-[280px] right-0 z-50 bg-white/80 backdrop-blur-xl shadow-sm flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <div className="flex bg-[#f3f3f5] rounded-full p-1">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => { setTab(item.key); setSearch(""); setShowForm(false); }}
                className={`px-6 py-1.5 rounded-full text-xs font-bold transition-all ${tab === item.key ? "bg-blue-100 text-[#000666]" : "text-slate-500 hover:text-slate-700"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-slate-100 rounded-full text-slate-600"><span className="material-symbols-outlined">notifications</span></button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#e0e0ff] flex items-center justify-center text-[#000666] font-bold">A</div>
            <span className="text-sm font-medium text-[#000666]">Admin</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="ml-[280px] pt-20 p-8 min-h-screen">

        {/* === OVERVIEW TAB === */}
        {tab === "overview" && (
          <div className="animate-fade-in">
            <div className="mb-10">
              <h1 className="text-4xl font-extrabold tracking-tight text-[#000666] mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>School Overview</h1>
              <p className="text-[#454652]">Live statistics for the entire Einstein Matric institution.</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-24 gap-2 text-[#767683]"><Loader2 className="h-6 w-6 animate-spin" /> Loading data...</div>
            ) : (
              <>
                {/* Top KPI Cards */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
                  {[
                    { icon: "group", label: "Total Students", value: totalStudents, color: "bg-[#e0e0ff] text-[#000666]" },
                    { icon: "person_4", label: "Total Teachers", value: totalTeachers, color: "bg-[#90efef] text-[#006a6a]" },
                    { icon: "menu_book", label: "Grades Active", value: gradeBreakdown.length, color: "bg-blue-100 text-blue-800" },
                    { icon: "school", label: "Subjects", value: "Math & more", color: "bg-amber-100 text-amber-800" },
                  ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-3xl p-6 border border-[#e2e2e4] shadow-sm">
                      <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center mb-4`}>
                        <span className="material-symbols-outlined">{stat.icon}</span>
                      </div>
                      <p className="text-3xl font-extrabold text-[#000666]" style={{ fontFamily: "Manrope, sans-serif" }}>{stat.value}</p>
                      <p className="text-xs font-bold text-[#767683] uppercase tracking-widest mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
                  {/* Students per Grade */}
                  <div className="bg-white rounded-3xl p-8 border border-[#e2e2e4] shadow-sm">
                    <h3 className="text-lg font-bold text-[#000666] mb-6" style={{ fontFamily: "Manrope, sans-serif" }}>Students per Grade</h3>
                    <div className="space-y-3">
                      {gradeBreakdown.map(([grade, count]) => (
                        <div key={grade} className="flex items-center gap-3">
                          <span className="text-xs font-bold text-[#454652] w-24 shrink-0">{grade}</span>
                          <div className="flex-1 h-3 bg-[#f3f3f5] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#000666] to-[#006a6a] rounded-full transition-all duration-700"
                              style={{ width: `${Math.round((count / totalStudents) * 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-[#000666] w-8 text-right">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Teacher Grade Assignment */}
                  <div className="bg-white rounded-3xl p-8 border border-[#e2e2e4] shadow-sm">
                    <h3 className="text-lg font-bold text-[#000666] mb-6" style={{ fontFamily: "Manrope, sans-serif" }}>Teacher Assignments</h3>
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {teachers.map(t => (
                        <div key={t._id} className="flex items-center justify-between py-2 border-b border-[#f3f3f5] last:border-0 cursor-pointer group" onClick={() => setSelectedTeacher(t)}>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#93f2f2] flex items-center justify-center text-[#006a6a] font-bold text-sm">
                              {t.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-[#000666] group-hover:underline">{t.name}</p>
                              <p className="text-xs text-[#767683]">{t.facultyId}</p>
                            </div>
                          </div>
                          <div className="flex gap-1 flex-wrap justify-end max-w-[140px]">
                            {(t.assignedGrades || []).slice(0, 2).map((g: string) => (
                              <span key={g} className="bg-[#e0e0ff] text-[#000666] text-[10px] font-bold px-2 py-0.5 rounded-full">{g}</span>
                            ))}
                            {(t.assignedGrades?.length || 0) > 2 && (
                              <span className="text-[10px] text-[#767683]">+{t.assignedGrades.length - 2}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent 10 Students with scores */}
                <div className="bg-white rounded-3xl p-8 border border-[#e2e2e4] shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-[#000666]" style={{ fontFamily: "Manrope, sans-serif" }}>All Students — Quick Stats</h3>
                    <button onClick={() => setTab("students")} className="text-[#006a6a] text-sm font-bold hover:underline flex items-center gap-1">
                      View Full Table <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#f3f3f5]">
                          {["Roll No", "Name", "Grade", "Avg Score", "View"].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#454652]">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f3f3f5]">
                        {students.slice(0, 15).map(s => {
                          const avg = getAvgScore(s);
                          return (
                            <tr key={s._id} className="hover:bg-[#f3f3f5] cursor-pointer" onClick={() => navigate(`/student/${s._id}`)}>
                              <td className="px-4 py-3 font-mono font-bold">{String(s.rollNo).padStart(3, "0")}</td>
                              <td className="px-4 py-3 font-medium text-[#000666]">{s.name}</td>
                              <td className="px-4 py-3"><span className="bg-[#90efef] text-[#006e6e] text-xs font-bold px-2 py-0.5 rounded-full">{s.grade}</span></td>
                              <td className="px-4 py-3">
                                {avg !== null
                                  ? <span className={avg >= 70 ? "text-green-600 font-bold" : avg >= 50 ? "text-amber-600 font-bold" : "text-red-600 font-bold"}>{avg}%</span>
                                  : <span className="text-[#767683]">—</span>}
                              </td>
                              <td className="px-4 py-3">
                                <button className="text-[#000666] hover:text-[#006a6a]"><span className="material-symbols-outlined" style={{ fontSize: 18 }}>visibility</span></button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {students.length > 15 && (
                    <button onClick={() => setTab("students")} className="w-full mt-4 py-3 bg-[#f3f3f5] rounded-xl text-sm font-bold text-[#000666] hover:bg-[#e8e8ea] transition-colors">
                      View all {students.length} students →
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* === TEACHERS / STUDENTS TABS === */}
        {(tab === "teachers" || tab === "students") && (
          <>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight text-[#000666] mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>
                  {tab === "teachers" ? "Teachers Registry" : "Students Registry"}
                </h1>
                <p className="text-[#454652]">{tab === "teachers" ? `${totalTeachers} faculty members` : `${totalStudents} students across ${gradeBreakdown.length} grades`}</p>
              </div>
              <button onClick={() => { setEditingItem(null); setShowForm(true); }} className="bg-gradient-to-br from-[#000666] to-[#1a237e] text-white px-8 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-all">
                <span className="material-symbols-outlined text-sm">add</span>
                {tab === "teachers" ? "Onboard New Teacher" : "Add New Student"}
              </button>
            </div>

            <div className="bg-[#f3f3f5] rounded-xl p-4 mb-6 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[280px] relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#767683]" style={{ fontSize: 20 }}>search</span>
                <input
                  className="w-full bg-[#e8e8ea] border-none rounded-md py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#006a6a]"
                  placeholder={tab === "teachers" ? "Search by name, ID or email..." : "Search by name, grade or roll no..."}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-24 gap-2 text-[#767683]"><Loader2 className="h-6 w-6 animate-spin" /> Loading records...</div>
            ) : (
              <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  {tab === "teachers" ? (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#f3f3f5]">
                          {["Faculty Member", "Employee ID", "Grades Assigned", "Mobile", "Status", "Actions"].map(h => (
                            <th key={h} className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#454652]">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#eeeef0]">
                        {filteredTeachers.map(t => (
                          <tr key={t._id} className="hover:bg-[#f3f3f5] transition-colors group cursor-pointer" onClick={() => setSelectedTeacher(t)}>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-[#93f2f2] flex items-center justify-center text-[#006a6a] font-bold">{t.name?.charAt(0).toUpperCase()}</div>
                                <div>
                                  <div className="font-bold text-[#000666]">{t.name}</div>
                                  <div className="text-xs text-[#454652]">{t.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 font-mono text-sm">{t.facultyId}</td>
                            <td className="px-6 py-5 text-sm">{(t.assignedGrades || []).join(", ") || "—"}</td>
                            <td className="px-6 py-5 text-sm text-[#454652]">{t.mobile || "—"}</td>
                            <td className="px-6 py-5">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${t.status === "active" ? "bg-[#90efef] text-[#006e6e]" : "bg-[#ffdad6] text-[#93000a]"}`}>
                                {t.status === "active" ? "Continuing" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 hover:bg-[#90efef]/30 rounded-full text-[#006a6a]" onClick={e => { e.stopPropagation(); setSelectedTeacher(t); }}>
                                  <span className="material-symbols-outlined text-lg">visibility</span>
                                </button>
                                <button className="p-2 hover:bg-[#ffdad6]/30 rounded-full text-[#ba1a1a]" onClick={e => { e.stopPropagation(); setTeachers(prev => prev.filter(x => x._id !== t._id)); toast({ title: "Removed" }); }}>
                                  <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredTeachers.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-[#767683]">No teachers found</td></tr>}
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#f3f3f5]">
                          {["Roll No", "Student Name", "Grade", "Avg Score", "Actions"].map(h => (
                            <th key={h} className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#454652]">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#eeeef0]">
                        {filteredStudents.map(s => {
                          const avg = getAvgScore(s);
                          return (
                            <tr key={s._id} className="hover:bg-[#f3f3f5] transition-colors group cursor-pointer" onClick={() => navigate(`/student/${s._id}`)}>
                              <td className="px-6 py-5 font-mono font-bold">{String(s.rollNo).padStart(3, "0")}</td>
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-[#e0e0ff] flex items-center justify-center text-[#000666] font-bold text-sm">{s.name?.charAt(0).toUpperCase()}</div>
                                  <div>
                                    <div className="font-bold text-[#000666]">{s.name}</div>
                                    <div className="text-xs text-[#454652]">{s.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5"><span className="bg-[#90efef] text-[#006e6e] px-3 py-1 rounded-full text-xs font-bold">{s.grade}</span></td>
                              <td className="px-6 py-5">
                                {avg !== null
                                  ? <span className={avg >= 70 ? "text-green-700 font-bold" : avg >= 50 ? "text-amber-600 font-bold" : "text-red-600 font-bold"}>{avg}%</span>
                                  : <span className="text-[#767683] text-xs">No scores</span>}
                              </td>
                              <td className="px-6 py-5 text-right">
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button className="p-2 hover:bg-[#90efef]/30 rounded-full text-[#006a6a]" onClick={e => { e.stopPropagation(); navigate(`/student/${s._id}`); }}>
                                    <span className="material-symbols-outlined text-lg">visibility</span>
                                  </button>
                                  <button className="p-2 hover:bg-[#ffdad6]/30 rounded-full text-[#ba1a1a]" onClick={e => { e.stopPropagation(); handleDeleteStudent(s._id, s.name); }}>
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {filteredStudents.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-[#767683]">No students found</td></tr>}
                      </tbody>
                    </table>
                  )}
                </div>
                <div className="p-6 border-t border-[#eeeef0] flex items-center justify-between">
                  <span className="text-xs font-medium text-[#454652]">
                    Showing {tab === "teachers" ? filteredTeachers.length : filteredStudents.length} records
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Teacher Detail Modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSelectedTeacher(null)}>
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-8 py-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-[#000666]" style={{ fontFamily: "Manrope, sans-serif" }}>Teacher Profile</h2>
              <button className="p-2 hover:bg-slate-100 rounded-full" onClick={() => setSelectedTeacher(null)}><X className="h-5 w-5 text-[#767683]" /></button>
            </div>
            <div className="p-8">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-2xl bg-[#93f2f2] flex items-center justify-center text-[#006a6a] font-bold text-3xl">{selectedTeacher.name?.charAt(0)}</div>
                <div>
                  <h3 className="text-2xl font-bold text-[#000666]">{selectedTeacher.name}</h3>
                  <p className="text-[#454652]">{selectedTeacher.email}</p>
                  <p className="text-sm text-[#767683] mt-1">{selectedTeacher.facultyId} · {selectedTeacher.mobile || "No phone"}</p>
                </div>
              </div>
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-widest text-[#767683] mb-3">Assigned Grades</p>
                <div className="flex flex-wrap gap-2">
                  {(selectedTeacher.assignedGrades || []).length === 0
                    ? <p className="text-[#767683] text-sm">No grades assigned yet.</p>
                    : (selectedTeacher.assignedGrades || []).map((g: string) => (
                      <button key={g} onClick={() => { setSelectedTeacher(null); navigate(`/students/grade/${encodeURIComponent(g)}`); }} className="bg-[#90efef] text-[#006e6e] px-3 py-1 rounded-full text-sm font-bold hover:bg-[#006a6a] hover:text-white transition-colors">
                        {g} →
                      </button>
                    ))}
                </div>
              </div>
            </div>
            <div className="px-8 py-4 bg-slate-50 border-t flex justify-end gap-3">
              <button className="px-6 py-2 rounded-full border border-[#767683] text-sm font-bold hover:bg-slate-100" onClick={() => setSelectedTeacher(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#000666]">{tab === "teachers" ? "Add Teacher" : "Add Student"}</h2>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-[#767683]" /></button>
            </div>
            {tab === "teachers" ? (
              <div className="space-y-4">
                {[{ label: "Name", key: "name" }, { label: "Email", key: "email" }, { label: "Password", key: "password" }, { label: "Faculty ID", key: "facultyId" }, { label: "Mobile", key: "mobile" }, { label: "Assigned Grades (comma-sep)", key: "assignedGrades" }].map(f => (
                  <div key={f.key}>
                    <label className="text-xs font-bold text-[#454652] uppercase">{f.label}</label>
                    <input className="mt-1 w-full border border-[#e2e2e4] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006a6a]" value={(fForm as any)[f.key]} onChange={e => setFForm(p => ({ ...p, [f.key]: e.target.value }))} />
                  </div>
                ))}
                <button onClick={() => { toast({ title: "Note", description: "Save to DB API endpoint coming soon." }); setShowForm(false); }} className="w-full bg-[#000666] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#000666]/90">Save Teacher</button>
              </div>
            ) : (
              <div className="space-y-4">
                {[{ label: "Name", key: "name" }, { label: "Email", key: "email" }, { label: "Password", key: "password" }].map(f => (
                  <div key={f.key}>
                    <label className="text-xs font-bold text-[#454652] uppercase">{f.label}</label>
                    <input className="mt-1 w-full border border-[#e2e2e4] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006a6a]" value={(sForm as any)[f.key]} onChange={e => setSForm(p => ({ ...p, [f.key]: e.target.value }))} />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-bold text-[#454652] uppercase">Grade</label>
                  <select className="mt-1 w-full border border-[#e2e2e4] rounded-lg px-3 py-2 text-sm focus:outline-none" value={sForm.grade} onChange={e => setSForm(p => ({ ...p, grade: e.target.value }))}>
                    {Array.from({ length: 10 }, (_, i) => `Grade ${i + 1}`).map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <button onClick={() => { toast({ title: "Note", description: "Save to DB endpoint coming soon." }); setShowForm(false); }} className="w-full bg-[#000666] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#000666]/90">Save Student</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
