import { Link } from "react-router-dom";
import { LayoutGrid } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const columns = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "How it works", href: "#home" },
        { label: "Sign in", href: "/login" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "#about" },
        { label: "Contact", href: "#contact" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Terms of Service", href: "/terms" },
        { label: "Privacy Policy", href: "/privacy" },
      ],
    },
  ];

  return (
    <footer className="border-t border-base-300 bg-base-100 px-6 pt-16 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-content">
                <LayoutGrid size={16} />
              </span>
              <span className="font-display text-sm font-bold text-base-content">
                Project Management Portal
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-base-content/50">
              A single system of record for planning, assigning, and tracking
              project work.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("#") ? (
                      <a href={link.href} className="text-sm text-base-content/60 hover:text-base-content">
                        {link.label}
                      </a>
                    ) : (
                      <Link to={link.href} className="text-sm text-base-content/60 hover:text-base-content">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-base-300 py-6 text-xs text-base-content/40 sm:flex-row">
          <p>© {currentYear} Project Management Portal. All rights reserved.</p>
          <p className="font-mono uppercase tracking-widest">Built for structured project delivery.</p>
        </div>
      </div>
    </footer>
  );
}