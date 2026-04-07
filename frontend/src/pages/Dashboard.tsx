import { useNavigate } from "react-router-dom";
import { faculty, grade6Students, grade8Students } from "@/data/mockData";
import { Users, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";

const Dashboard = () => {
  const navigate = useNavigate();

  const grades = [
    { grade: "6", students: grade6Students, presentToday: grade6Students.filter(s => s.attendancePercentage > 75).length },
    { grade: "8", students: grade8Students, presentToday: grade8Students.filter(s => s.attendancePercentage > 75).length },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container py-8 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Welcome {faculty.name}!</h1>
          <p className="text-accent text-sm font-medium mt-1">Einstein Matric Higher Secondary School</p>
        </div>

        <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Assigned Classes</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          {grades.map(g => (
            <button
              key={g.grade}
              onClick={() => navigate(`/students/grade/${g.grade}`)}
              className="glass-card rounded-lg p-6 text-left hover:border-primary transition-all group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg gradient-primary p-2.5">
                  <BookOpen className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  Grade {g.grade}
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
      </main>
    </div>
  );
};

export default Dashboard;
