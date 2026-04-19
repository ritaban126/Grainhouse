const EmptyState = ({ title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
    <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-paper/20 text-2xl">
      ◻
    </div>
    <h3 className="font-serif text-2xl text-paper/60">{title}</h3>
    {description && <p className="font-mono text-xs text-paper/35 max-w-xs leading-relaxed">{description}</p>}
    {action && <div className="mt-2">{action}</div>}
  </div>
);

export default EmptyState