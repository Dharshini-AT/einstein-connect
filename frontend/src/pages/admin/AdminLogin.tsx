import { useState } from "react";
import { useNavigate } from "react-router-dom";
import schoolLogo from "@/assets/school-logo.png";
import { adminCredentials } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === adminCredentials.email && password === adminCredentials.password) {
      localStorage.setItem("loggedInUser", JSON.stringify({ role: "admin" }));
      navigate("/admin/dashboard");
    } else {
      toast({ title: "Login Failed", description: "Invalid admin credentials", variant: "destructive" });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md border-border bg-card animate-fade-in">
        <CardContent className="pt-8 pb-8 px-8">
          <div className="flex flex-col items-center gap-2 mb-6">
            <Shield className="h-8 w-8 text-destructive" />
            <img src={schoolLogo} alt="Logo" width={80} height={80} className="my-2" />
            <h1 className="text-lg font-bold text-foreground">Admin Portal</h1>
            <p className="text-xs text-muted-foreground">Einstein Matric Higher Secondary School</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" placeholder="admin@einstein.edu" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} className="pl-10" placeholder="••••••••" />
              </div>
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold">Sign In as Admin</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
