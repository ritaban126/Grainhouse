import Spinner from "./Spinner";

const Button = ({
  children, onClick, type = "button",
  variant = "primary", size = "md",
  loading = false, disabled = false,
  className = "", ...props
}) => {
  const base = "font-mono tracking-widest uppercase rounded-sm transition-all duration-200 inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed";
  const variants = {
    primary:   "bg-paper text-ink hover:bg-paper/90",
    secondary: "bg-transparent text-paper/60 border border-border hover:text-paper hover:border-paper/30",
    danger:    "bg-[#5a1a1a] text-[#f5a0a0] border border-[#8a3a3a] hover:bg-[#6a2a2a]",
    ghost:     "bg-transparent text-paper/50 hover:text-paper hover:bg-paper/5",
    accent:    "bg-accent text-ink hover:bg-accent/90",
  };
  const sizes = {
    sm: "text-[10px] px-3 py-1.5",
    md: "text-xs px-5 py-2.5",
    lg: "text-xs px-8 py-3.5",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
};

export default Button