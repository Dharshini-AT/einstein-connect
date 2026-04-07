import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, BookOpen, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";

interface GradeInfo {
  grade: string;
  students: any[];
  presentToday: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [grades, setGrades] = useState<GradeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [facultyName, setFacultyName] = useState("Faculty");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.name) setFacultyName(user.name);

    const fetchGrades = async () => {
      try {
        // Get assigned grades from faculty profile
        const assignedGrades: string[] = user?.assignedGrades || [];
        if (assignedGrades.length === 0) {
          // fallback: fetch from API using the user id
          if (user?._id) {
            const gradeIds = await api.get(`/faculty/${user._id}/grades`);
            const gradeData = await Promise.all(
              gradeIds.map(async (grade: string) => {
                const students = await api.get(`/grades/${encodeURIComponent(grade)}/students`);
                const presentToday = students.filter((s: any) => {
                  const total = s.attendance?.length || 0;
                  const present = s.attendance?.filter((a: any) => a.status === 'present').length || 0;
                  return total > 0 ? (present / total) > 0.75 : true;
                }).length;
                return { grade, students, presentToday };
              })
            );
            setGrades(gradeData);
          }
        } else {
          const gradeData = await Promise.all(
            assignedGrades.map(async (grade: string) => {
              const students = await api.get(`/grades/${encodeURIComponent(grade)}/students`);
              const presentToday = students.filter((s: any) => {
                const total = s.attendance?.length || 0;
                const present = s.attendance?.filter((a: any) => a.status === 'present').length || 0;
                return total > 0 ? (present / total) > 0.75 : true;
              }).length;
              return { grade, students, presentToday };
            })
          );
          setGrades(gradeData);
        }
      } catch (err) {
        console.error("Failed to fetch grade data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container py-8 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Welcome {facultyName}!</h1>
          <p className="text-accent text-sm font-medium mt-1">Einstein Matric Higher Secondary School</p>
        </div>

        <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Assigned Classes</h2>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading your classes...
          </div>
        ) : grades.length === 0 ? (
          <p className="text-muted-foreground text-sm">No grades assigned yet. Contact the admin.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            {grades.map(g => (
              <button
                key={g.grade}
                onClick={() => navigate(`/students/grade/${encodeURIComponent(g.grade)}`)}
                className="glass-card rounded-lg p-6 text-left hover:border-primary transition-all group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-lg gradient-primary p-2.5">
                    <BookOpen className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {g.grade}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Users className="h-4 w-4" />
                  <span>{g.students.length} Students</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Present today: {g.presentToday} / {g.students.length}
                </p>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
