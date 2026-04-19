const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between gap-4 mb-8 pb-6 border-b border-border">
    <div>
      <h1 className="font-serif text-3xl mb-1">{title}</h1>
      {subtitle && <p className="font-mono text-xs text-paper/40">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export default PageHeader