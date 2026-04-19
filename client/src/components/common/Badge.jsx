const Badge = ({ children, color = "default" }) => {
  const colors = {
    default: "bg-paper/8 text-paper/60 border-border",
    green:   "bg-[#0d1f13] text-[#7dca9a] border-[#2d5a3d]",
    red:     "bg-[#1f0d0d] text-[#ca7d7d] border-[#5a2d2d]",
    amber:   "bg-[#1f1a0d] text-[#cab67d] border-[#5a4a2d]",
    blue:    "bg-[#0d1520] text-[#7db0ca] border-[#2d4a6a]",
    purple:  "bg-[#130d1f] text-[#b07dca] border-[#3a2d5a]",
  };
  return (
    <span className={`inline-block font-mono text-[10px] tracking-wider px-2 py-0.5 border rounded-sm ${colors[color]}`}>
      {children}
    </span>
  );
};


export default Badge