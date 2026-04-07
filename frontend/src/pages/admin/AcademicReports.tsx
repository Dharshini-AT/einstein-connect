import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import AdminSidebar from "@/components/AdminSidebar";

const SUBJECTS_ALL = ["Mathematics", "Science", "Language I", "Language II", "Social Science", "Chemistry", "Physics", "Computer Science", "Biology"];
const GRADES_ALL   = Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`);

const AcademicReports = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [gradeFilter, setGradeFilter] = useState("Grade 12");
  const [subject, setSubject]   = useState("Mathematics");

  useEffect(() => {
    api.get("/students")
      .then(s => setStudents(s))
      .catch(e => toast({ title: "Error", description: e.message, variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  const gradeStudents = students.filter(s => s.grade === gradeFilter);

  const getSubjectScore = (student: any, subName: string) => {
    const sub = student.subjects?.find((s: any) => s.name === subName);
    if (!sub?.scores?.length) return null;
    return Math.round(sub.scores.reduce((a: number, sc: any) => a + sc.obtained, 0) / sub.scores.length);
  };

  const getOverallAvg = (student: any) => {
    const all: number[] = [];
    student.subjects?.forEach((sub: any) => sub.scores?.forEach((sc: any) => all.push(sc.obtained / sc.total)));
    return all.length ? Math.round(all.reduce((a, b) => a + b, 0) / all.length * 100) : null;
  };

  const gradeNum = parseInt(gradeFilter.replace("Grade ", ""));
  const relevantSubjects = gradeNum >= 11
    ? ["Mathematics", "Chemistry", "Language I", "Language II", "Physics"]
    : ["Mathematics", "Science", "Language I", "Language II", "Social Science"];

  // Ranked students
  const ranked = [...gradeStudents]
    .map(s => ({ ...s, overall: getOverallAvg(s) }))
    .sort((a, b) => (b.overall || 0) - (a.overall || 0));

  const classAvg = ranked.length
    ? Math.round(ranked.reduce((a, s) => a + (s.overall || 0), 0) / ranked.filter(s => s.overall !== null).length)
    : null;

  const topStudent = ranked[0];

  // Subject analytics
  const subjectAnalytics = relevantSubjects.map(sub => {
    const scores = gradeStudents
      .map(s => getSubjectScore(s, sub))
      .filter(v => v !== null) as number[];
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
    return { name: sub, avg };
  });

  const focusSubjectData = subjectAnalytics.find(s => s.name === subject) || subjectAnalytics[0];

  const getStatus = (pct: number | null) => {
    if (pct === null) return { label: "No Data", cls: "bg-slate-100 text-slate-500" };
    if (pct >= 85) return { label: "EXCELLENT", cls: "bg-[#90efef]/20 text-[#006a6a]" };
    if (pct >= 70) return { label: "STABLE",    cls: "bg-blue-50 text-[#000666]" };
    if (pct >= 55) return { label: "AVERAGE",   cls: "bg-amber-50 text-amber-700" };
    return { label: "CRITICAL", cls: "bg-red-50 text-red-700" };
  };

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <AdminSidebar />

      {/* Top App Bar */}
      <header className="fixed top-0 left-[280px] right-0 z-40 bg-white/80 backdrop-blur-xl h-16 flex items-center justify-between px-8">
        <h2 className="text-xl font-bold text-[#000666]" style={{ fontFamily: "Manrope, sans-serif" }}>Academic Reports</h2>
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full"><span className="material-symbols-outlined">notifications</span></button>
          <div className="w-8 h-8 rounded-full bg-[#e0e0ff] flex items-center justify-center text-[#000666] font-bold text-sm">A</div>
        </div>
      </header>

      <main className="ml-[280px] pt-24 px-8 pb-12">
        {/* Action Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h3 className="text-3xl font-extrabold text-[#000666] tracking-tight mb-1" style={{ fontFamily: "Manrope, sans-serif" }}>Academic Performance Dashboard</h3>
            <p className="text-slate-500 text-sm">Reviewing {gradeFilter} Analytics</p>
          </div>
          <div className="flex gap-3">
            <div className="flex bg-[#f3f3f5] p-1 rounded-lg items-center gap-2">
              <select
                className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer px-3 py-1"
                value={gradeFilter}
                onChange={e => setGradeFilter(e.target.value)}
              >
                {GRADES_ALL.map(g => <option key={g}>{g}</option>)}
              </select>
              <div className="w-px h-6 bg-[#c6c5d4]" />
              <select
                className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer px-3 py-1"
                value={subject}
                onChange={e => setSubject(e.target.value)}
              >
                {SUBJECTS_ALL.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <button className="bg-[#006a6a] text-white px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined text-sm">picture_as_pdf</span> Generate Report
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 gap-2 text-slate-400"><Loader2 className="h-6 w-6 animate-spin" /> Loading analytics...</div>
        ) : (
          <>
            {/* KPI Bento Grid */}
            <div className="grid grid-cols-12 gap-6 mb-8">
              <div className="col-span-3 bg-white p-6 rounded-xl shadow-sm relative overflow-hidden group hover:bg-[#e0e0ff]/40 transition-all">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Class Average</p>
                <h4 className="text-4xl font-extrabold text-[#000666] mb-1" style={{ fontFamily: "Manrope, sans-serif" }}>{classAvg ?? "—"}%</h4>
                <div className="flex items-center gap-1 text-[#006a6a] text-xs font-bold">
                  <span className="material-symbols-outlined text-xs">trending_up</span>
                  <span>{gradeFilter} overall</span>
                </div>
                <div className="absolute right-[-10px] bottom-[-10px] opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-8xl">percent</span>
                </div>
              </div>

              <div className="col-span-3 bg-white p-6 rounded-xl shadow-sm relative overflow-hidden group hover:bg-[#e0e0ff]/40 transition-all">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Top Student</p>
                <h4 className="text-2xl font-extrabold text-[#000666] mb-1" style={{ fontFamily: "Manrope, sans-serif" }}>{topStudent?.name?.split(" ")[0] || "—"}</h4>
                <p className="text-slate-500 text-xs">{topStudent?.overall ?? "—"}% overall</p>
                <div className="absolute right-[-10px] bottom-[-10px] opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-8xl">military_tech</span>
                </div>
              </div>

              <div className="col-span-6 bg-white p-6 rounded-xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Enrolled Students</p>
                  <h4 className="text-4xl font-extrabold text-[#000666] mb-1" style={{ fontFamily: "Manrope, sans-serif" }}>{gradeStudents.length}</h4>
                  <p className="text-slate-500 text-xs">In {gradeFilter}</p>
                </div>
                <div className="flex items-end gap-1 h-16">
                  {[60, 75, 65, 90, 100].map((h, i) => (
                    <div key={i} className={`w-3 rounded-t-sm ${i === 4 ? "bg-[#006a6a]" : "bg-[#90efef]"}`} style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Analytics + Table */}
            <div className="grid grid-cols-12 gap-6">
              {/* Subject Focus Card */}
              <div className="col-span-4 bg-[#1a237e] text-white p-8 rounded-xl relative overflow-hidden">
                <h4 className="text-xl font-bold mb-6" style={{ fontFamily: "Manrope, sans-serif" }}>{subject} — {gradeFilter}</h4>
                <div className="space-y-5 relative z-10">
                  {subjectAnalytics.map(sub => (
                    <div key={sub.name}>
                      <div className="flex justify-between text-xs mb-2 opacity-80 uppercase tracking-widest">
                        <span>{sub.name.length > 18 ? sub.name.slice(0, 18) + "…" : sub.name}</span>
                        <span>{sub.avg ?? "—"}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full">
                        <div className="h-full bg-[#90efef] rounded-full transition-all duration-700" style={{ width: `${sub.avg ?? 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-xs italic opacity-80 leading-relaxed">
                    "{subject} class average is {focusSubjectData?.avg ?? "—"}% for {gradeFilter}. {(focusSubjectData?.avg || 0) >= 70 ? "Strong class performance overall." : "Consider focused intervention sessions."}"
                  </p>
                </div>
                <div className="absolute top-[-20px] right-[-20px] w-48 h-48 bg-[#006a6a]/10 rounded-full blur-3xl" />
              </div>

              {/* Ranked Students Table */}
              <div className="col-span-8 bg-[#f3f3f5] rounded-xl overflow-hidden">
                <div className="p-6 bg-[#e8e8ea] flex justify-between items-center">
                  <h5 className="font-bold text-[#000666]" style={{ fontFamily: "Manrope, sans-serif" }}>Student Aggregate Scores — {gradeFilter}</h5>
                  <button className="text-xs font-bold text-[#006a6a] flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">filter_list</span> Ranked by Score
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-widest text-slate-500">
                        <th className="px-6 py-4 font-bold">Rank</th>
                        <th className="px-6 py-4 font-bold">Student</th>
                        {relevantSubjects.slice(0, 3).map(s => (
                          <th key={s} className="px-6 py-4 font-bold text-center">{s.split(" ")[0]}</th>
                        ))}
                        <th className="px-6 py-4 font-bold text-center">Average</th>
                        <th className="px-6 py-4 font-bold text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {ranked.slice(0, 10).map((s, idx) => {
                        const status = getStatus(s.overall);
                        return (
                          <tr key={s._id} className="hover:bg-[#e2e2e4] transition-colors cursor-pointer" onClick={() => navigate(`/student/${s._id}`)}>
                            <td className="px-6 py-4 font-bold text-[#000666]">#{idx + 1}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#e0e0ff] flex items-center justify-center font-bold text-[10px] text-[#000666]">
                                  {s.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                                </div>
                                <span className="font-semibold text-[#1a1c1d]">{s.name}</span>
                              </div>
                            </td>
                            {relevantSubjects.slice(0, 3).map(sub => {
                              const score = getSubjectScore(s, sub);
                              return (
                                <td key={sub} className="px-6 py-4 text-center font-bold text-[#006a6a]">{score ?? "—"}</td>
                              );
                            })}
                            <td className="px-6 py-4 text-center font-bold">{s.overall ?? "—"}%</td>
                            <td className="px-6 py-4 text-right">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${status.cls}`}>{status.label}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AcademicReports;
