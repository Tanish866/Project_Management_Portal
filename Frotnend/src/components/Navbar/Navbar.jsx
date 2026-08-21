import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Sun, Moon, Menu, X, User } from "lucide-react";
import { logoutUser } from "../../redux/slices/AuthSlice";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "portal-light");

  const dispatch = useDispatch();
  const { isLoggedin, user } = useSelector((state) => state.auth);
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggleMenu() {
    setIsMenuOpen((prev) => !prev);
  }
  function closeMenu() {
    setIsMenuOpen(false);
  }
  function toggleTheme() {
    setTheme((prev) => (prev === "portal-light" ? "portal-dark" : "portal-light"));
  }
  function handleLogout() {
    dispatch(logoutUser());
  }

  return (
    <div className="navbar min-h-24 border-b border-base-300 bg-base-100 px-4 py-3 sm:px-6 lg:px-10">
      <div className="navbar-start">
        <a href="#home" className="flex items-center gap-3">
          <svg width="40" height="40" viewBox="0 0 34 34" fill="none">
            <path d="M17 2L30 9.5V24.5L17 32L4 24.5V9.5L17 2Z" stroke="var(--color-primary)" strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M17 2V17M17 17L30 9.5M17 17L4 9.5M17 17V32" stroke="var(--color-primary)" strokeWidth="1.4" opacity="0.5" />
          </svg>
          <span className="leading-tight">
            <span className="block font-display text-lg font-bold text-base-content">
              Project<span className="text-primary">Portal</span>
            </span>
            <span className="block text-xs text-base-content/40">Project Management System</span>
          </span>
        </a>
      </div>

      <div className="navbar-center hidden md:flex">
        <ul className="flex items-center gap-9">
          <li><a href="#home" className="text-sm font-medium text-primary">Home</a></li>
          <li><a href="#about" className="text-sm font-medium text-base-content/70 hover:text-base-content">About</a></li>
          <li><a href="#features" className="text-sm font-medium text-base-content/70 hover:text-base-content">Features</a></li>
          <li><a href="#contact" className="text-sm font-medium text-base-content/70 hover:text-base-content">Contact</a></li>
        </ul>
      </div>

      <div className="navbar-end gap-3">
        <button className="btn btn-ghost btn-circle border border-base-300 hidden md:flex" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "portal-light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {isLoggedin ? (
          <div className="dropdown dropdown-end hidden md:block">
            <div tabIndex={0} role="button" className="flex cursor-pointer items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-content">
                {userInitial}
              </div>
            </div>
            <ul tabIndex={0} className="dropdown-content menu z-10 mt-3 w-40 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg">
              <li><button onClick={handleLogout}>Logout</button></li>
            </ul>
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary hidden rounded-full px-7 md:flex">
            <User size={16} /> Login / Register
          </Link>
        )}

        <div className="dropdown dropdown-end md:hidden">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle" onClick={toggleMenu}>
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </div>
          <ul tabIndex={0} className="dropdown-content menu z-10 mt-3 w-52 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg">
            <li><a href="#home" onClick={closeMenu}>Home</a></li>
            <li><a href="#about" onClick={closeMenu}>About</a></li>
            <li><a href="#features" onClick={closeMenu}>Features</a></li>
            <li><a href="#dashboard" onClick={closeMenu}>Dashboard</a></li>
            <li><a href="#contact" onClick={closeMenu}>Contact</a></li>
            {isLoggedin ? (
              <li><button onClick={() => { handleLogout(); closeMenu(); }}>Logout</button></li>
            ) : (
              <li><Link to="/login" onClick={closeMenu}>Login / Register</Link></li>
            )}
            <li>
              <button onClick={toggleTheme} className="flex items-center gap-2">
                {theme === "portal-light" ? <Moon size={16} /> : <Sun size={16} />}
                {theme === "portal-light" ? "Dark Mode" : "Light Mode"}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}