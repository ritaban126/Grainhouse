import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { paymentAPI } from "../../api/services.js";
import { useState } from "react";
import { Button } from "../../components/common/index.jsx";

const PLANS = [
  {
    id: "free",
    name: "Starter",
    price: "₹0",
    period: "forever",
    desc: "For creators just getting started.",
    features: ["10 free images/month", "Attribution required", "Personal license only", "Access all niches"],
    cta: "Get started free",
    ctaVariant: "secondary",
    highlight: false,
  },
  {
    id: "creator",
    name: "Creator",
    price: "₹799",
    period: "/month",
    desc: "For active creators who need regular images.",
    features: ["50 downloads/month", "No attribution required", "Personal + commercial license", "Background removal included", "All niches"],
    cta: "Get Creator",
    ctaVariant: "primary",
    highlight: true,
  },
  {
    id: "studio",
    name: "Studio",
    price: "₹2,499",
    period: "/month",
    desc: "For agencies and professional studios.",
    features: ["200 downloads/month", "Team seats (up to 5)", "All license types", "CSV bulk licensing", "Priority support"],
    cta: "Get Studio",
    ctaVariant: "secondary",
    highlight: false,
  },
];
 
const CREDIT_PACKS = [
  { id: "starter",      credits: 5,  price: "₹499",   perCredit: "₹99/credit"  },
  { id: "popular",      credits: 20, price: "₹1,599",  perCredit: "₹79/credit", badge: "Best value" },
  { id: "professional", credits: 50, price: "₹3,499",  perCredit: "₹69/credit" },
];
 
export default function Pricing() {
  const { isAuth } = useAuth();
  const { error: toastErr } = useToast();
  const navigate = useNavigate();
  const [buying, setBuying] = useState(null);
 
  const handleCreditPack = async (packId) => {
    if (!isAuth) { navigate("/register"); return; }
    setBuying(packId);
    try {
      const { data } = await paymentAPI.buyCreditPack(packId);
      window.location.href = data.url;
    } catch (err) { toastErr(err.response?.data?.message || "Could not start checkout."); }
    finally { setBuying(null); }
  };
 
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center mb-14">
        <p className="font-mono text-xs text-paper/35 tracking-widest uppercase mb-3">Pricing</p>
        <h1 className="font-serif text-5xl tracking-tight mb-4">Credits that never expire.</h1>
        <p className="font-mono text-sm text-paper/45 max-w-sm mx-auto leading-relaxed">
          Subscribe for a monthly allowance, or buy credits that roll over forever. Your choice.
        </p>
      </div>
 
      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-px border border-border rounded-sm overflow-hidden mb-14">
        {PLANS.map(plan => (
          <div key={plan.id}
            className={`p-8 flex flex-col gap-6 relative ${plan.highlight ? "bg-paper/5" : "bg-ink"}`}>
            {plan.highlight && (
              <div className="absolute top-0 left-8 font-mono text-[10px] bg-accent text-ink px-3 py-1 tracking-widest">
                POPULAR
              </div>
            )}
            <div className="mt-4">
              <p className="font-mono text-xs text-paper/40 tracking-wider uppercase mb-2">{plan.name}</p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="font-serif text-4xl">{plan.price}</span>
                <span className="font-mono text-xs text-paper/40">{plan.period}</span>
              </div>
              <p className="font-mono text-xs text-paper/45 leading-relaxed">{plan.desc}</p>
            </div>
 
            <ul className="flex flex-col gap-2 flex-1">
              {plan.features.map(f => (
                <li key={f} className="flex items-start gap-2 font-mono text-xs text-paper/60">
                  <span className="text-paper/30 mt-0.5">—</span>
                  {f}
                </li>
              ))}
            </ul>
 
            <Button
              variant={plan.ctaVariant}
              onClick={() => navigate(isAuth ? "/dashboard" : "/register")}
              className="w-full"
            >
              {plan.cta}
            </Button>
          </div>
        ))}
      </div>
 
      {/* Credit packs */}
      <div className="mb-10">
        <div className="text-center mb-8">
          <h2 className="font-serif text-3xl mb-2">Or buy credits</h2>
          <p className="font-mono text-xs text-paper/40">Buy once. Use anytime. Never expire.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {CREDIT_PACKS.map(pack => (
            <div key={pack.id}
              className={`border rounded-sm p-6 relative ${pack.badge ? "border-paper/30" : "border-border"}`}>
              {pack.badge && (
                <span className="absolute -top-px left-4 font-mono text-[10px] bg-paper text-ink px-3 py-0.5 tracking-widest">
                  {pack.badge}
                </span>
              )}
              <p className="font-mono text-xs text-paper/40 mt-2 mb-1">{pack.credits} credits</p>
              <p className="font-serif text-3xl mb-1">{pack.price}</p>
              <p className="font-mono text-xs text-paper/30 mb-6">{pack.perCredit}</p>
              <Button
                variant={pack.badge ? "primary" : "secondary"}
                loading={buying === pack.id}
                onClick={() => handleCreditPack(pack.id)}
                className="w-full"
              >
                Buy {pack.credits} credits
              </Button>
            </div>
          ))}
        </div>
      </div>
 
      {/* FAQ */}
      <div className="border border-border rounded-sm divide-y divide-border">
        {[
          { q: "Do credits expire?",            a: "Never. Credits you purchase roll over indefinitely." },
          { q: "What's the difference between a license type?", a: "Personal covers non-commercial projects. Commercial covers YouTube, Etsy, client work. Extended covers print runs and resale." },
          { q: "How does the contributor split work?", a: "Contributors receive 60% of every sale. No tiers. No exclusivity requirements." },
          { q: "Can I upgrade or downgrade my plan?", a: "Yes, anytime. Changes take effect at the next billing cycle." },
        ].map(faq => (
          <div key={faq.q} className="px-6 py-5">
            <p className="font-serif text-lg mb-2">{faq.q}</p>
            <p className="font-mono text-xs text-paper/45 leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}