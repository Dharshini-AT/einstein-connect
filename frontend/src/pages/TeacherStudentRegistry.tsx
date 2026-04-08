import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const TeacherStudentRegistry = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("All");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = localStorage.getItem("role") || "faculty";
  const assignedGrades = user?.assignedGrades || [];

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (role === "admin") {
          const all = await api.get("/students");
          setStudents(all);
        } else if (assignedGrades.length) {
          const results = await Promise.all(
            assignedGrades.map((g: string) => api.get(`/grades/${encodeURIComponent(g)}/students`))
          );
          setStudents(results.flat());
        }
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [role, assignedGrades.length]);

  const filtered = students.filter(s =>
    (selectedGrade === "All" || s.grade === selectedGrade) &&
    (s.name?.toLowerCase().includes(search.toLowerCase()) || s.rollNo?.toString().includes(search))
  );

  return (
    <div className="bg-[#f9f9fb] min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-slate-500 hover:text-[#000666] mb-6 font-bold transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-[#000666] tracking-tight mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>
                {role === "admin" ? "Institutional Registry" : "My Students"}
              </h1>
              <p className="text-slate-500">
                {role === "admin" 
                  ? `Viewing ${students.length} students across all school grades.` 
                  : `Viewing students across your ${assignedGrades.length} assigned grades.`}
              </p>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input 
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e2e4] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006a6a] text-sm shadow-sm"
                  placeholder="Search by name or roll no..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <select 
                className="px-6 py-3 bg-white border border-[#e2e2e4] rounded-2xl text-sm font-bold text-[#000666] focus:outline-none shadow-sm cursor-pointer"
                value={selectedGrade}
                onChange={e => setSelectedGrade(e.target.value)}
              >
                <option value="All">All Grades</option>
                {role === "admin" 
                  ? Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`).map(g => <option key={g} value={g}>{g}</option>)
                  : assignedGrades.map((g: string) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-32 text-slate-400 gap-2"><Loader2 className="h-6 w-6 animate-spin" /> Loading students...</div>
        ) : (
          <div className="bg-white rounded-[2rem] shadow-sm border border-[#e2e2e4] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f3f3f5]">
                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Roll No</th>
                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Name</th>
                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Grade</th>
                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Status</th>
                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3f3f5]">
                  {filtered.map(s => (
                    <tr key={s._id} className="hover:bg-[#f3f3f5]/50 transition-colors group cursor-pointer" onClick={() => navigate(`/student/${s._id}`)}>
                      <td className="px-8 py-5 font-mono font-bold text-slate-400">#{String(s.rollNo).padStart(3, "0")}</td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#e0e0ff] flex items-center justify-center text-[#000666] font-bold">{s.name?.charAt(0)}</div>
                          <span className="font-bold text-[#1a1c1d] group-hover:text-[#000666] tracking-tight">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="bg-[#90efef] text-[#006e6e] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">{s.grade}</span>
                      </td>
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-green-500" />
                           <span className="text-xs font-medium text-slate-600">Active</span>
                         </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button className="text-[#000666] font-bold text-sm hover:underline flex items-center gap-1 ml-auto">
                          View Details <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={5} className="py-24 text-center text-slate-400">No students found matching your criteria.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherStudentRegistry;
