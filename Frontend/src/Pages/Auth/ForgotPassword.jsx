import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Mail, LayoutGrid, ArrowRight } from "lucide-react";
import { forgotPassword } from "../../Redux/slices/AuthSlice";

export default function ForgotPassword() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [devToken, setDevToken] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const result = await dispatch(forgotPassword(email));
    setLoading(false);

    if (forgotPassword.fulfilled.match(result)) {
      setMessage("If an account with that email exists, a reset link has been sent.");
      if (result.payload?.resetToken) {
        setDevToken(result.payload.resetToken);
      }
    } else {
      setMessage(result.payload || "Something went wrong");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-base-300 bg-base-100 p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-content">
            <LayoutGrid size={20} />
          </span>
          <h1 className="font-display text-xl font-bold text-base-content">Reset your password</h1>
          <p className="mt-1 text-sm text-base-content/50">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        {message && (
          <p className="mb-4 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-base-content/80">
            {message}
          </p>
        )}

        {devToken && (
          <div className="mb-4 rounded-lg border border-amber-300/40 bg-amber-500/10 px-3 py-2 text-xs text-base-content/70">
            <p className="font-semibold text-amber-600">Dev mode — use this link:</p>
            <Link to={`/reset-password/${devToken}`} className="mt-1 block break-all text-primary underline">
              /reset-password/{devToken}
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex items-center gap-2 rounded-lg border border-base-300 bg-base-100 px-3 py-2.5 focus-within:border-primary">
            <Mail size={16} className="text-base-content/40" />
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent text-sm text-base-content outline-none placeholder:text-base-content/30"
            />
          </label>

          <button type="submit" disabled={loading} className="btn btn-primary w-full rounded-lg">
            {loading ? "Sending..." : "Send Reset Link"}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-base-content/50">
          Remembered your password?{" "}
          <Link to="/login" className="font-medium text-primary hover:opacity-80">Login</Link>
        </p>
      </div>
    </div>
  );
}