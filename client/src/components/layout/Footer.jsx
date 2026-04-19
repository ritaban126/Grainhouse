import { Link } from "react-router-dom";

const LINKS = [
  { group: "Product",  items: [{ l:"Gallery", h:"/gallery" },{ l:"Channels", h:"/gallery" },{ l:"Pricing", h:"/pricing" },{ l:"Briefs", h:"/gallery" }] },
  { group: "Creators", items: [{ l:"Become a contributor", h:"/contributor/apply" },{ l:"Contributor dashboard", h:"/contributor/dashboard" },{ l:"Upload images", h:"/contributor/upload" },{ l:"Earnings", h:"/contributor/dashboard" }] },
  { group: "Company",  items: [{ l:"About", h:"/" },{ l:"Blog", h:"/" },{ l:"Terms", h:"/" },{ l:"Privacy", h:"/" }] },
];

export default function Footer() {
  return (
    <footer className="border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <Link to="/" className="font-serif text-xl text-paper block mb-3">Grainhouse</Link>
          <p className="font-mono text-xs text-paper/35 leading-relaxed">
            Stock photography built for specific creative niches. Not millions of generic images.
          </p>
        </div>

        {LINKS.map(group => (
          <div key={group.group}>
            <p className="font-mono text-xs tracking-widest uppercase text-paper/30 mb-4">{group.group}</p>
            <ul className="flex flex-col gap-2">
              {group.items.map(item => (
                <li key={item.l}>
                  <Link to={item.h} className="font-mono text-xs text-paper/45 hover:text-paper transition-colors">
                    {item.l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border px-6 py-5 max-w-7xl mx-auto flex justify-between items-center flex-wrap gap-3">
        <p className="font-mono text-xs text-paper/25">© {new Date().getFullYear()} NichePix. All rights reserved.</p>
        <p className="font-mono text-xs text-paper/25">60% creator revenue share · Credits never expire</p>
      </div>
    </footer>
  );
}