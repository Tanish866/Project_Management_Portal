import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { User, Mail, Lock, Eye, EyeOff, LayoutGrid, Check } from "lucide-react";
import { registerUser } from "../../Redux/slices/AuthSlice";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (!formData.agreeToTerms) {
      alert("Please agree to the Terms & Conditions");
      return;
    }

    const result = await dispatch(
      registerUser({ name: formData.fullName, email: formData.email, password: formData.password })
    );

    if (registerUser.fulfilled.match(result)) navigate("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 px-4 py-10">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-xl md:grid-cols-2">
        <div className="hidden flex-col justify-between bg-secondary/5 p-10 md:flex">
          <div className="flex items-center gap-2">
            <span className="tab-mark flex h-9 w-9 items-center justify-center bg-secondary text-secondary-content">
              <LayoutGrid size={18} />
            </span>
            <span className="font-display text-sm font-bold text-base-content">Project Management Portal</span>
          </div>

          <div>
            <p className="font-tag text-[11px] uppercase tracking-widest text-secondary">New workspace</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-base-content">Create your account</h2>
            <p className="mt-2 text-sm text-base-content/60">
              Join the portal and start managing your projects like a pro.
            </p>
          </div>

          <svg viewBox="0 0 320 220" className="mx-auto w-full max-w-[280px]">
            <rect x="60" y="90" width="150" height="90" rx="12" fill="var(--color-base-100)" stroke="var(--color-base-300)" strokeWidth="2" transform="rotate(-6 135 135)" />
            <rect x="80" y="80" width="150" height="90" rx="12" fill="var(--color-base-100)" stroke="var(--color-base-300)" strokeWidth="2" transform="rotate(3 155 125)" />
            <rect x="95" y="70" width="150" height="90" rx="12" fill="var(--color-base-100)" stroke="var(--color-secondary)" strokeWidth="2" />
            <rect x="113" y="90" width="70" height="8" rx="4" fill="var(--color-base-300)" />
            <rect x="113" y="106" width="100" height="6" rx="3" fill="var(--color-base-300)" />
            <rect x="113" y="120" width="85" height="6" rx="3" fill="var(--color-base-300)" />
            <rect x="106" y="70" width="14" height="90" fill="var(--color-secondary)" opacity="0.85" />
            <circle cx="215" cy="80" r="16" fill="var(--color-secondary)" />
            <path d="M208 80 l5 5 l10 -10" stroke="var(--color-secondary-content)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="52" cy="70" r="5" fill="var(--color-accent)" opacity="0.7" />
            <circle cx="262" cy="150" r="6" fill="var(--color-primary)" opacity="0.5" />
          </svg>
        </div>

        <div className="p-8 sm:p-10">
          <h1 className="font-display text-2xl font-bold text-base-content">Sign Up</h1>
          <p className="mt-1 text-sm text-base-content/50">Create your account to get started</p>

          {error && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-base-content">Full Name</label>
              <label className="flex items-center gap-2 rounded-field border border-base-300 bg-base-100 px-3 py-2.5 transition-colors focus-within:border-secondary">
                <User size={16} className="text-base-content/40" />
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-transparent text-sm text-base-content outline-none placeholder:text-base-content/30"
                />
              </label>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-base-content">Email Address</label>
              <label className="flex items-center gap-2 rounded-field border border-base-300 bg-base-100 px-3 py-2.5 transition-colors focus-within:border-secondary">
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
              <label className="flex items-center gap-2 rounded-field border border-base-300 bg-base-100 px-3 py-2.5 transition-colors focus-within:border-secondary">
                <Lock size={16} className="text-base-content/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-transparent text-sm text-base-content outline-none placeholder:text-base-content/30"
                />
                <button type="button" onClick={() => setShowPassword((prev) => !prev)}>
                  {showPassword ? <EyeOff size={16} className="text-base-content/40" /> : <Eye size={16} className="text-base-content/40" />}
                </button>
              </label>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-base-content">Confirm Password</label>
              <label className="flex items-center gap-2 rounded-field border border-base-300 bg-base-100 px-3 py-2.5 transition-colors focus-within:border-secondary">
                <Lock size={16} className="text-base-content/40" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-transparent text-sm text-base-content outline-none placeholder:text-base-content/30"
                />
                <button type="button" onClick={() => setShowConfirmPassword((prev) => !prev)}>
                  {showConfirmPassword ? <EyeOff size={16} className="text-base-content/40" /> : <Eye size={16} className="text-base-content/40" />}
                </button>
              </label>
            </div>

            <label className="flex items-start gap-2 text-sm text-base-content/60">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="checkbox checkbox-secondary checkbox-sm mt-0.5"
              />
              <span>
                I agree to the{" "}
                <Link to="/terms" className="font-medium text-secondary">Terms & Conditions</Link> and{" "}
                <Link to="/privacy" className="font-medium text-secondary">Privacy Policy</Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-field bg-secondary py-3 text-sm font-semibold text-secondary-content transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          

          <p className="mt-6 text-center text-sm text-base-content/50">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-secondary">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}