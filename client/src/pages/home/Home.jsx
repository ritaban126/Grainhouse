import { useState, useEffect, useRef } from "react";

const NAV_LINKS = ["Explore", "Channels", "Pricing", "Contributors"];
const NICHES = ["All", "YouTube", "Podcast", "Notion", "Game Dev", "Newsletter", "Blog"];
const IMAGES = [
  { id:1, title:"Moody Cafe Corner", author:"Arjun Mehra", price:"$4", niche:"Newsletter", w:2, h:3, color:"#1a1208" },
  { id:2, title:"Dark UI Texture Vol.3", author:"Priya Sen", price:"$6", niche:"Game Dev", w:3, h:2, color:"#0d1520" },
  { id:3, title:"Headphone Flat Lay", author:"Rahul Das", price:"$5", niche:"Podcast", w:2, h:2, color:"#0f0f0f" },
  { id:4, title:"Minimal Desk Setup", author:"Sneha Roy", price:"$4", niche:"YouTube", w:3, h:3, color:"#12100e" },
  { id:5, title:"Forest Fog Dawn", author:"Vikram Nair", price:"$7", niche:"Blog", w:2, h:3, color:"#080e0a" },
  { id:6, title:"Notion Cover — Stone", author:"Aisha Khan", price:"$3", niche:"Notion", w:3, h:2, color:"#181510" },
  { id:7, title:"Isometric Grid Art", author:"Dev Sharma", price:"$8", niche:"Game Dev", w:2, h:2, color:"#100818" },
  { id:8, title:"Coffee Overhead", author:"Meera Iyer", price:"$4", niche:"Newsletter", w:3, h:3, color:"#120a06" },
];
const STATS = [{ n:"48,200+", l:"Images" },{ n:"3,900+", l:"Contributors" },{ n:"12", l:"Niche channels" },{ n:"60%", l:"Creator cut" }];
const CHANNELS = [
  { name:"YouTube", desc:"Thumbnails, end-screens, channel art", count:"8,400 images", color:"#c0392b" },
  { name:"Podcast", desc:"Cover art, episode visuals, show branding", count:"5,100 images", color:"#8e44ad" },
  { name:"Notion", desc:"Page covers, icon sets, templates", count:"4,200 images", color:"#2c3e50" },
  { name:"Game Dev", desc:"Textures, sprites, UI backgrounds", count:"6,700 images", color:"#16a085" },
  { name:"Newsletter", desc:"Headers, inline visuals, footer art", count:"3,800 images", color:"#d35400" },
  { name:"Blog", desc:"Hero images, inline photography", count:"7,200 images", color:"#1a6e3d" },
];
const TESTIMONIALS = [
  { name:"Riya Kapoor", role:"YouTube Creator — 280K subs", text:"Finally a stock site that gets what thumbnail designers actually need. The use-case filter alone saves me 30 minutes per video." },
  { name:"Abhishek Joshi", role:"Podcast Producer", text:"I followed three photographers here and now every Monday I get exactly the kind of moody dark cover art I need. Nothing else comes close." },
  { name:"Fatima Al-Hassan", role:"Indie Game Developer", text:"The texture pack briefs are genius. I requested specific tileable stone textures and had 40 options within a week." },
];

const TRENDING = ["dark moody cafe", "isometric 3d shapes", "minimal desk setup", "podcast mic flat lay", "forest fog", "abstract grain texture"];

export default function Home() {
  const [activeNiche, setActiveNiche] = useState("All");
  const [activePage, setActivePage] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filtered = activeNiche === "All" ? IMAGES : IMAGES.filter(i => i.niche === activeNiche);

  const s = {
    page: { fontFamily:"'DM Serif Display', 'Georgia', serif", background:"#0c0b09", color:"#e8e4dc", minHeight:"100vh", overflowX:"hidden" },
    nav: {
      position:"sticky", top:0, zIndex:100,
      background: scrolled ? "rgba(12,11,9,0.95)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? "0.5px solid rgba(232,228,220,0.1)" : "none",
      transition:"all 0.3s ease",
      padding:"0 2rem",
      display:"flex", alignItems:"center", justifyContent:"space-between", height:"64px",
    },
    logo: { fontFamily:"'DM Serif Display', serif", fontSize:"22px", letterSpacing:"-0.5px", color:"#e8e4dc", cursor:"pointer", background:"none", border:"none" },
    navLinks: { display:"flex", gap:"2rem", listStyle:"none", margin:0, padding:0 },
    navLink: { fontSize:"13px", letterSpacing:"0.08em", color:"rgba(232,228,220,0.6)", cursor:"pointer", transition:"color 0.2s", background:"none", border:"none", fontFamily:"'DM Mono', monospace" },
    navCta: { background:"#e8e4dc", color:"#0c0b09", border:"none", padding:"8px 20px", borderRadius:"2px", fontSize:"12px", fontFamily:"'DM Mono', monospace", letterSpacing:"0.08em", cursor:"pointer", fontWeight:"500" },

    hero: { minHeight:"92vh", display:"flex", flexDirection:"column", justifyContent:"center", padding:"0 2rem", position:"relative", overflow:"hidden" },
    heroEyebrow: { fontFamily:"'DM Mono', monospace", fontSize:"11px", letterSpacing:"0.2em", color:"rgba(232,228,220,0.4)", marginBottom:"1.5rem", textTransform:"uppercase" },
    heroH1: { fontSize:"clamp(48px, 8vw, 96px)", lineHeight:"0.95", letterSpacing:"-2px", margin:"0 0 2rem", fontWeight:"400", maxWidth:"800px" },
    heroAccent: { color:"transparent", WebkitTextStroke:"1px rgba(232,228,220,0.4)", fontStyle:"italic" },
    heroSub: { fontFamily:"'DM Mono', monospace", fontSize:"14px", color:"rgba(232,228,220,0.5)", maxWidth:"420px", lineHeight:"1.7", marginBottom:"3rem" },
    searchWrap: { display:"flex", gap:"0", maxWidth:"560px" },
    searchInput: { flex:1, background:"rgba(232,228,220,0.06)", border:"0.5px solid rgba(232,228,220,0.2)", borderRight:"none", padding:"14px 20px", fontSize:"14px", color:"#e8e4dc", outline:"none", fontFamily:"'DM Mono', monospace", borderRadius:"2px 0 0 2px" },
    searchBtn: { background:"#e8e4dc", color:"#0c0b09", border:"none", padding:"14px 28px", fontSize:"12px", fontFamily:"'DM Mono', monospace", letterSpacing:"0.08em", cursor:"pointer", borderRadius:"0 2px 2px 0", fontWeight:"500" },
    trending: { display:"flex", gap:"8px", flexWrap:"wrap", marginTop:"1.5rem", alignItems:"center" },
    trendingLabel: { fontFamily:"'DM Mono', monospace", fontSize:"11px", color:"rgba(232,228,220,0.3)", letterSpacing:"0.1em" },
    trendPill: { fontFamily:"'DM Mono', monospace", fontSize:"11px", color:"rgba(232,228,220,0.5)", background:"rgba(232,228,220,0.05)", border:"0.5px solid rgba(232,228,220,0.1)", padding:"4px 12px", borderRadius:"2px", cursor:"pointer" },

    bgGrid: { position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(232,228,220,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(232,228,220,0.03) 1px, transparent 1px)", backgroundSize:"60px 60px", pointerEvents:"none" },
    bgBlob: { position:"absolute", right:"-10%", top:"10%", width:"600px", height:"600px", background:"radial-gradient(ellipse at center, rgba(139,90,43,0.08) 0%, transparent 70%)", pointerEvents:"none" },

    statsBar: { borderTop:"0.5px solid rgba(232,228,220,0.08)", borderBottom:"0.5px solid rgba(232,228,220,0.08)", padding:"2rem", display:"flex", justifyContent:"space-around", gap:"2rem", flexWrap:"wrap" },
    statItem: { textAlign:"center" },
    statNum: { fontSize:"36px", fontWeight:"400", letterSpacing:"-1px", display:"block" },
    statLabel: { fontFamily:"'DM Mono', monospace", fontSize:"11px", color:"rgba(232,228,220,0.4)", letterSpacing:"0.12em", textTransform:"uppercase" },

    section: { padding:"5rem 2rem" },
    sectionLabel: { fontFamily:"'DM Mono', monospace", fontSize:"11px", letterSpacing:"0.2em", color:"rgba(232,228,220,0.35)", textTransform:"uppercase", marginBottom:"1rem" },
    sectionH2: { fontSize:"clamp(32px, 5vw, 52px)", lineHeight:"1.05", letterSpacing:"-1px", fontWeight:"400", margin:"0 0 3rem" },

    niches: { display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"2.5rem" },
    nicheBtn: (active) => ({
      fontFamily:"'DM Mono', monospace", fontSize:"12px", letterSpacing:"0.06em",
      padding:"8px 18px", borderRadius:"2px", cursor:"pointer", transition:"all 0.2s",
      background: active ? "#e8e4dc" : "transparent",
      color: active ? "#0c0b09" : "rgba(232,228,220,0.5)",
      border: active ? "none" : "0.5px solid rgba(232,228,220,0.15)",
    }),

    grid: { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:"3px" },
    imgCard: { position:"relative", cursor:"pointer", overflow:"hidden", borderRadius:"1px" },
    imgPlaceholder: (color, h) => ({ background:color, height: h === 3 ? "320px" : h === 2 ? "220px" : "260px", position:"relative", display:"flex", alignItems:"flex-end", padding:"16px" }),
    imgOverlay: { position:"absolute", inset:0, background:"linear-gradient(transparent 40%, rgba(0,0,0,0.7))", opacity:0, transition:"opacity 0.3s" },
    imgMeta: { position:"relative", zIndex:1 },
    imgTitle: { fontSize:"13px", fontWeight:"400", color:"#e8e4dc", display:"block" },
    imgAuthor: { fontFamily:"'DM Mono', monospace", fontSize:"11px", color:"rgba(232,228,220,0.5)" },
    imgPrice: { position:"absolute", top:"12px", right:"12px", fontFamily:"'DM Mono', monospace", fontSize:"11px", background:"rgba(232,228,220,0.1)", color:"#e8e4dc", padding:"4px 10px", borderRadius:"2px", backdropFilter:"blur(4px)" },
    imgNicheTag: { position:"absolute", top:"12px", left:"12px", fontFamily:"'DM Mono', monospace", fontSize:"10px", background:"rgba(12,11,9,0.7)", color:"rgba(232,228,220,0.6)", padding:"3px 8px", borderRadius:"2px", backdropFilter:"blur(4px)" },

    channelsGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:"1px", border:"0.5px solid rgba(232,228,220,0.08)" },
    channelCard: (color) => ({ padding:"2rem", borderRight:"0.5px solid rgba(232,228,220,0.08)", borderBottom:"0.5px solid rgba(232,228,220,0.08)", cursor:"pointer", transition:"background 0.2s", position:"relative", overflow:"hidden" }),
    channelDot: (color) => ({ width:"8px", height:"8px", borderRadius:"50%", background:color, marginBottom:"1.5rem" }),
    channelName: { fontSize:"22px", fontWeight:"400", marginBottom:"8px" },
    channelDesc: { fontFamily:"'DM Mono', monospace", fontSize:"12px", color:"rgba(232,228,220,0.45)", lineHeight:"1.6", marginBottom:"1rem" },
    channelCount: { fontFamily:"'DM Mono', monospace", fontSize:"11px", color:"rgba(232,228,220,0.25)" },

    testimonialGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:"1px" },
    tCard: { padding:"2.5rem", border:"0.5px solid rgba(232,228,220,0.08)" },
    tText: { fontSize:"16px", lineHeight:"1.7", fontStyle:"italic", color:"rgba(232,228,220,0.75)", marginBottom:"1.5rem", fontWeight:"400" },
    tName: { fontFamily:"'DM Mono', monospace", fontSize:"12px", color:"#e8e4dc", letterSpacing:"0.05em" },
    tRole: { fontFamily:"'DM Mono', monospace", fontSize:"11px", color:"rgba(232,228,220,0.35)" },

    ctaBanner: { margin:"0 2rem 5rem", border:"0.5px solid rgba(232,228,220,0.12)", padding:"5rem 3rem", textAlign:"center", position:"relative", overflow:"hidden" },
    ctaH2: { fontSize:"clamp(36px, 6vw, 72px)", fontWeight:"400", letterSpacing:"-1.5px", lineHeight:"1", marginBottom:"1.5rem" },
    ctaBtns: { display:"flex", gap:"12px", justifyContent:"center", flexWrap:"wrap" },
    ctaPrimary: { background:"#e8e4dc", color:"#0c0b09", border:"none", padding:"14px 36px", fontSize:"13px", fontFamily:"'DM Mono', monospace", letterSpacing:"0.08em", cursor:"pointer", borderRadius:"2px" },
    ctaSecondary: { background:"transparent", color:"rgba(232,228,220,0.6)", border:"0.5px solid rgba(232,228,220,0.2)", padding:"14px 36px", fontSize:"13px", fontFamily:"'DM Mono', monospace", letterSpacing:"0.08em", cursor:"pointer", borderRadius:"2px" },

    footer: { borderTop:"0.5px solid rgba(232,228,220,0.08)", padding:"3rem 2rem", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"1rem" },
    footerLogo: { fontFamily:"'DM Serif Display', serif", fontSize:"20px", color:"rgba(232,228,220,0.5)" },
    footerLinks: { display:"flex", gap:"2rem", listStyle:"none", margin:0, padding:0 },
    footerLink: { fontFamily:"'DM Mono', monospace", fontSize:"11px", color:"rgba(232,228,220,0.3)", letterSpacing:"0.08em", cursor:"pointer" },
    footerCopy: { fontFamily:"'DM Mono', monospace", fontSize:"11px", color:"rgba(232,228,220,0.2)" },
  };

  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::placeholder { color: rgba(232,228,220,0.25); }
        input:focus { box-shadow: 0 0 0 1px rgba(232,228,220,0.3); }
        .img-card:hover .img-overlay { opacity: 1 !important; }
        .niche-btn:hover { border-color: rgba(232,228,220,0.35) !important; color: rgba(232,228,220,0.9) !important; }
        .channel-card:hover { background: rgba(232,228,220,0.03) !important; }
        .trend-pill:hover { background: rgba(232,228,220,0.1) !important; color: rgba(232,228,220,0.8) !important; }
        .nav-link:hover { color: rgba(232,228,220,0.95) !important; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .hero-content > * { animation: fadeUp 0.7s ease both; }
        .hero-content > *:nth-child(1) { animation-delay: 0.1s; }
        .hero-content > *:nth-child(2) { animation-delay: 0.2s; }
        .hero-content > *:nth-child(3) { animation-delay: 0.35s; }
        .hero-content > *:nth-child(4) { animation-delay: 0.45s; }
        .hero-content > *:nth-child(5) { animation-delay: 0.55s; }
        .img-card { transition: transform 0.3s ease; }
        .img-card:hover { transform: scale(1.01); z-index: 2; }
        .cta-banner-bg { position:absolute; inset:0; background: radial-gradient(ellipse at 50% 100%, rgba(139,90,43,0.12) 0%, transparent 70%); pointer-events:none; }
      `}</style>

      <div style={s.page}>
        {/* NAV */}
        {/* <nav style={s.nav}>
          <button style={s.logo} onClick={() => setActivePage("home")}>NichePix</button>
          <ul style={s.navLinks}>
            {NAV_LINKS.map(l => (
              <li key={l}>
                <button className="nav-link" style={s.navLink} onClick={() => setActivePage(l.toLowerCase())}>{l}</button>
              </li>
            ))}
          </ul>
          <div style={{ display:"flex", gap:"12px", alignItems:"center" }}>
            <button className="nav-link" style={s.navLink}>Sign in</button>
            <button style={s.navCta}>Get started</button>
          </div>
        </nav> */}

        {/* HERO */}
        <section style={s.hero} ref={heroRef}>
          <div style={s.bgGrid} />
          <div style={s.bgBlob} />
          <div className="hero-content" style={{ position:"relative", zIndex:1 }}>
            <p style={s.heroEyebrow}>Stock photography — reimagined for creators</p>
            <h1 style={s.heroH1}>
              Images built<br />
              for your <span style={s.heroAccent}>niche.</span>
            </h1>
            <p style={s.heroSub}>
              Not millions of generic photos. Curated libraries for YouTube creators, podcast designers, game devs, and more — each shot with intent.
            </p>
            <div style={s.searchWrap}>
              <input
                style={s.searchInput}
                placeholder="dark moody cafe, no people..."
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
              />
              <button style={s.searchBtn}>SEARCH</button>
            </div>
            <div style={s.trending}>
              <span style={s.trendingLabel}>Trending</span>
              {TRENDING.map(t => (
                <span key={t} className="trend-pill" style={s.trendPill} onClick={() => setSearchVal(t)}>{t}</span>
              ))}
            </div>
          </div>
        </section>

        {/* STATS */}
        <div style={s.statsBar}>
          {STATS.map(st => (
            <div key={st.l} style={s.statItem}>
              <span style={s.statNum}>{st.n}</span>
              <span style={s.statLabel}>{st.l}</span>
            </div>
          ))}
        </div>

        {/* GALLERY */}
        <section style={s.section}>
          <p style={s.sectionLabel}>Explore</p>
          <h2 style={s.sectionH2}>Images shot for<br /><em>specific</em> use cases</h2>
          <div style={s.niches}>
            {NICHES.map(n => (
              <button key={n} className="niche-btn" style={s.nicheBtn(activeNiche === n)} onClick={() => setActiveNiche(n)}>{n}</button>
            ))}
          </div>
          <div style={s.grid}>
            {filtered.map(img => (
              <div key={img.id} className="img-card" style={s.imgCard}
                onMouseEnter={() => setHoveredCard(img.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div style={s.imgPlaceholder(img.color, img.h)}>
                  <div className="img-overlay" style={{...s.imgOverlay, opacity: hoveredCard === img.id ? 1 : 0}} />
                  <span style={s.imgNicheTag}>{img.niche}</span>
                  <span style={s.imgPrice}>{img.price}</span>
                  <div style={{...s.imgMeta, opacity: hoveredCard === img.id ? 1 : 0, transition:"opacity 0.3s"}}>
                    <span style={s.imgTitle}>{img.title}</span>
                    <span style={s.imgAuthor}>by {img.author}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign:"center", marginTop:"3rem" }}>
            <button style={s.ctaSecondary}>Browse all images</button>
          </div>
        </section>

        {/* CHANNELS */}
        <section style={{ ...s.section, borderTop:"0.5px solid rgba(232,228,220,0.08)" }}>
          <p style={s.sectionLabel}>Channels</p>
          <h2 style={s.sectionH2}>Your niche has its<br />own library</h2>
          <div style={s.channelsGrid}>
            {CHANNELS.map(ch => (
              <div key={ch.name} className="channel-card" style={s.channelCard(ch.color)}>
                <div style={s.channelDot(ch.color)} />
                <h3 style={s.channelName}>{ch.name}</h3>
                <p style={s.channelDesc}>{ch.desc}</p>
                <span style={s.channelCount}>{ch.count}</span>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section style={{ ...s.section, borderTop:"0.5px solid rgba(232,228,220,0.08)" }}>
          <p style={s.sectionLabel}>How it works</p>
          <h2 style={s.sectionH2}>Different from<br /><em>every</em> stock site</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:"1px" }}>
            {[
              { num:"01", title:"Pick your niche", desc:"Choose from 12 curated channels — each one a focused library built for that specific creator type." },
              { num:"02", title:"Search with intent", desc:"Filter by use case, mood, color palette, or describe in plain English what you need." },
              { num:"03", title:"License clearly", desc:"Platform-specific licenses. No vague 'Standard vs Enhanced' — just 'YouTube, Etsy, Print.'" },
              { num:"04", title:"Download instantly", desc:"Full-res, no watermark, background removal included. Ready for your project in seconds." },
            ].map(step => (
              <div key={step.num} style={{ padding:"2.5rem 2rem", border:"0.5px solid rgba(232,228,220,0.08)" }}>
                <span style={{ fontFamily:"'DM Mono', monospace", fontSize:"11px", color:"rgba(232,228,220,0.2)", letterSpacing:"0.15em", display:"block", marginBottom:"2rem" }}>{step.num}</span>
                <h3 style={{ fontSize:"20px", fontWeight:"400", marginBottom:"12px" }}>{step.title}</h3>
                <p style={{ fontFamily:"'DM Mono', monospace", fontSize:"12px", color:"rgba(232,228,220,0.45)", lineHeight:"1.7" }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CREATOR SECTION */}
        <section style={{ ...s.section, borderTop:"0.5px solid rgba(232,228,220,0.08)", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4rem", alignItems:"center" }}>
          <div>
            <p style={s.sectionLabel}>For photographers</p>
            <h2 style={{ ...s.sectionH2, margin:"0 0 1.5rem" }}>Shoot what<br /><em>buyers</em> actually need</h2>
            <p style={{ fontFamily:"'DM Mono', monospace", fontSize:"13px", color:"rgba(232,228,220,0.5)", lineHeight:"1.8", marginBottom:"2rem" }}>
              We post weekly briefs from buyers. You shoot to spec, upload in bulk, and earn 60% on every sale — from day one, no tiers, no exclusivity.
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
              {["60% revenue split — highest in the industry","Weekly briefs so you know what to shoot","Bulk CSV upload for metadata","AI-assisted keyword tagging","Public profile with follower notifications"].map(f => (
                <div key={f} style={{ display:"flex", gap:"12px", alignItems:"flex-start" }}>
                  <span style={{ fontFamily:"'DM Mono', monospace", fontSize:"11px", color:"rgba(232,228,220,0.3)", marginTop:"2px" }}>—</span>
                  <span style={{ fontFamily:"'DM Mono', monospace", fontSize:"12px", color:"rgba(232,228,220,0.6)" }}>{f}</span>
                </div>
              ))}
            </div>
            <button style={{ ...s.ctaPrimary, marginTop:"2rem" }}>Apply as contributor</button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"3px" }}>
            {["#1a0e08","#0c1218","#100818","#081010"].map((c, i) => (
              <div key={i} style={{ background:c, height: i % 2 === 0 ? "180px" : "140px", borderRadius:"1px" }} />
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section style={{ ...s.section, borderTop:"0.5px solid rgba(232,228,220,0.08)" }}>
          <p style={s.sectionLabel}>Community</p>
          <h2 style={s.sectionH2}>Creators who<br />switched</h2>
          <div style={s.testimonialGrid}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={s.tCard}>
                <p style={s.tText}>"{t.text}"</p>
                <p style={s.tName}>{t.name}</p>
                <p style={s.tRole}>{t.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PRICING TEASER */}
        <section style={{ ...s.section, borderTop:"0.5px solid rgba(232,228,220,0.08)" }}>
          <p style={s.sectionLabel}>Pricing</p>
          <h2 style={s.sectionH2}>Credits that<br /><em>never</em> expire</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:"1px" }}>
            {[
              { name:"Starter", price:"₹0", desc:"10 free images/mo with attribution. No card required.", cta:"Start free" },
              { name:"Creator", price:"₹799/mo", desc:"50 downloads. All niches. Background removal included.", cta:"Get Creator", highlight:true },
              { name:"Studio", price:"₹2,499/mo", desc:"200 downloads. Team seats. CSV bulk licensing.", cta:"Get Studio" },
              { name:"Credits", price:"₹99/credit", desc:"Buy once, use anytime. No expiry. Min 5 credits.", cta:"Buy credits" },
            ].map(plan => (
              <div key={plan.name} style={{ padding:"2.5rem 2rem", border: plan.highlight ? "0.5px solid rgba(232,228,220,0.4)" : "0.5px solid rgba(232,228,220,0.08)", position:"relative" }}>
                {plan.highlight && <span style={{ position:"absolute", top:"-1px", left:"2rem", fontFamily:"'DM Mono', monospace", fontSize:"10px", background:"#e8e4dc", color:"#0c0b09", padding:"3px 10px", letterSpacing:"0.1em" }}>POPULAR</span>}
                <h3 style={{ fontSize:"14px", fontWeight:"400", fontFamily:"'DM Mono', monospace", color:"rgba(232,228,220,0.5)", marginBottom:"8px", letterSpacing:"0.08em" }}>{plan.name}</h3>
                <p style={{ fontSize:"28px", letterSpacing:"-0.5px", marginBottom:"1rem" }}>{plan.price}</p>
                <p style={{ fontFamily:"'DM Mono', monospace", fontSize:"12px", color:"rgba(232,228,220,0.4)", lineHeight:"1.7", marginBottom:"1.5rem" }}>{plan.desc}</p>
                <button style={ plan.highlight ? {...s.ctaPrimary, width:"100%"} : {...s.ctaSecondary, width:"100%"} }>{plan.cta}</button>
              </div>
            ))}
          </div>
        </section>

        {/* CTA BANNER */}
        <div style={s.ctaBanner}>
          <div className="cta-banner-bg" />
          <p style={s.sectionLabel}>Get started</p>
          <h2 style={s.ctaH2}>Your niche<br />deserves better.</h2>
          <p style={{ fontFamily:"'DM Mono', monospace", fontSize:"13px", color:"rgba(232,228,220,0.4)", marginBottom:"2.5rem", marginTop:"1rem" }}>
            10 free images. No credit card. Cancel anytime.
          </p>
          <div style={s.ctaBtns}>
            <button style={s.ctaPrimary}>Start for free</button>
            <button style={s.ctaSecondary}>Browse gallery</button>
          </div>
        </div>

        {/* FOOTER */}
        {/* <footer style={s.footer}>
          <span style={s.footerLogo}>NichePix</span>
          <ul style={s.footerLinks}>
            {["About","Channels","Pricing","Contributors","Blog","Terms","Privacy"].map(l => (
              <li key={l}><span style={s.footerLink}>{l}</span></li>
            ))}
          </ul>
          <span style={s.footerCopy}>© 2025 NichePix. All rights reserved.</span>
        </footer> */}
      </div>
    </>
  );
}