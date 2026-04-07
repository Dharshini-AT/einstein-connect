import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Missing fields", description: "Please enter your email and password.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const data = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", data.role);

      if (data.role === "admin") navigate("/admin/dashboard");
      else navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Sign In Failed", description: err.message || "Invalid credentials.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/google`;
  };

  return (
    <div
      className="bg-[#f9f9fb] font-['Inter',sans-serif] text-[#1a1c1d] min-h-screen flex items-center justify-center p-6"
      style={{
        backgroundImage: "radial-gradient(circle at 2px 2px, rgba(0,6,102,0.05) 1px, transparent 0)",
        backgroundSize: "32px 32px",
      }}
    >
      {/* Background blobs */}
      <div className="fixed -bottom-24 -left-24 w-96 h-96 bg-[#000666]/5 blur-[120px] rounded-full -z-10" />
      <div className="fixed -top-24 -right-24 w-96 h-96 bg-[#006a6a]/5 blur-[120px] rounded-full -z-10" />

      <main className="w-full max-w-lg">
        <div className="bg-white rounded-xl p-10 md:p-12 shadow-[0px_32px_64px_-12px_rgba(0,6,102,0.06)] relative overflow-hidden">

          {/* Branding Header */}
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-[#1a237e] rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[#8690ee]" style={{ fontSize: 36 }}>school</span>
            </div>
            <h1
              className="text-3xl font-extrabold text-[#000666] tracking-tight mb-2"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              Einstein Matric
            </h1>
            <p
              className="text-lg font-medium text-[#006a6a] tracking-wide"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              Faculty &amp; Admin Portal
            </p>
          </div>

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Email */}
            <div className="group">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-[#767683] mb-1.5 transition-colors group-focus-within:text-[#006a6a]"
              >
                Work Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@einsteinmatric.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full h-12 px-4 bg-[#e8e8ea] border-none rounded-lg focus:outline-none focus:ring-0 text-[#1a1c1d] placeholder:text-[#c6c5d4] transition-all"
                />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#006a6a] transition-all duration-300 group-focus-within:w-full" />
              </div>
            </div>

            {/* Password */}
            <div className="group">
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-[#767683] transition-colors group-focus-within:text-[#006a6a]"
                >
                  Password
                </label>
                <a href="#" className="text-xs font-semibold text-[#000666] hover:text-[#006a6a] transition-colors">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full h-12 px-4 bg-[#e8e8ea] border-none rounded-lg focus:outline-none focus:ring-0 text-[#1a1c1d] placeholder:text-[#c6c5d4] transition-all"
                />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#006a6a] transition-all duration-300 group-focus-within:w-full" />
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-br from-[#000666] to-[#1a237e] text-white font-bold rounded-full hover:shadow-lg hover:opacity-95 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</> : "Sign In"}
            </button>

            {/* Divider */}
            <div className="relative py-2 flex items-center gap-4">
              <div className="h-px flex-grow bg-[#e2e2e4]" />
              <span className="text-xs font-semibold text-[#c6c5d4] tracking-widest uppercase">OR</span>
              <div className="h-px flex-grow bg-[#e2e2e4]" />
            </div>

            {/* Google SSO */}
            <button
              type="button"
              onClick={handleGoogle}
              className="w-full h-12 flex items-center justify-center gap-3 bg-white border-2 border-[#e8e8ea] text-[#1a1c1d] font-bold rounded-full hover:bg-[#f3f3f5] transition-colors active:scale-[0.98]"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-10 pt-8 border-t border-[#f3f3f5] text-center">
            <p className="text-xs text-[#767683] flex items-center justify-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>support_agent</span>
              Need assistance?{" "}
              <a href="#" className="font-bold text-[#000666] hover:text-[#006a6a] underline decoration-[#000666]/20 underline-offset-4">
                Contact IT Support
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-[10px] text-[#c6c5d4] uppercase tracking-[0.2em]">
            © 2024 Einstein Matric Higher Secondary School. All Rights Reserved.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Login;
