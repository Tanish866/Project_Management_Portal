import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  LayoutGrid,
  Users,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { logoutUser } from "../redux/slices/AuthSlice";

export default function AdminLayout({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "portal-light");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("adminSidebarCollapsed") === "true");

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "A";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("adminSidebarCollapsed", collapsed);
  }, [collapsed]);

  function toggleTheme() {
    setTheme((prev) => (prev === "portal-light" ? "portal-dark" : "portal-light"));
  }

  function toggleCollapse() {
    setCollapsed((prev) => !prev);
  }

  function handleLogout() {
    dispatch(logoutUser());
  }

  const navItems = [
    { to: "/admin", label: "Dashboard", icon: <LayoutGrid size={18} />, end: true },
    { to: "/admin/users", label: "Users", icon: <Users size={18} /> },
  ];

  return (
    <div className="flex min-h-screen bg-base-100">
      <aside
        className={`group/sidebar fixed inset-y-0 left-0 z-30 flex flex-col border-r border-base-300 bg-base-100 transition-all duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "w-20" : "w-64"}`}
      >
        <div className={`flex items-center border-b border-base-300 px-6 py-5 ${collapsed ? "justify-center px-3" : "gap-2.5"}`}>
          <svg width="32" height="32" viewBox="0 0 34 34" fill="none" className="shrink-0">
            <path d="M17 2L30 9.5V24.5L17 32L4 24.5V9.5L17 2Z" stroke="var(--color-primary)" strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M17 2V17M17 17L30 9.5M17 17L4 9.5M17 17V32" stroke="var(--color-primary)" strokeWidth="1.4" opacity="0.5" />
          </svg>
          {!collapsed && (
            <span className="font-display text-base font-bold text-base-content">
              Project<span className="text-primary">Portal</span>
            </span>
          )}
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  collapsed ? "justify-center px-0" : ""
                } ${
                  isActive
                    ? "bg-primary text-primary-content"
                    : "text-base-content/70 hover:bg-base-200"
                }`
              }
            >
              {item.icon}
              {!collapsed && item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-base-300 p-4">
          <div className={`flex items-center gap-3 rounded-xl px-2 py-2 ${collapsed ? "justify-center px-0" : ""}`}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-content">
              {userInitial}
            </div>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-base-content">{user?.name}</p>
                  <p className="text-xs text-base-content/40">Admin</p>
                </div>
                <button onClick={handleLogout} className="btn btn-ghost btn-circle btn-sm" aria-label="Logout">
                  <LogOut size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        <button
          onClick={toggleCollapse}
          className="absolute -right-3 top-20 hidden h-6 w-6 items-center cursor-pointer justify-center rounded-full border border-base-300 bg-base-100 text-base-content/50 opacity-0 shadow-sm transition-opacity hover:text-base-content group-hover/sidebar:opacity-100 lg:flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 transition-all duration-300">
        <header className="flex items-center justify-end border-b border-base-300 bg-base-100 px-6 py-4">
          <button className="btn btn-ghost btn-circle mr-auto lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-3">
            <Link to="/" className="hidden text-sm text-base-content/50 hover:text-base-content lg:block">
              ← Back to site
            </Link>
            <button className="btn btn-ghost btn-circle border border-base-300" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "portal-light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}