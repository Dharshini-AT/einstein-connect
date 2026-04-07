import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { faculty } from "@/data/mockData";
import { LogOut, User, Phone, BadgeCheck, CalendarCheck } from "lucide-react";

const ProfileDropdown = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/");
  };

  const attendanceDisplay = faculty.attendance === "Half-day" ? "-" : faculty.attendance;

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="rounded-full overflow-hidden border-2 border-primary w-10 h-10">
        <img src={faculty.profileImage} alt={faculty.name} className="w-full h-full object-cover" />
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-72 rounded-lg border border-border bg-card shadow-xl z-50 animate-fade-in">
          <div className="p-4">
            <div className="flex items-start gap-3 mb-4">
              <img src={faculty.profileImage} alt={faculty.name} className="w-16 h-16 rounded-lg border border-border" />
              <div>
                <h3 className="font-semibold text-foreground">{faculty.name}</h3>
                <p className="text-xs text-muted-foreground">{faculty.id}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{faculty.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <BadgeCheck className="h-4 w-4" />
                <span>Status: </span>
                <span className={faculty.status === "Continuing" ? "text-success font-medium" : "text-destructive font-medium"}>
                  {faculty.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarCheck className="h-4 w-4" />
                <span>Attendance: </span>
                <span className={
                  attendanceDisplay === "Present" ? "text-success font-medium" :
                  attendanceDisplay === "Absent" ? "text-destructive font-medium" :
                  "text-warning font-medium"
                }>
                  {attendanceDisplay}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-border">
            <button
              onClick={() => { setOpen(false); }}
              className="flex items-center gap-2 w-full px-4 py-3 text-sm text-muted-foreground hover:bg-muted transition-colors"
            >
              <User className="h-4 w-4" /> Profile
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-3 text-sm text-destructive hover:bg-muted transition-colors rounded-b-lg"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
