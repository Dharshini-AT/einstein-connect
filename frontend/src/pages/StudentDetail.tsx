import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, TrendingDown, TrendingUp, Lightbulb, AlertTriangle, CheckCircle, BarChart3 } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type Status = "good" | "average" | "weak";

const STATUS_COLOR: Record<Status, string> = {
  good:    "text-green-700 bg-green-50 border-green-200",
  average: "text-amber-700 bg-amber-50 border-amber-200",
  weak:    "text-red-700 bg-red-50 border-red-200",
};

const STATUS_BAR: Record<Status, string> = {
  good:    "bg-green-500",
  average: "bg-amber-400",
  weak:    "bg-red-500",
};

const STATUS_ICON: Record<Status, JSX.Element> = {
  good:    <CheckCircle className="h-4 w-4 text-green-600" />,
  average: <TrendingUp  className="h-4 w-4 text-amber-500" />,
  weak:    <TrendingDown className="h-4 w-4 text-red-500" />,
};

const ScoreBar = ({ pct, status }: { pct: number; status: Status }) => (
  <div className="w-full h-2 bg-[#f3f3f5] rounded-full overflow-hidden">
    <div className={`h-full rounded-full transition-all duration-700 ${STATUS_BAR[status]}`} style={{ width: `${pct}%` }} />
  </div>
);

const StudentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [student, setStudent]   = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<"overview" | "subjects">("overview");
  const role = localStorage.getItem("role");

  useEffect(() => {
    const load = async () => {
      try {
        const [s, a] = await Promise.all([
          api.get(`/students/${id}`),
          api.get(`/students/${id}/analysis`),
        ]);
        setStudent(s);
        setAnalysis(a);
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9fb] flex items-center justify-center">
        <div className="flex items-center gap-2 text-[#767683]">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading student profile...
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-[#f9f9fb] flex items-center justify-center">
        <p className="text-[#767683]">Student not found.</p>
      </div>
    );
  }

  const overallStatus: Status = analysis?.overallStatus || "average";

  return (
    <div className="min-h-screen bg-[#f9f9fb]">
      {/* Top Bar */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm flex items-center gap-4 px-6 py-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-[#f3f3f5] transition-colors">
          <ArrowLeft className="h-5 w-5 text-[#000666]" />
        </button>
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#000666]">school</span>
          <span className="text-lg font-extrabold text-[#000666]" style={{ fontFamily: "Manrope, sans-serif" }}>Einstein Matric</span>
        </div>
        <div className="ml-auto text-sm text-[#767683]">
          {role === "admin" ? "Admin View" : "Faculty View"}
        </div>
      </header>

      <main className="pt-20 px-6 pb-12 max-w-5xl mx-auto">
        {/* Student Hero Card */}
        <div className="mt-8 mb-8 bg-gradient-to-br from-[#000666] to-[#1a237e] rounded-3xl p-8 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center text-4xl font-bold border-2 border-white/20">
              {student.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-[#bdc2ff] text-xs font-bold uppercase tracking-widest mb-1">{student.grade} · Roll #{String(student.rollNo).padStart(3, "0")}</p>
              <h1 className="text-3xl font-extrabold tracking-tight mb-1" style={{ fontFamily: "Manrope, sans-serif" }}>{student.name}</h1>
              <p className="text-white/60 text-sm">{student.email}</p>
            </div>
            {analysis && (
              <div className="text-right">
                <p className="text-[#bdc2ff] text-xs font-bold uppercase tracking-widest mb-1">Overall Average</p>
                <p className="text-5xl font-extrabold" style={{ fontFamily: "Manrope, sans-serif" }}>{analysis.overallAverage}%</p>
                <span className={`mt-2 inline-block text-xs font-bold px-3 py-1 rounded-full ${overallStatus === "good" ? "bg-green-500/20 text-green-300" : overallStatus === "average" ? "bg-amber-500/20 text-amber-300" : "bg-red-500/20 text-red-300"}`}>
                  {overallStatus === "good" ? "Performing Well" : overallStatus === "average" ? "Needs Attention" : "At Risk"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { key: "overview", label: "Weakness Analysis", icon: "analytics" },
            { key: "subjects", label: "Subject Details",   icon: "menu_book" },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${tab === t.key ? "bg-[#000666] text-white shadow-lg" : "bg-white text-[#454652] border border-[#e2e2e4] hover:bg-[#f3f3f5]"}`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* ═══ OVERVIEW / WEAKNESS TAB ═══ */}
        {tab === "overview" && analysis && (
          <div className="space-y-6 animate-fade-in">
            {/* Priority Alert — worst 3 subjects */}
            {analysis.prioritySubjects.some((s: any) => s.status !== "good") && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <h2 className="text-base font-bold text-red-700" style={{ fontFamily: "Manrope, sans-serif" }}>
                    Priority Focus Areas
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {analysis.prioritySubjects.map((sub: any) => (
                    <div key={sub.subjectId} className="bg-white rounded-xl p-4 border border-red-100">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-bold text-[#1a1c1d]">{sub.subjectName}</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${STATUS_COLOR[sub.status as Status]}`}>{sub.averagePercentage}%</span>
                      </div>
                      <ScoreBar pct={sub.averagePercentage} status={sub.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Subjects — Weakness Breakdown */}
            <div className="grid grid-cols-1 gap-6">
              {analysis.subjectAnalysis.map((sub: any) => (
                <div key={sub.subjectId} className="bg-white rounded-2xl p-6 border border-[#e2e2e4] shadow-sm">
                  {/* Subject Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      {STATUS_ICON[sub.status as Status]}
                      <h3 className="text-base font-bold text-[#000666]" style={{ fontFamily: "Manrope, sans-serif" }}>{sub.subjectName}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${STATUS_COLOR[sub.status as Status]}`}>
                        {sub.status.toUpperCase()}
                      </span>
                      <span className="text-2xl font-extrabold text-[#000666]" style={{ fontFamily: "Manrope, sans-serif" }}>{sub.averagePercentage}%</span>
                    </div>
                  </div>

                  {/* Topic Bars */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                    {sub.topics.map((t: any) => (
                      <div key={t.topic}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-[#454652]">{t.topic}</span>
                          <span className={`font-bold ${t.status === "good" ? "text-green-600" : t.status === "average" ? "text-amber-600" : "text-red-600"}`}>{t.percentage}%</span>
                        </div>
                        <ScoreBar pct={t.percentage} status={t.status} />
                      </div>
                    ))}
                  </div>

                  {/* Suggestions */}
                  {sub.suggestions.length > 0 && (
                    <div className="bg-[#f3f3f5] rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="h-4 w-4 text-amber-500" />
                        <p className="text-xs font-bold text-[#454652] uppercase tracking-wider">Improvement Suggestions</p>
                      </div>
                      <ul className="space-y-2">
                        {sub.suggestions.map((s: any, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${STATUS_COLOR[sub.status as Status]}`}>{i + 1}</span>
                            <span>
                              <span className="font-bold text-[#1a1c1d]">{s.topic} ({s.percentage}%): </span>
                              <span className="text-[#454652]">{s.suggestion}</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ SUBJECT DETAILS TAB ═══ */}
        {tab === "subjects" && (
          <div className="space-y-6 animate-fade-in">
            {student.subjects?.map((sub: any) => {
              const avgPct = sub.scores?.length
                ? Math.round(sub.scores.reduce((s: number, sc: any) => s + (sc.obtained / sc.total), 0) / sub.scores.length * 100)
                : null;
              return (
                <div key={sub.subjectId} className="bg-white rounded-2xl border border-[#e2e2e4] shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 bg-[#f3f3f5] border-b border-[#e2e2e4]">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-4 w-4 text-[#000666]" />
                      <h3 className="font-bold text-[#000666]" style={{ fontFamily: "Manrope, sans-serif" }}>{sub.name}</h3>
                    </div>
                    {avgPct !== null && (
                      <span className="text-xl font-extrabold text-[#000666]">{avgPct}%</span>
                    )}
                  </div>
                  <div className="divide-y divide-[#f3f3f5]">
                    {sub.scores?.map((sc: any, i: number) => {
                      const pct = Math.round((sc.obtained / sc.total) * 100);
                      const st: Status = pct >= 70 ? "good" : pct >= 50 ? "average" : "weak";
                      return (
                        <div key={i} className="flex items-center gap-4 px-6 py-3">
                          <span className="w-36 text-sm font-medium text-[#454652] shrink-0">{sc.topic}</span>
                          <div className="flex-1"><ScoreBar pct={pct} status={st} /></div>
                          <span className={`text-sm font-bold w-16 text-right ${st === "good" ? "text-green-600" : st === "average" ? "text-amber-600" : "text-red-600"}`}>
                            {sc.obtained}/{sc.total}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDetail;
