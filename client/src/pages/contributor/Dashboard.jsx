import { useEffect, useState } from "react";
import { contributorAPI } from "../../api/services.js";
import { Spinner, PageHeader, EmptyState } from "../../components/common";
import { Link } from "react-router-dom";

export default function ContributorDashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contributorAPI.myStats()
      .then(({ data }) => setStats(data.stats))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const profile = stats?.profile;
  const earned  = (profile?.totalEarnings || 0) / 100;
  const pending = (profile?.pendingPayout  || 0) / 100;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <PageHeader
        title="Studio"
        subtitle={profile?.isApproved ? "Your contributor dashboard" : "Pending admin approval"}
        action={
          profile?.isApproved && (
            <Link to="/contributor/upload"
              className="font-mono text-xs bg-paper text-ink px-5 py-2.5 rounded-sm hover:bg-paper/90 transition-colors">
              Upload image
            </Link>
          )
        }
      />

      {!profile?.isApproved && (
        <div className="border border-amber-900/50 bg-amber-900/10 rounded-sm px-5 py-4 mb-8">
          <p className="font-mono text-xs text-amber-400/80">
            Your contributor application is under review. You'll be able to upload images once approved.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {[
          { n: `₹${earned.toFixed(0)}`,          l: "Total earned"   },
          { n: `₹${pending.toFixed(0)}`,           l: "Pending payout" },
          { n: profile?.totalDownloads || 0,       l: "Total downloads"},
          { n: stats?.topImages?.length || 0,      l: "Published images"},
        ].map(s => (
          <div key={s.l} className="border border-border rounded-sm p-5">
            <p className="font-serif text-3xl mb-1">{s.n}</p>
            <p className="font-mono text-xs text-paper/40">{s.l}</p>
          </div>
        ))}
      </div>

      {/* Monthly earnings chart (simple text-based) */}
      {stats?.monthlyEarnings?.length > 0 && (
        <div className="border border-border rounded-sm p-6 mb-8">
          <p className="font-mono text-xs text-paper/40 tracking-widest uppercase mb-5">Monthly earnings</p>
          <div className="flex items-end gap-2 h-28">
            {stats.monthlyEarnings.map((m, i) => {
              const maxEarning = Math.max(...stats.monthlyEarnings.map(x => x.earnings));
              const pct = maxEarning ? (m.earnings / maxEarning) * 100 : 0;
              const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
              return (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-full bg-paper/20 rounded-sm" style={{ height: `${Math.max(pct, 4)}%` }} />
                  <p className="font-mono text-[9px] text-paper/30">{months[m._id.month - 1]}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top images */}
      {stats?.topImages?.length > 0 && (
        <div>
          <p className="font-mono text-xs text-paper/40 tracking-widest uppercase mb-4">Top images</p>
          <div className="flex flex-col gap-3">
            {stats.topImages.map((img, i) => (
              <div key={img._id} className="flex items-center gap-4 border border-border rounded-sm p-4">
                <span className="font-mono text-xs text-paper/25 w-5">{i + 1}</span>
                <img src={img.thumbnailUrl} alt={img.title} className="w-12 h-12 object-cover rounded-sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{img.title}</p>
                  <p className="font-mono text-xs text-paper/40">{img.totalDownloads} downloads</p>
                </div>
                <p className="font-serif text-lg">₹{((img.totalRevenue || 0) / 100).toFixed(0)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}