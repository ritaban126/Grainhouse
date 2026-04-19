import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { contributorAPI } from "../../api/services.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { Button, Input, PageHeader } from "../../components/common";

export default function ContributorApply() {
  const { user, updateUser } = useAuth();
  const { success, error: toastErr } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ bio: "", website: "", instagram: "", paypalEmail: "" });
  const [loading, setLoading] = useState(false);

  if (user?.role === "contributor" || user?.role === "admin") {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <h1 className="font-serif text-3xl mb-4">You're already a contributor.</h1>
        <Button onClick={() => navigate("/contributor/dashboard")}>Go to studio</Button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contributorAPI.apply(form);
      updateUser({ role: "contributor" });
      success("Application submitted! Redirecting to your studio.");
      navigate("/contributor/dashboard");
    } catch (err) { toastErr(err.response?.data?.message || "Application failed."); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      <PageHeader title="Become a contributor" subtitle="60% revenue share. No exclusivity required." />

      <div className="grid grid-cols-3 gap-3 mb-10">
        {[["60%","Revenue split"],["∞","No upload limit"],["Weekly","Shoot briefs"]].map(([n,l]) => (
          <div key={l} className="border border-border rounded-sm p-4 text-center">
            <p className="font-serif text-2xl mb-1">{n}</p>
            <p className="font-mono text-xs text-paper/40">{l}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="font-mono text-xs text-paper/50 tracking-wider uppercase block mb-1.5">Bio</label>
          <textarea
            value={form.bio} required maxLength={500}
            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            placeholder="Tell buyers about your photography style and experience..."
            rows={4}
            className="w-full bg-paper/5 border border-border text-paper text-sm px-4 py-2.5 rounded-sm placeholder:text-paper/25 focus:outline-none focus:border-paper/40 transition-colors resize-none"
          />
        </div>
        <Input label="Website (optional)" id="website" type="url"
          value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} />
        <Input label="Instagram handle (optional)" id="instagram"
          placeholder="@yourusername"
          value={form.instagram} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))} />
        <Input label="PayPal email (for payouts)" id="paypalEmail" type="email" required
          value={form.paypalEmail} onChange={e => setForm(f => ({ ...f, paypalEmail: e.target.value }))} />

        <Button type="submit" loading={loading} className="w-full mt-2">Submit application</Button>
      </form>
    </div>
  );
}