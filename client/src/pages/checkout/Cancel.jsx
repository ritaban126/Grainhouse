 
export function CheckoutCancel() {
  return (
    <div className="max-w-md mx-auto px-6 py-20 text-center">
      <h1 className="font-serif text-4xl mb-3">Payment cancelled.</h1>
      <p className="font-mono text-xs text-paper/45 mb-8">No charge was made.</p>
      <Link to="/gallery"
        className="font-mono text-xs border border-border text-paper/50 px-6 py-2.5 rounded-sm hover:text-paper hover:border-paper/30 transition-colors">
        Back to gallery
      </Link>
    </div>
  );
}