const SectionHeader = ({ label, title, subtitle }) => (
  <div className="mb-10">
    {label    && <p className="font-mono text-xs tracking-[0.2em] uppercase text-paper/35 mb-3">{label}</p>}
    {title    && <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.05] mb-3">{title}</h2>}
    {subtitle && <p className="font-mono text-sm text-paper/45 max-w-md leading-relaxed">{subtitle}</p>}
  </div>
);

export default SectionHeader