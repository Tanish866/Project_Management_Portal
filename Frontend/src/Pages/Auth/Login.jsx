import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Mail, Lock, Eye, EyeOff, LayoutGrid } from "lucide-react";
import { login } from "../../redux/slices/AuthSlice";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  function handleChange(e) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const result = await dispatch(login(formData));

    if (login.fulfilled.match(result)) {
      const role = result.payload.user.role;

      if (role === "ADMIN") {
        navigate("/admin");
      } else if (role === "PROJECT_MANAGER") {
        navigate("/manager");
      } else {
        navigate("/member");
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 px-4 py-10">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-xl md:grid-cols-2">
        <div className="hidden flex-col justify-between bg-primary/5 p-10 md:flex">
          <div className="flex items-center gap-2">
            <span className="tab-mark flex h-9 w-9 items-center justify-center bg-primary text-primary-content">
              <LayoutGrid size={18} />
            </span>
            <span className="font-display text-sm font-bold text-base-content">Project Management Portal</span>
          </div>

          <div>
            <p className="font-tag text-[11px] uppercase tracking-widest text-primary">Welcome back</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-base-content">Good to see you</h2>
            <p className="mt-2 text-sm text-base-content/60">
              Login to continue managing your projects and collaborating with your team.
            </p>
          </div>

          <svg viewBox="0 0 320 220" className="mx-auto w-full max-w-[280px]">
            <rect x="60" y="90" width="150" height="90" rx="12" fill="var(--color-base-100)" stroke="var(--color-base-300)" strokeWidth="2" transform="rotate(-6 135 135)" />
            <rect x="80" y="80" width="150" height="90" rx="12" fill="var(--color-base-100)" stroke="var(--color-base-300)" strokeWidth="2" transform="rotate(3 155 125)" />
            <rect x="95" y="70" width="150" height="90" rx="12" fill="var(--color-base-100)" stroke="var(--color-primary)" strokeWidth="2" />
            <rect x="113" y="90" width="70" height="8" rx="4" fill="var(--color-base-300)" />
            <rect x="113" y="106" width="100" height="6" rx="3" fill="var(--color-base-300)" />
            <rect x="113" y="120" width="85" height="6" rx="3" fill="var(--color-base-300)" />
            <rect x="106" y="70" width="14" height="90" fill="var(--color-primary)" opacity="0.85" />
            <circle cx="215" cy="80" r="16" fill="var(--color-primary)" />
            <path d="M208 80 l5 5 l10 -10" stroke="var(--color-primary-content)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="52" cy="70" r="5" fill="var(--color-accent)" opacity="0.7" />
            <circle cx="262" cy="150" r="6" fill="var(--color-secondary)" opacity="0.5" />
          </svg>
        </div>

        <div className="p-8 sm:p-10">
          <h1 className="font-display text-2xl font-bold text-base-content">Login</h1>
          <p className="mt-1 text-sm text-base-content/50">Enter your credentials to access your account</p>

          {error && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-base-content">Email Address</label>
              <label className="flex items-center gap-2 rounded-field border border-base-300 bg-base-100 px-3 py-2.5 transition-colors focus-within:border-primary">
                <Mail size={16} className="text-base-content/40" />
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-transparent text-sm text-base-content outline-none placeholder:text-base-content/30"
                />
              </label>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-base-content">Password</label>
              <label className="flex items-center gap-2 rounded-field border border-base-300 bg-base-100 px-3 py-2.5 transition-colors focus-within:border-primary">
                <Lock size={16} className="text-base-content/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-transparent text-sm text-base-content outline-none placeholder:text-base-content/30"
                />
                <button type="button" onClick={() => setShowPassword((prev) => !prev)}>
                  {showPassword ? <EyeOff size={16} className="text-base-content/40" /> : <Eye size={16} className="text-base-content/40" />}
                </button>
              </label>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-base-content/60">
                <input type="checkbox" className="checkbox checkbox-primary checkbox-sm" />
                Remember me
              </label>
              <Link to="/forgot-password" className="font-medium text-primary">Forgot Password?</Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-field bg-primary py-3 text-sm font-semibold text-primary-content transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-base-300" />
            <span className="font-tag text-[11px] uppercase tracking-widest text-base-content/40">or</span>
            <div className="h-px flex-1 bg-base-300" />
          </div>

          <button className="flex w-full items-center justify-center gap-2 rounded-field border border-base-300 py-2.5 text-sm font-medium text-base-content hover:bg-base-200">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-4 w-4" />
            Login with Google
          </button>

          <p className="mt-6 text-center text-sm text-base-content/50">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium text-primary">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}