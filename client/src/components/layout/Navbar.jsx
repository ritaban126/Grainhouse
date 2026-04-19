import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";
import { useClickOutside } from "../../hooks/useClickOutside.js";

const NAV_LINKS = [
  { label: "Explore", href: "/gallery" },
  { label: "Channels", href: "/gallery" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contributors", href: "/contributor/dashboard" },
];

export default function Navbar() {
  const { user, isAuth, isAdmin, isContributor, logout } = useAuth();
  const { count } = useCart();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuRef = useClickOutside(() => setUserMenu(false));

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav
      className={`
        sticky top-0 z-50 transition-all duration-300
        ${scrolled
          ? "bg-white border-b border-black/10"
          : "bg-transparent border-b border-transparent"}
      `}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link
          to="/"
          className={`font-serif text-xl tracking-tight shrink-0 transition-colors
            ${scrolled ? "text-black" : "text-paper"}
          `}
        >
          Grainhouse
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((l) => (
            <li key={l.label}>
              <Link
                to={l.href}
                className={`font-mono text-xs tracking-widest uppercase transition-colors
                  ${
                    scrolled
                      ? "text-black/70 hover:text-black"
                      : pathname === l.href
                        ? "text-paper"
                        : "text-paper/45 hover:text-paper/80"
                  }
                `}
              >
                {l.label}
              </Link>
            </li>
          ))}

          {isAdmin && (
            <li>
              <Link
                to="/admin"
                className={`font-mono text-xs tracking-widest uppercase transition-colors
                  ${scrolled
                    ? "text-black hover:text-black/70"
                    : "text-accent hover:text-accent/80"}
                `}
              >
                Admin
              </Link>
            </li>
          )}
        </ul>

        {/* Right side */}
        <div className="flex items-center gap-3 shrink-0">

          {/* Cart */}
          <Link
            to="/dashboard/purchases"
            className={`relative p-2 transition-colors
              ${scrolled
                ? "text-black/70 hover:text-black"
                : "text-paper/50 hover:text-paper"}
            `}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>

            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-black text-white text-[9px] font-mono font-bold flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>

          {/* Auth */}
          {isAuth ? (
            <div className="relative" ref={menuRef}>
              <button onClick={() => setUserMenu(v => !v)} className="flex items-center gap-2">
                {user?.avatar?.url ? (
                  <img
                    src={user.avatar.url}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs border
                    ${scrolled
                      ? "text-black border-black/20 bg-black/5"
                      : "text-paper/60 border-border bg-paper/10"}
                  `}>
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                )}
              </button>

              {userMenu && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-black/10 rounded-sm shadow-xl">
                  <div className="px-4 py-3 border-b border-black/10">
                    <p className="text-sm text-black truncate">{user?.name}</p>
                    <p className="font-mono text-xs text-black/50 truncate">{user?.email}</p>
                  </div>

                  <div className="py-1">
                    <MenuLink to="/dashboard" label="Dashboard" />
                    <MenuLink to="/dashboard/purchases" label="My Purchases" />
                    <MenuLink to="/dashboard/saved" label="Saved" />
                    {isContributor && <MenuLink to="/contributor/dashboard" label="Studio" />}
                    {isContributor && <MenuLink to="/contributor/upload" label="Upload Image" />}
                    <MenuLink to="/dashboard/settings" label="Settings" />
                  </div>

                  <div className="border-t border-black/10 py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 font-mono text-xs text-black/60 hover:text-black hover:bg-black/5"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className={`hidden md:block font-mono text-xs transition-colors
                  ${scrolled ? "text-black hover:text-black/70" : "text-paper/50 hover:text-paper"}
                `}
              >
                Sign in
              </Link>

              <Link
                to="/register"
                className={`hidden md:block font-mono text-xs px-4 py-2 rounded-sm transition-colors
                  ${scrolled
                    ? "bg-black text-white hover:bg-black/90"
                    : "bg-paper text-ink hover:bg-paper/90"}
                `}
              >
                Get started
              </Link>
            </>
          )}

          {/* Mobile */}
          <button className="md:hidden p-1" onClick={() => setMobileOpen(v => !v)}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              {mobileOpen
                ? <path d="M6 18L18 6M6 6l12 12"/>
                : <path d="M3 12h18M3 6h18M3 18h18"/>}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-black/10 bg-white px-6 py-4 flex flex-col gap-3">
          {NAV_LINKS.map(l => (
            <Link
              key={l.label}
              to={l.href}
              className="font-mono text-xs uppercase text-black/70 py-2"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

const MenuLink = ({ to, label }) => (
  <Link
    to={to}
    className="block px-4 py-2 font-mono text-xs text-black/60 hover:text-black hover:bg-black/5"
  >
    {label}
  </Link>
);