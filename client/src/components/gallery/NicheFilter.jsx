const NICHES = ["All","YouTube","Podcast","Notion","Game Dev","Newsletter","Blog"];
 
export const NicheFilter = ({ active, onChange }) => (
  <div className="flex gap-2 flex-wrap">
    {NICHES.map(n => (
      <button
        key={n}
        onClick={() => onChange(n === "All" ? "" : n)}
        className={`font-mono text-xs tracking-wide px-4 py-1.5 rounded-sm border transition-all
          ${(active === n || (!active && n === "All"))
            ? "bg-paper text-ink border-paper"
            : "border-border text-paper/45 hover:text-paper/80 hover:border-paper/25"}`}
      >
        {n}
      </button>
    ))}
  </div>
);