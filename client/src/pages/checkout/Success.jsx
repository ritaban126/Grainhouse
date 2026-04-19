import { Link } from "react-router-dom";
 
export function CheckoutSuccess() {
  return (
    <div className="max-w-md mx-auto px-6 py-20 text-center">
      <div className="w-14 h-14 rounded-full border border-green-500/40 bg-green-500/10 flex items-center justify-center text-green-400 text-2xl mx-auto mb-6">✓</div>
      <h1 className="font-serif text-4xl mb-3">Purchase complete.</h1>
      <p className="font-mono text-xs text-paper/45 mb-8 leading-relaxed">
        Your images are ready to download from your dashboard.
        A receipt has been sent to your email.
      </p>
      <div className="flex gap-3 justify-center">
        <Link to="/dashboard/purchases"
          className="font-mono text-xs bg-paper text-ink px-6 py-2.5 rounded-sm hover:bg-paper/90 transition-colors">
          Download images
        </Link>
        <Link to="/gallery"
          className="font-mono text-xs border border-border text-paper/50 px-6 py-2.5 rounded-sm hover:text-paper hover:border-paper/30 transition-colors">
          Browse more
        </Link>
      </div>
    </div>
  );
}