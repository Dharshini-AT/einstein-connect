import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { allFaculties, grade6Students, grade8Students, Faculty, Student } from "@/data/mockData";
import schoolLogo from "@/assets/school-logo.png";
import { Users, GraduationCap, LogOut, Plus, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type Tab = "teachers" | "students";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("teachers");
  const [faculties, setFaculties] = useState<Faculty[]>([...allFaculties]);
  const [students, setStudents] = useState<Student[]>([...grade6Students, ...grade8Students]);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/admin");
  };

  // Faculty CRUD
  const [fForm, setFForm] = useState({ id: "", name: "", email: "", phone: "", status: "Continuing" as Faculty["status"] });

  const openAddFaculty = () => {
    setFForm({ id: `FAC${String(faculties.length + 1).padStart(3, "0")}`, name: "", email: "", phone: "", status: "Continuing" });
    setEditingFaculty(null);
    setShowForm(true);
    setTab("teachers");
  };

  const openEditFaculty = (f: Faculty) => {
    setFForm({ id: f.id, name: f.name, email: f.email, phone: f.phone, status: f.status });
    setEditingFaculty(f);
    setShowForm(true);
  };

  const saveFaculty = () => {
    if (!fForm.name || !fForm.email) {
      toast({ title: "Error", description: "Name and email are required", variant: "destructive" });
      return;
    }
    if (editingFaculty) {
      setFaculties(prev => prev.map(f => f.id === editingFaculty.id ? {
        ...f, name: fForm.name, email: fForm.email, phone: fForm.phone, status: fForm.status,
      } : f));
      toast({ title: "Updated", description: "Faculty record updated" });
    } else {
      setFaculties(prev => [...prev, {
        ...fForm, attendance: "Present", profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${fForm.name}`, assignedGrades: [],
      }]);
      toast({ title: "Created", description: "Faculty record created" });
    }
    setShowForm(false);
    setEditingFaculty(null);
  };

  const deleteFaculty = (id: string) => {
    setFaculties(prev => prev.filter(f => f.id !== id));
    toast({ title: "Deleted", description: "Faculty removed" });
  };

  // Student CRUD
  const [sForm, setSForm] = useState({ rollNo: "", name: "", grade: "6", attendancePercentage: 90, score: 75 });

  const openAddStudent = () => {
    setSForm({ rollNo: `${students.length + 1}`, name: "", grade: "6", attendancePercentage: 90, score: 75 });
    setEditingStudent(null);
    setShowForm(true);
    setTab("students");
  };

  const openEditStudent = (s: Student) => {
    setSForm({ rollNo: s.rollNo, name: s.name, grade: s.grade, attendancePercentage: s.attendancePercentage, score: s.score });
    setEditingStudent(s);
    setShowForm(true);
  };

  const saveStudent = () => {
    if (!sForm.name || !sForm.rollNo) {
      toast({ title: "Error", description: "Name and roll no are required", variant: "destructive" });
      return;
    }
    if (editingStudent) {
      setStudents(prev => prev.map(s => s.rollNo === editingStudent.rollNo ? {
        ...s, name: sForm.name, grade: sForm.grade, attendancePercentage: sForm.attendancePercentage, score: sForm.score,
      } : s));
      toast({ title: "Updated", description: "Student record updated" });
    } else {
      setStudents(prev => [...prev, {
        ...sForm, profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${sForm.name}`, subjects: [],
      }]);
      toast({ title: "Created", description: "Student record created" });
    }
    setShowForm(false);
    setEditingStudent(null);
  };

  const deleteStudent = (rollNo: string) => {
    setStudents(prev => prev.filter(s => s.rollNo !== rollNo));
    toast({ title: "Deleted", description: "Student removed" });
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 border-r border-border bg-sidebar flex flex-col shrink-0">
        <div className="p-4 flex items-center gap-2 border-b border-border">
          <img src={schoolLogo} alt="Logo" width={28} height={28} />
          <span className="text-sm font-semibold text-sidebar-foreground">Admin Panel</span>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <button
            onClick={() => { setTab("teachers"); setShowForm(false); }}
            className={`flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm transition-colors ${tab === "teachers" ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent/50"}`}
          >
            <GraduationCap className="h-4 w-4" /> Teachers
          </button>
          <button
            onClick={() => { setTab("students"); setShowForm(false); }}
            className={`flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm transition-colors ${tab === "students" ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent/50"}`}
          >
            <Users className="h-4 w-4" /> Students
          </button>
        </nav>

        <div className="p-3 border-t border-border">
          <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm text-destructive hover:bg-muted transition-colors">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        {/* Form modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl animate-fade-in">
              <button onClick={() => { setShowForm(false); setEditingFaculty(null); setEditingStudent(null); }} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                {tab === "teachers" ? (editingFaculty ? "Edit Teacher" : "Add Teacher") : (editingStudent ? "Edit Student" : "Add Student")}
              </h2>

              {tab === "teachers" ? (
                <div className="space-y-3">
                  <div><Label>Faculty ID</Label><Input value={fForm.id} disabled className="bg-muted" /></div>
                  <div><Label>Name</Label><Input value={fForm.name} onChange={e => setFForm(p => ({ ...p, name: e.target.value }))} /></div>
                  <div><Label>Email</Label><Input value={fForm.email} onChange={e => setFForm(p => ({ ...p, email: e.target.value }))} /></div>
                  <div><Label>Phone</Label><Input value={fForm.phone} onChange={e => setFForm(p => ({ ...p, phone: e.target.value }))} /></div>
                  <div><Label>Status</Label>
                    <select value={fForm.status} onChange={e => setFForm(p => ({ ...p, status: e.target.value as Faculty["status"] }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="Continuing">Continuing</option>
                      <option value="Discontinued">Discontinued</option>
                      <option value="Relieved">Relieved</option>
                    </select>
                  </div>
                  <Button onClick={saveFaculty} className="w-full gradient-primary text-primary-foreground">Save</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div><Label>Roll No</Label><Input value={sForm.rollNo} onChange={e => setSForm(p => ({ ...p, rollNo: e.target.value }))} disabled={!!editingStudent} className={editingStudent ? "bg-muted" : ""} /></div>
                  <div><Label>Name</Label><Input value={sForm.name} onChange={e => setSForm(p => ({ ...p, name: e.target.value }))} /></div>
                  <div><Label>Grade</Label>
                    <select value={sForm.grade} onChange={e => setSForm(p => ({ ...p, grade: e.target.value }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="6">Grade 6</option>
                      <option value="8">Grade 8</option>
                    </select>
                  </div>
                  <div><Label>Attendance %</Label><Input type="number" value={sForm.attendancePercentage} onChange={e => setSForm(p => ({ ...p, attendancePercentage: Number(e.target.value) }))} /></div>
                  <div><Label>Score</Label><Input type="number" value={sForm.score} onChange={e => setSForm(p => ({ ...p, score: Number(e.target.value) }))} /></div>
                  <Button onClick={saveStudent} className="w-full gradient-primary text-primary-foreground">Save</Button>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "teachers" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-foreground">Teachers</h1>
              <Button onClick={openAddFaculty} size="sm" className="gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-1" /> Add</Button>
            </div>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">ID</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Phone</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {faculties.map(f => (
                    <tr key={f.id} className="border-t border-border hover:bg-muted/50">
                      <td className="px-4 py-3 font-mono text-foreground">{f.id}</td>
                      <td className="px-4 py-3 text-foreground">{f.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{f.email}</td>
                      <td className="px-4 py-3 text-muted-foreground">{f.phone}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={f.status === "Continuing" ? "text-success" : "text-destructive"}>{f.status}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openEditFaculty(f)} className="text-primary hover:text-primary/80"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => deleteFaculty(f.id)} className="text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === "students" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-foreground">Students</h1>
              <Button onClick={openAddStudent} size="sm" className="gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-1" /> Add</Button>
            </div>
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="max-h-[70vh] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-muted z-10">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Roll No</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">Grade</th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">Attendance</th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">Score</th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(s => (
                      <tr key={s.rollNo} className="border-t border-border hover:bg-muted/50">
                        <td className="px-4 py-3 font-mono text-foreground">{s.rollNo}</td>
                        <td className="px-4 py-3 text-foreground">{s.name}</td>
                        <td className="px-4 py-3 text-center text-foreground">{s.grade}</td>
                        <td className="px-4 py-3 text-center text-foreground">{s.attendancePercentage}%</td>
                        <td className="px-4 py-3 text-center text-foreground">{s.score}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => openEditStudent(s)} className="text-primary hover:text-primary/80"><Pencil className="h-4 w-4" /></button>
                            <button onClick={() => deleteStudent(s.rollNo)} className="text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
