import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base-100 px-4 text-center">
      <p className="font-display text-7xl font-bold text-primary">404</p>
      <h1 className="mt-4 text-xl font-semibold text-base-content">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-base-content/50">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link to="/" className="btn btn-primary mt-8 rounded-xl">
        <Home size={16} /> Back to Home
      </Link>
    </div>
  );
}