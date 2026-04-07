import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStudentByRollNo, getAIRecommendation, TopicScore } from "@/data/mockData";
import { ArrowLeft, Eye, Edit, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import ManualEntryModal from "@/components/ManualEntryModal";

const StudentDetail = () => {
  const { rollNo } = useParams<{ rollNo: string }>();
  const navigate = useNavigate();
  const student = getStudentByRollNo(rollNo || "");
  const [manualOpen, setManualOpen] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [topicScoresView, setTopicScoresView] = useState<string | null>(null);
  const [localTopics, setLocalTopics] = useState<TopicScore[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Student not found</p>
      </div>
    );
  }

  const subject = student.subjects[0];
  const topics = topicScoresView ? localTopics : subject.topics;

  const handleViewTopics = (subjectId: string) => {
    if (topicScoresView === subjectId) {
      setTopicScoresView(null);
      setShowRecommendations(false);
    } else {
      setTopicScoresView(subjectId);
      setLocalTopics([...subject.topics]);
      setShowRecommendations(false);
    }
  };

  const handleManualSave = (data: { title: string; totalMarks: number; obtainedMarks: number }) => {
    if (editingTopicId) {
      setLocalTopics(prev => prev.map(t =>
        t.topicId === editingTopicId
          ? { ...t, topicName: data.title, totalMarks: data.totalMarks, obtainedMarks: data.obtainedMarks }
          : t
      ));
    } else {
      setLocalTopics(prev => [
        ...prev,
        { topicId: `T${prev.length + 1}`, topicName: data.title, totalMarks: data.totalMarks, obtainedMarks: data.obtainedMarks },
      ]);
    }
    setEditingTopicId(null);
    setManualOpen(false);
  };

  const recommendations = getAIRecommendation(topics);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container py-6 animate-fade-in max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        {/* Profile Section */}
        <div className="glass-card rounded-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <img src={student.profileImage} alt={student.name} className="w-20 h-20 rounded-lg border border-border" />
            <div>
              <h1 className="text-xl font-bold text-foreground">{student.name}</h1>
              <p className="text-sm text-muted-foreground font-mono">{student.rollNo}</p>
              <p className="text-sm text-muted-foreground mt-1">Grade {student.grade} | Attendance: {student.attendancePercentage}%</p>
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
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Score</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">View</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Edit</th>
              </tr>
            </thead>
            <tbody>
              {student.subjects.map(sub => (
                <tr key={sub.subjectId} className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-foreground">{sub.subjectId}</td>
                  <td className="px-4 py-3 text-foreground">{sub.subjectName}</td>
                  <td className="px-4 py-3 text-center text-foreground font-medium">{sub.obtainedScore}/{sub.totalScore}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleViewTopics(sub.subjectId)} className="text-primary hover:text-primary/80">
                      <Eye className="h-4 w-4 mx-auto" />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => { setEditingTopicId(null); setManualOpen(true); }} className="text-accent hover:text-accent/80">
                      <Edit className="h-4 w-4 mx-auto" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Topic Scores */}
        {topicScoresView && (
          <div className="rounded-lg border border-border overflow-hidden mb-4 animate-fade-in">
            <div className="bg-muted px-4 py-2 flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Topic-wise Scores - Mathematics</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRecommendations(!showRecommendations)}
                className="text-accent"
              >
                <Lightbulb className="h-4 w-4 mr-1" /> AI Recommendations
              </Button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Topic ID</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Topic Name</th>
                  <th className="px-4 py-2 text-center font-medium text-muted-foreground">Total</th>
                  <th className="px-4 py-2 text-center font-medium text-muted-foreground">Obtained</th>
                  <th className="px-4 py-2 text-center font-medium text-muted-foreground">%</th>
                  <th className="px-4 py-2 text-center font-medium text-muted-foreground">Edit</th>
                </tr>
              </thead>
              <tbody>
                {topics.map(t => {
                  const pct = Math.round((t.obtainedMarks / t.totalMarks) * 100);
                  return (
                    <tr key={t.topicId} className="border-t border-border">
                      <td className="px-4 py-2 font-mono text-foreground">{t.topicId}</td>
                      <td className="px-4 py-2 text-foreground">{t.topicName}</td>
                      <td className="px-4 py-2 text-center text-foreground">{t.totalMarks}</td>
                      <td className="px-4 py-2 text-center text-foreground">{t.obtainedMarks}</td>
                      <td className="px-4 py-2 text-center">
                        <span className={pct >= 70 ? "text-success" : pct >= 50 ? "text-warning" : "text-destructive"}>{pct}%</span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button onClick={() => { setEditingTopicId(t.topicId); setManualOpen(true); }} className="text-accent hover:text-accent/80">
                          <Edit className="h-4 w-4 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* AI Recommendations */}
        {showRecommendations && (
          <div className="glass-card rounded-lg p-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-5 w-5 text-accent" />
              <h3 className="text-sm font-semibold text-foreground">AI Practice Recommendations</h3>
            </div>
            <ul className="space-y-2">
              {recommendations.map((r, i) => (
                <li key={i} className="text-sm text-muted-foreground bg-muted/50 rounded-md p-3">{r}</li>
              ))}
            </ul>
          </div>
        )}

        <ManualEntryModal open={manualOpen} onClose={() => { setManualOpen(false); setEditingTopicId(null); }} onSave={handleManualSave} />
      </main>
    </div>
  );
};

export default StudentDetail;
