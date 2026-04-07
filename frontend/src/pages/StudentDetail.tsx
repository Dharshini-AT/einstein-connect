import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, Edit, Lightbulb, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import ManualEntryModal from "@/components/ManualEntryModal";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const StudentDetail = () => {
  const { rollNo } = useParams<{ rollNo: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [manualOpen, setManualOpen] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [topicScoresView, setTopicScoresView] = useState<string | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [aiQuestions, setAiQuestions] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    // rollNo param is actually the student _id passed from StudentList
    const fetchStudent = async () => {
      try {
        const data = await api.get(`/students/${rollNo}`);
        setStudent(data);
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [rollNo]);

  const handleViewTopics = (subjectId: string) => {
    if (topicScoresView === subjectId) {
      setTopicScoresView(null);
      setShowRecommendations(false);
    } else {
      setTopicScoresView(subjectId);
      setShowRecommendations(false);
    }
  };

  const handleAI = async () => {
    setAiLoading(true);
    setShowRecommendations(true);
    try {
      const questions = await api.get(`/students/${student._id}/quiz-recommend`);
      setAiQuestions(questions);
    } catch (err: any) {
      toast({ title: "AI Error", description: err.message || "Could not generate questions.", variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  const handleManualSave = async (data: { title: string; totalMarks: number; obtainedMarks: number }) => {
    if (!editingSubjectId) return;
    try {
      await api.post(`/students/${student._id}/scores`, {
        subjectId: editingSubjectId,
        topic: data.title,
        total: data.totalMarks,
        obtained: data.obtainedMarks,
      });
      // Re-fetch student to reflect new score
      const updated = await api.get(`/students/${student._id}`);
      setStudent(updated);
      toast({ title: "Score saved!", description: `${data.title} score has been recorded.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setManualOpen(false);
    setEditingSubjectId(null);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  if (!student) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Student not found</p>
    </div>
  );

  const currentSubject = student.subjects?.find((s: any) => s.subjectId === topicScoresView);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container py-6 animate-fade-in max-w-4xl">
        {/* Breadcrumbs */}
        <div className="text-sm text-muted-foreground mb-4">
          <span className="hover:text-primary cursor-pointer" onClick={() => navigate('/dashboard')}>dashboard</span>
          {" > "}
          <span className="hover:text-primary cursor-pointer" onClick={() => navigate(-1)}>grade-{student.grade}</span>
          {" > "}
          <span className="text-foreground font-medium">student-detail</span>
        </div>

        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        {/* Profile Section */}
        <div className="glass-card rounded-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-lg bg-accent/30 flex items-center justify-center text-2xl font-bold text-primary">
              {student.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{student.name}</h1>
              <p className="text-sm text-muted-foreground font-mono">Roll No: {student.rollNo}</p>
              <p className="text-sm text-muted-foreground mt-1">{student.grade}</p>
              <p className="text-sm text-muted-foreground">
                Attendance: {student.attendance?.length > 0
                  ? `${Math.round((student.attendance.filter((a: any) => a.status === 'present').length / student.attendance.length) * 100)}%`
                  : 'No data'}
              </p>
            </div>
          </div>
        </div>

        {/* Subject Scores Table */}
        <div className="rounded-lg border border-border overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Subject ID</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Subject Name</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Scores</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">View Topics</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Add Score</th>
              </tr>
            </thead>
            <tbody>
              {(student.subjects || []).map((sub: any) => {
                const totalObtained = sub.scores?.reduce((sum: number, s: any) => sum + s.obtained, 0) || 0;
                const totalMarks = sub.scores?.reduce((sum: number, s: any) => sum + s.total, 0) || 0;
                return (
                  <tr key={sub.subjectId} className="border-t border-border">
                    <td className="px-4 py-3 font-mono text-foreground">{sub.subjectId}</td>
                    <td className="px-4 py-3 text-foreground">{sub.name}</td>
                    <td className="px-4 py-3 text-center text-foreground font-medium">
                      {totalMarks > 0 ? `${totalObtained}/${totalMarks}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleViewTopics(sub.subjectId)} className="text-primary hover:text-primary/80">
                        <Eye className="h-4 w-4 mx-auto" />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => { setEditingSubjectId(sub.subjectId); setManualOpen(true); }} className="text-secondary hover:text-secondary/80">
                        <Edit className="h-4 w-4 mx-auto" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {(!student.subjects || student.subjects.length === 0) && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">No subjects added yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Topic Scores expanded view */}
        {topicScoresView && currentSubject && (
          <div className="rounded-lg border border-border overflow-hidden mb-4 animate-fade-in">
            <div className="bg-muted px-4 py-2 flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Topic-wise Scores — {currentSubject.name}</h3>
              <Button variant="ghost" size="sm" onClick={handleAI} className="text-secondary" disabled={aiLoading}>
                {aiLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Lightbulb className="h-4 w-4 mr-1" />}
                AI Recommendations
              </Button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Topic</th>
                  <th className="px-4 py-2 text-center font-medium text-muted-foreground">Total</th>
                  <th className="px-4 py-2 text-center font-medium text-muted-foreground">Obtained</th>
                  <th className="px-4 py-2 text-center font-medium text-muted-foreground">%</th>
                </tr>
              </thead>
              <tbody>
                {(currentSubject.scores || []).map((score: any, i: number) => {
                  const pct = Math.round((score.obtained / score.total) * 100);
                  return (
                    <tr key={i} className="border-t border-border">
                      <td className="px-4 py-2 text-foreground">{score.topic}</td>
                      <td className="px-4 py-2 text-center text-foreground">{score.total}</td>
                      <td className="px-4 py-2 text-center text-foreground">{score.obtained}</td>
                      <td className="px-4 py-2 text-center">
                        <span className={pct >= 70 ? "text-success" : pct >= 50 ? "text-warning" : "text-destructive"}>{pct}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* AI Questions */}
        {showRecommendations && aiQuestions.length > 0 && (
          <div className="glass-card rounded-lg p-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-5 w-5 text-secondary" />
              <h3 className="text-sm font-semibold text-foreground">AI Practice Questions</h3>
            </div>
            <ul className="space-y-2">
              {aiQuestions.map((q: any, i: number) => (
                <li key={i} className="text-sm text-muted-foreground bg-muted/50 rounded-md p-3">
                  <span className="font-medium text-foreground">{i + 1}.</span> {q.question}
                  {q.topic && <span className="ml-2 text-xs text-primary">({q.topic})</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        <ManualEntryModal open={manualOpen} onClose={() => { setManualOpen(false); setEditingSubjectId(null); }} onSave={handleManualSave} />
      </main>
    </div>
  );
};

export default StudentDetail;
