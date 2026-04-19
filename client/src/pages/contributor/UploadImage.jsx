import { imageAPI, briefAPI } from "../../api/services.js";

const NICHES = ["YouTube","Podcast","Notion","Game Dev","Newsletter","Blog","General"];
const LICENSE_TYPES = ["personal","commercial","extended"];

export default function UploadImage() {
  const { success, error: toastErr } = useToast();
  const navigate = useNavigate();
  const [file,     setFile]    = useState(null);
  const [preview,  setPreview] = useState(null);
  const [loading,  setLoading] = useState(false);
  const [briefs,   setBriefs]  = useState([]);
  const [form, setForm] = useState({
    title: "", description: "", niche: "General", category: "",
    tags: "", useCases: "", mood: "", briefId: "",
    licenses: LICENSE_TYPES.map(t => ({ type: t, price: 0, creditCost: 1, platforms: "" })),
  });

  useEffect(() => {
    briefAPI.getAll({ status: "open" }).then(({ data }) => setBriefs(data.briefs)).catch(() => {});
  }, []);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleLicenseChange = (idx, field, val) => {
    setForm(f => {
      const licenses = [...f.licenses];
      licenses[idx] = { ...licenses[idx], [field]: val };
      return { ...f, licenses };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { toastErr("Please select an image file."); return; }
    setLoading(true);

    const formData = new FormData();
    formData.append("image", file);
    Object.entries(form).forEach(([k, v]) => {
      if (k === "licenses") {
        const clean = v.map(l => ({
          ...l,
          price:      Math.round(parseFloat(l.price) * 100),
          creditCost: parseInt(l.creditCost),
          platforms:  l.platforms ? l.platforms.split(",").map(s => s.trim()) : [],
        }));
        formData.append(k, JSON.stringify(clean));
      } else if (["tags","useCases","mood"].includes(k)) {
        formData.append(k, JSON.stringify(v.split(",").map(s => s.trim()).filter(Boolean)));
      } else {
        formData.append(k, v);
      }
    });

    try {
      await imageAPI.upload(formData);
      success("Image uploaded! Pending admin review.");
      navigate("/contributor/images");
    } catch (err) { toastErr(err.response?.data?.message || "Upload failed."); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <PageHeader title="Upload image" subtitle="Images go live after admin approval." />

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* File drop */}
        <div>
          <label htmlFor="file-input"
            className="border border-dashed border-border rounded-sm p-10 flex flex-col items-center gap-3 cursor-pointer hover:border-paper/30 transition-colors">
            {preview
              ? <img src={preview} alt="Preview" className="max-h-48 rounded-sm object-contain" />
              : <>
                  <div className="text-3xl text-paper/20">↑</div>
                  <p className="font-mono text-xs text-paper/40">Click to select image (JPG, PNG, WebP · max 50MB)</p>
                </>
            }
          </label>
          <input id="file-input" type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>

        {/* Core fields */}
        <Input label="Title *" id="title" required value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />

        <div>
          <label className="font-mono text-xs text-paper/50 tracking-wider uppercase block mb-1.5">Description</label>
          <textarea value={form.description} rows={3}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full bg-paper/5 border border-border text-paper text-sm px-4 py-2.5 rounded-sm placeholder:text-paper/25 focus:outline-none focus:border-paper/40 transition-colors resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-mono text-xs text-paper/50 tracking-wider uppercase block mb-1.5">Niche *</label>
            <select value={form.niche} onChange={e => setForm(f => ({ ...f, niche: e.target.value }))}
              className="w-full bg-paper/5 border border-border text-paper text-sm px-4 py-2.5 rounded-sm focus:outline-none focus:border-paper/40">
              {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <Input label="Category" id="category" value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
        </div>

        <Input label="Tags (comma-separated)" id="tags" placeholder="coffee, dark, minimal, overhead"
          value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
        <Input label="Use cases (comma-separated)" id="useCases" placeholder="thumbnail, newsletter header"
          value={form.useCases} onChange={e => setForm(f => ({ ...f, useCases: e.target.value }))} />
        <Input label="Mood (comma-separated)" id="mood" placeholder="dark, moody, warm"
          value={form.mood} onChange={e => setForm(f => ({ ...f, mood: e.target.value }))} />

        {/* Brief */}
        {briefs.length > 0 && (
          <div>
            <label className="font-mono text-xs text-paper/50 tracking-wider uppercase block mb-1.5">Submitted for brief (optional)</label>
            <select value={form.briefId} onChange={e => setForm(f => ({ ...f, briefId: e.target.value }))}
              className="w-full bg-paper/5 border border-border text-paper text-sm px-4 py-2.5 rounded-sm focus:outline-none focus:border-paper/40">
              <option value="">— None —</option>
              {briefs.map(b => <option key={b._id} value={b._id}>{b.title}</option>)}
            </select>
          </div>
        )}

        {/* Licenses */}
        <div>
          <p className="font-mono text-xs text-paper/40 tracking-widest uppercase mb-3">License pricing</p>
          <div className="flex flex-col gap-3">
            {form.licenses.map((l, i) => (
              <div key={l.type} className="border border-border rounded-sm p-4">
                <p className="font-mono text-xs text-paper/60 capitalize mb-3">{l.type} license</p>
                <div className="grid grid-cols-3 gap-3">
                  <Input label="Price (₹)" id={`price-${i}`} type="number" min="0" step="1"
                    value={l.price} onChange={e => handleLicenseChange(i, "price", e.target.value)} />
                  <Input label="Credit cost" id={`credit-${i}`} type="number" min="1"
                    value={l.creditCost} onChange={e => handleLicenseChange(i, "creditCost", e.target.value)} />
                  <Input label="Platforms" id={`plat-${i}`} placeholder="YouTube, Etsy"
                    value={l.platforms} onChange={e => handleLicenseChange(i, "platforms", e.target.value)} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button type="submit" loading={loading} className="w-full">Upload for review</Button>
      </form>
    </div>
  );
}