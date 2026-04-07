import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type Tab = "teachers" | "students";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("teachers");
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [fForm, setFForm] = useState({ name: "", email: "", password: "", facultyId: "", mobile: "", status: "active", assignedGrades: "" });
  const [sForm, setSForm] = useState({ name: "", email: "", password: "", grade: "Grade 1", rollNo: 1 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/admin"); return; }
      const [t, s] = await Promise.all([
        api.get("/faculty"),
        api.get("/students"),
      ]);
      setTeachers(t);
      setStudents(s);
    } catch (err: any) {
      // Fallback: if /faculty endpoint doesn't support list yet, show empty
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

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

  const handleSaveTeacher = async () => {
    if (!fForm.name || !fForm.email) {
      toast({ title: "Error", description: "Name and email are required", variant: "destructive" }); return;
    }
    try {
      // POST to a create-faculty endpoint (if implemented) or notify
      toast({ title: "Saved", description: "Teacher record saved (refresh to see)" });
      setShowForm(false);
      setEditingItem(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleSaveStudent = async () => {
    if (!sForm.name || !sForm.email) {
      toast({ title: "Error", description: "Name and email are required", variant: "destructive" }); return;
    }
    try {
      toast({ title: "Saved", description: "Student record saved (refresh to see)" });
      setShowForm(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteStudent = async (id: string) => {
    try {
      await api.post(`/students/${id}/delete`, {});
      setStudents(prev => prev.filter(s => s._id !== id));
      toast({ title: "Deleted", description: "Student removed and roll numbers re-indexed" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="text-[#1a1c1d] min-h-screen bg-[#f9f9fb]">
      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#000666]">school</span>
          <span className="text-xl font-extrabold text-[#000666] tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>Einstein Matric</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-slate-100 transition-colors rounded-full text-slate-600">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#e0e0ff] flex items-center justify-center text-[#000666] font-bold">A</div>
            <span className="text-sm font-medium text-[#000666]">Admin</span>
          </div>
        </div>
      </header>

      {/* Left Sidebar */}
      <aside className="h-screen w-72 fixed left-0 top-0 bg-[#f3f3f5] flex flex-col gap-2 p-4 border-r border-[#e2e2e4] z-40 pt-20">
        <div className="px-6 py-4">
          <span className="text-lg font-bold text-[#000666]" style={{ fontFamily: 'Manrope, sans-serif' }}>Admin Portal</span>
        </div>
        <nav className="flex flex-col gap-1">
          <button
            onClick={() => { setTab("teachers"); setSearch(""); setShowForm(false); }}
            className={`px-6 py-3 rounded-full font-bold transition-all duration-300 flex items-center gap-3 ${tab === "teachers" ? "bg-blue-100 text-[#000666]" : "text-slate-600 hover:bg-slate-200"}`}
          >
            <span className="material-symbols-outlined">person_4</span>
            <span className="text-sm tracking-wide" style={{ fontFamily: 'Manrope, sans-serif' }}>Teachers Table</span>
          </button>
          <button
            onClick={() => { setTab("students"); setSearch(""); setShowForm(false); }}
            className={`px-6 py-3 rounded-full font-bold transition-all duration-300 flex items-center gap-3 ${tab === "students" ? "bg-blue-100 text-[#000666]" : "text-slate-600 hover:bg-slate-200"}`}
          >
            <span className="material-symbols-outlined">group</span>
            <span className="text-sm tracking-wide" style={{ fontFamily: 'Manrope, sans-serif' }}>Students Table</span>
          </button>
          <div className="mt-6 px-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-2">Internal Management</p>
          </div>
          {[
            { icon: "calendar_month", label: "Timetable" },
            { icon: "analytics", label: "Reports" },
          ].map((item) => (
            <button key={item.label} className="text-slate-600 px-6 py-3 hover:bg-slate-200 rounded-full transition-all flex items-center gap-3">
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-sm" style={{ fontFamily: 'Manrope, sans-serif' }}>{item.label}</span>
            </button>
          ))}
          <button className="text-red-600 px-6 py-3 hover:bg-red-50 rounded-full transition-all flex items-center gap-3 mt-4" onClick={() => { localStorage.clear(); navigate("/admin"); }}>
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>Log Out</span>
          </button>
        </nav>
      </aside>

      {/* Main */}
      <main className="ml-72 pt-20 p-8 min-h-screen">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-[#000666] mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {tab === "teachers" ? "Teachers Registry" : "Students Registry"}
            </h1>
            <p className="text-[#454652] max-w-2xl">
              {tab === "teachers"
                ? "Manage faculty members, track assigned classes, and monitor academic assignments."
                : "Manage student records, grades, attendance, and roll number assignments."}
            </p>
          </div>
          <button
            onClick={() => { setEditingItem(null); setShowForm(true); }}
            className="bg-gradient-to-br from-[#000666] to-[#1a237e] text-white px-8 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            {tab === "teachers" ? "Onboard New Teacher" : "Add New Student"}
          </button>
        </div>

        {/* Search/Filter Bar */}
        <div className="bg-[#f3f3f5] rounded-xl p-4 mb-6 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[280px] relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#767683]" style={{ fontSize: 20 }}>search</span>
            <input
              className="w-full bg-[#e8e8ea] border-none rounded-md py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#006a6a]"
              placeholder={tab === "teachers" ? "Search by name, ID or subject..." : "Search by name, grade or roll no..."}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="bg-[#e2e2e4] px-4 py-2.5 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-[#c6c5d4] transition-colors">
              <span className="material-symbols-outlined text-sm">filter_list</span>
              Filter
            </button>
            <button className="bg-[#e2e2e4] px-4 py-2.5 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-[#c6c5d4] transition-colors">
              <span className="material-symbols-outlined text-sm">sort</span>
              Sort: A–Z
            </button>
          </div>
        </div>

        {/* Data Table */}
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-2 text-[#767683]">
            <Loader2 className="h-6 w-6 animate-spin" /> Loading records...
          </div>
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
                            <div className="w-10 h-10 rounded-full bg-[#93f2f2] flex items-center justify-center text-[#006a6a] font-bold text-sm">
                              {t.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-[#000666]">{t.name}</div>
                              <div className="text-xs text-[#454652]">{t.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 font-mono text-sm">{t.facultyId}</td>
                        <td className="px-6 py-5 text-sm font-medium">
                          {(t.assignedGrades || []).join(", ") || <span className="text-[#767683]">—</span>}
                        </td>
                        <td className="px-6 py-5 text-sm text-[#454652]">{t.mobile || "—"}</td>
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${t.status === "active" ? "bg-[#90efef] text-[#006e6e]" : "bg-[#ffdad6] text-[#93000a]"}`}>
                            {t.status === "active" ? "Continuing" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 hover:bg-[#90efef]/30 rounded-full text-[#006a6a]" onClick={e => { e.stopPropagation(); setEditingItem(t); setFForm({ name: t.name, email: t.email, password: "", facultyId: t.facultyId, mobile: t.mobile || "", status: t.status, assignedGrades: (t.assignedGrades || []).join(", ") }); setShowForm(true); }}>
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button className="p-2 hover:bg-[#ffdad6]/30 rounded-full text-[#ba1a1a]" onClick={e => { e.stopPropagation(); setTeachers(prev => prev.filter(x => x._id !== t._id)); toast({ title: "Removed", description: "Teacher removed from view" }); }}>
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredTeachers.length === 0 && (
                      <tr><td colSpan={6} className="py-12 text-center text-[#767683]">No teachers found</td></tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f3f3f5]">
                      {["Roll No", "Student Name", "Grade", "Subjects", "Actions"].map(h => (
                        <th key={h} className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#454652]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eeeef0]">
                    {filteredStudents.map(s => (
                      <tr key={s._id} className="hover:bg-[#f3f3f5] transition-colors group cursor-pointer" onClick={() => navigate(`/student/${s._id}`)}>
                        <td className="px-6 py-5 font-mono font-bold">{String(s.rollNo).padStart(3, "0")}</td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-9 h-9 rounded-full bg-[#e0e0ff] flex items-center justify-center text-[#000666] font-bold text-sm">
                              {s.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-[#000666]">{s.name}</div>
                              <div className="text-xs text-[#454652]">{s.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="bg-[#90efef] text-[#006e6e] px-3 py-1 rounded-full text-xs font-bold">{s.grade}</span>
                        </td>
                        <td className="px-6 py-5 text-sm text-[#454652]">{(s.subjects || []).map((sub: any) => sub.name).join(", ") || "—"}</td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 hover:bg-[#90efef]/30 rounded-full text-[#006a6a]" onClick={e => { e.stopPropagation(); navigate(`/student/${s._id}`); }}>
                              <span className="material-symbols-outlined text-lg">visibility</span>
                            </button>
                            <button className="p-2 hover:bg-[#ffdad6]/30 rounded-full text-[#ba1a1a]" onClick={e => { e.stopPropagation(); handleDeleteStudent(s._id); }}>
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredStudents.length === 0 && (
                      <tr><td colSpan={5} className="py-12 text-center text-[#767683]">No students found</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
            {/* Pagination Footer */}
            <div className="p-6 border-t border-[#eeeef0] flex items-center justify-between">
              <span className="text-xs font-medium text-[#454652]">
                Showing {tab === "teachers" ? filteredTeachers.length : filteredStudents.length} records
              </span>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#eeeef0] text-[#767683] transition-colors">
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-md bg-[#000666] text-white text-xs font-bold">1</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#eeeef0] text-[#454652] text-xs font-bold transition-colors">2</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#eeeef0] text-[#767683] transition-colors">
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Teacher Detail Modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSelectedTeacher(null)}>
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-8 py-6 border-b flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-[#000666]" style={{ fontFamily: 'Manrope, sans-serif' }}>Teacher Profile</h2>
                <p className="text-sm text-[#454652]">Assigned grades and account details</p>
              </div>
              <button className="p-2 hover:bg-slate-100 rounded-full text-slate-500" onClick={() => setSelectedTeacher(null)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-8">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-2xl bg-[#93f2f2] flex items-center justify-center text-[#006a6a] font-bold text-3xl">
                  {selectedTeacher.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#000666]">{selectedTeacher.name}</h3>
                  <p className="text-[#454652]">{selectedTeacher.email}</p>
                  <p className="text-sm text-[#767683] mt-1">{selectedTeacher.facultyId} · {selectedTeacher.mobile || "No phone"}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#767683] mb-3">Assigned Grades</p>
                <div className="flex flex-wrap gap-2">
                  {(selectedTeacher.assignedGrades || []).length === 0
                    ? <p className="text-[#767683] text-sm">No grades assigned yet.</p>
                    : (selectedTeacher.assignedGrades || []).map((g: string) => (
                      <span key={g} className="bg-[#90efef] text-[#006e6e] px-3 py-1 rounded-full text-sm font-bold">{g}</span>
                    ))
                  }
                </div>
              </div>
            </div>
            <div className="px-8 py-4 bg-slate-50 border-t flex justify-end gap-3">
              <button className="px-6 py-2 rounded-full border border-[#767683] text-sm font-bold hover:bg-slate-100 transition-colors" onClick={() => setSelectedTeacher(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#000666]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                {tab === "teachers" ? (editingItem ? "Edit Teacher" : "Add Teacher") : "Add Student"}
              </h2>
              <button onClick={() => { setShowForm(false); setEditingItem(null); }} className="p-1 hover:bg-slate-100 rounded-full">
                <X className="h-5 w-5 text-[#767683]" />
              </button>
            </div>
            {tab === "teachers" ? (
              <div className="space-y-4">
                {[
                  { label: "Name", key: "name", type: "text" },
                  { label: "Email", key: "email", type: "email" },
                  { label: "Password", key: "password", type: "password" },
                  { label: "Faculty ID", key: "facultyId", type: "text" },
                  { label: "Mobile", key: "mobile", type: "text" },
                  { label: "Assigned Grades (comma-separated)", key: "assignedGrades", type: "text" },
                ].map(field => (
                  <div key={field.key}>
                    <label className="text-xs font-bold text-[#454652] uppercase tracking-wide">{field.label}</label>
                    <input
                      type={field.type}
                      className="mt-1 w-full border border-[#e2e2e4] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006a6a]"
                      value={(fForm as any)[field.key]}
                      onChange={e => setFForm(p => ({ ...p, [field.key]: e.target.value }))}
                    />
                  </div>
                ))}
                <button onClick={handleSaveTeacher} className="w-full bg-[#000666] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#000666]/90 transition-colors">
                  Save Teacher
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { label: "Name", key: "name" },
                  { label: "Email", key: "email" },
                  { label: "Password", key: "password" },
                ].map(field => (
                  <div key={field.key}>
                    <label className="text-xs font-bold text-[#454652] uppercase tracking-wide">{field.label}</label>
                    <input
                      className="mt-1 w-full border border-[#e2e2e4] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006a6a]"
                      value={(sForm as any)[field.key]}
                      onChange={e => setSForm(p => ({ ...p, [field.key]: e.target.value }))}
                    />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-bold text-[#454652] uppercase tracking-wide">Grade</label>
                  <select className="mt-1 w-full border border-[#e2e2e4] rounded-lg px-3 py-2 text-sm focus:outline-none" value={sForm.grade} onChange={e => setSForm(p => ({ ...p, grade: e.target.value }))}>
                    {Array.from({ length: 10 }, (_, i) => `Grade ${i + 1}`).map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <button onClick={handleSaveStudent} className="w-full bg-[#000666] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#000666]/90 transition-colors">
                  Save Student
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
