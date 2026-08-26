import { Link } from "react-router-dom";
import { LayoutGrid, ArrowLeft } from "lucide-react";

export default function StaticPage({ title, content }) {
  return (
    <div className="min-h-screen bg-base-100 px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="mb-8 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-content">
            <LayoutGrid size={16} />
          </span>
          <span className="font-display text-sm font-bold text-base-content">
            Project<span className="text-primary">Portal</span>
          </span>
        </Link>

        <h1 className="font-display text-3xl font-bold text-base-content">{title}</h1>
        <p className="mt-6 leading-relaxed text-base-content/60">{content}</p>

        <Link to="/signup" className="mt-10 inline-flex items-center gap-1 text-sm font-medium text-primary hover:opacity-80">
          <ArrowLeft size={14} /> Back to Sign Up
        </Link>
      </div>
    </div>
  );
}