import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Eye, ArrowLeft, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const StudentList = () => {
  const { grade } = useParams<{ grade: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await api.get(`/grades/${encodeURIComponent(grade || '')}/students`);
        setStudents(data);
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [grade]);

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(s.rollNo).padStart(3, '0').includes(searchTerm)
  );

  const getAttendancePct = (student: any) => {
    if (!student.attendance || student.attendance.length === 0) return null;
    const present = student.attendance.filter((a: any) => a.status === 'present').length;
    return Math.round((present / student.attendance.length) * 100);
  };

  const getAvgScore = (student: any) => {
    const scores: number[] = [];
    student.subjects?.forEach((sub: any) => {
      sub.scores?.forEach((s: any) => scores.push(s.obtained / s.total));
    });
    if (scores.length === 0) return null;
    return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100);
  };

  const presentToday = filteredStudents.filter(s => {
    const pct = getAttendancePct(s);
    return pct === null || pct > 75;
  }).length;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container py-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => navigate("/dashboard")}>dashboard</span>
                {" > "}
                <span className="font-medium text-foreground">{grade}</span>
              </div>
              <h1 className="text-xl font-bold text-foreground">{grade} — Students</h1>
              <p className="text-sm text-muted-foreground">
                {loading ? "Loading..." : `Present today: ${presentToday} / ${filteredStudents.length}`}
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name or roll no..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading students...
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <div className="max-h-[60vh] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-muted z-10">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground w-24">Roll No</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground min-w-[150px]">Student Name</th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground w-20">Grade</th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground w-32">Attendance</th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground w-20">Avg Score</th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground w-20">View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s, i) => {
                      const attPct = getAttendancePct(s);
                      const avgScore = getAvgScore(s);
                      return (
                        <tr key={s._id} className={`border-t border-border hover:bg-muted/50 transition-colors ${i % 2 === 0 ? "" : "bg-muted/20"}`}>
                          <td className="px-4 py-3 text-foreground font-mono">{String(s.rollNo).padStart(3, '0')}</td>
                          <td className="px-4 py-3 text-foreground">{s.name}</td>
                          <td className="px-4 py-3 text-center text-foreground">{s.grade}</td>
                          <td className="px-4 py-3 text-center">
                            {attPct !== null
                              ? <span className={attPct >= 85 ? "text-success" : attPct >= 75 ? "text-warning" : "text-destructive"}>{attPct}%</span>
                              : <span className="text-muted-foreground text-xs">No data</span>}
                          </td>
                          <td className="px-4 py-3 text-center text-foreground font-medium">
                            {avgScore !== null ? `${avgScore}%` : '—'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => navigate(`/student/${s._id}`)} className="text-primary hover:text-primary/80 transition-colors">
                              <Eye className="h-4 w-4 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredStudents.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No students found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentList;
