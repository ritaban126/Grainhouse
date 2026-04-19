const Input = ({
  label, id, error, className = "", ...props
}) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label htmlFor={id} className="font-mono text-xs text-paper/50 tracking-wider uppercase">
        {label}
      </label>
    )}
    <input
      id={id}
      className={`
        bg-paper/5 border border-border text-paper text-sm px-4 py-2.5 rounded-sm
        placeholder:text-paper/25 focus:outline-none focus:border-paper/40
        transition-colors font-sans
        ${error ? "border-[#8a3a3a]" : ""}
        ${className}
      `}
      {...props}
    />
    {error && <p className="font-mono text-xs text-[#ca7d7d]">{error}</p>}
  </div>
);

export default Input