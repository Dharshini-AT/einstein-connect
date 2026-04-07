import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStudentsByGrade } from "@/data/mockData";
import { Eye, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";

const StudentList = () => {
  const { grade } = useParams<{ grade: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  const students = getStudentsByGrade(grade || "6");
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.rollNo.toString().includes(searchTerm)
  );
  
  const presentToday = filteredStudents.filter(s => s.attendancePercentage > 75).length;

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
                <span className="font-medium text-foreground">grade-{grade}</span>
              </div>
              <h1 className="text-xl font-bold text-foreground">Grade {grade} - Students</h1>
              <p className="text-sm text-muted-foreground">
                Present today: {presentToday} / {filteredStudents.length}
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

        <div className="rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <div className="max-h-[60vh] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted z-10">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground w-24">Roll No</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground min-w-[150px]">Student Name</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground w-20">Grade</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground w-32">Attendance %</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground w-20">Score</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground w-20">View</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s, i) => (
                    <tr key={s.rollNo} className={`border-t border-border hover:bg-muted/50 transition-colors ${i % 2 === 0 ? "" : "bg-muted/20"}`}>
                      <td className="px-4 py-3 text-foreground font-mono">{s.rollNo}</td>
                      <td className="px-4 py-3 text-foreground">{s.name}</td>
                      <td className="px-4 py-3 text-center text-foreground">{s.grade}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={s.attendancePercentage >= 85 ? "text-success" : s.attendancePercentage >= 75 ? "text-warning" : "text-destructive"}>
                          {s.attendancePercentage}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-foreground font-medium">{s.score}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => navigate(`/student/${s.rollNo}`)} className="text-primary hover:text-primary/80 transition-colors">
                          <Eye className="h-4 w-4 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentList;
