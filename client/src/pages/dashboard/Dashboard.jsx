import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const cards = [
    { title: "My Purchases",   desc: "Download your licensed images",        href: "/dashboard/purchases", icon: "↓" },
    { title: "Saved Images",   desc: "Your bookmarked collection",            href: "/dashboard/saved",     icon: "♡" },
    { title: "Credits",        desc: `${user?.credits || 0} credits remaining`, href: "/pricing",          icon: "◈" },
    { title: "Settings",       desc: "Profile, avatar, password",            href: "/dashboard/settings",  icon: "⚙" },
  ];
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-10">
        <p className="font-mono text-xs text-paper/35 tracking-widest uppercase mb-2">Dashboard</p>
        <h1 className="font-serif text-4xl">Welcome back, {user?.name?.split(" ")[0]}.</h1>
        <p className="font-mono text-xs text-paper/40 mt-2">
          Plan: <span className="text-paper capitalize">{user?.plan || "free"}</span>
          {" · "}Credits: <span className="text-paper">{user?.credits || 0}</span>
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {cards.map(c => (
          <Link key={c.title} to={c.href}
            className="border border-border p-6 rounded-sm hover:border-paper/25 hover:bg-paper/3 transition-all group">
            <span className="text-2xl text-paper/30 group-hover:text-paper/60 transition-colors block mb-4">{c.icon}</span>
            <h2 className="font-serif text-xl mb-1">{c.title}</h2>
            <p className="font-mono text-xs text-paper/40">{c.desc}</p>
          </Link>
        ))}
      </div>
      {["contributor","admin"].includes(user?.role) && (
        <div className="mt-6 p-6 border border-accent/30 rounded-sm bg-accent/5">
          <p className="font-mono text-xs text-accent/70 tracking-widest uppercase mb-2">Studio</p>
          <h2 className="font-serif text-xl mb-3">Contributor tools</h2>
          <div className="flex gap-3 flex-wrap">
            <Link to="/contributor/upload"    className="font-mono text-xs border border-border px-4 py-2 rounded-sm hover:border-paper/30 transition-colors">Upload image</Link>
            <Link to="/contributor/dashboard" className="font-mono text-xs border border-border px-4 py-2 rounded-sm hover:border-paper/30 transition-colors">Earnings dashboard</Link>
            <Link to="/contributor/images"    className="font-mono text-xs border border-border px-4 py-2 rounded-sm hover:border-paper/30 transition-colors">My images</Link>
          </div>
        </div>
      )}
    </div>
  );
}