import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Lock, LayoutGrid, Eye, EyeOff } from "lucide-react";
import { resetPassword } from "../../Redux/slices/AuthSlice";

export default function ResetPassword() {
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const result = await dispatch(resetPassword({ token, password }));
    setLoading(false);

    if (resetPassword.fulfilled.match(result)) {
      navigate("/login");
    } else {
      setError(result.payload || "Invalid or expired reset token");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-base-300 bg-base-100 p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-content">
            <LayoutGrid size={20} />
          </span>
          <h1 className="font-display text-xl font-bold text-base-content">Set a new password</h1>
        </div>

        {error && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex items-center gap-2 rounded-lg border border-base-300 bg-base-100 px-3 py-2.5 focus-within:border-primary">
            <Lock size={16} className="text-base-content/40" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-transparent text-sm text-base-content outline-none placeholder:text-base-content/30"
            />
            <button type="button" onClick={() => setShowPassword((p) => !p)}>
              {showPassword ? <EyeOff size={16} className="text-base-content/40" /> : <Eye size={16} className="text-base-content/40" />}
            </button>
          </label>

          <label className="flex items-center gap-2 rounded-lg border border-base-300 bg-base-100 px-3 py-2.5 focus-within:border-primary">
            <Lock size={16} className="text-base-content/40" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-transparent text-sm text-base-content outline-none placeholder:text-base-content/30"
            />
          </label>

          <button type="submit" disabled={loading} className="btn btn-primary w-full rounded-lg">
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-base-content/50">
          <Link to="/login" className="font-medium text-primary hover:opacity-80">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}