import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sun, Moon, Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

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
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  return (
    <div className="navbar bg-base-100 px-4 shadow-sm sm:px-6 lg:px-10">
      <div className="navbar-start">
        <a href="#home" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
            📋
          </span>
          <span className="text-lg font-bold text-base-content">
            Project Management Portal
          </span>
        </a>
      </div>

      <div className="navbar-center hidden md:flex">
        <ul className="flex items-center gap-8">
          <li>
            <a
              href="#home"
              className="text-sm font-medium text-base-content/70 hover:text-base-content"
            >
              Home
            </a>
          </li>
          <li>
            <a
              href="#features"
              className="text-sm font-medium text-base-content/70 hover:text-base-content"
            >
              Features
            </a>
          </li>
          <li>
            <a
              href="#about"
              className="text-sm font-medium text-base-content/70 hover:text-base-content"
            >
              About
            </a>
          </li>
          <li>
            <a
              href="#contact"
              className="text-sm font-medium text-base-content/70 hover:text-base-content"
            >
              Contact
            </a>
          </li>
        </ul>
      </div>

      <div className="navbar-end gap-2">
        <Link to="/login" className="btn btn-primary hidden md:flex">
          Login
        </Link>

        <button
          className="btn btn-ghost btn-circle hidden md:flex"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div className="dropdown dropdown-end md:hidden">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu z-10 mt-3 w-52 rounded-box bg-base-100 p-2 shadow-lg"
          >
            <li>
              <a href="#home" onClick={closeMenu}>
                Home
              </a>
            </li>
            <li>
              <a href="#features" onClick={closeMenu}>
                Features
              </a>
            </li>
            <li>
              <a href="#about" onClick={closeMenu}>
                About
              </a>
            </li>
            <li>
              <a href="#contact" onClick={closeMenu}>
                Contact
              </a>
            </li>
            <li>
              <Link to="/login" onClick={closeMenu}>
                Login
              </Link>
            </li>
            <li>
              <button onClick={toggleTheme} className="flex items-center gap-2">
                {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
                {theme === "light" ? "Dark Mode" : "Light Mode"}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}