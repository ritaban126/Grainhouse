import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
// import { imageAPI, paymentAPI } from "../../api/services.js";
// import { useAuth } from "../../context/AuthContext.jsx";
// import { useCart } from "../../context/CartContext.jsx";
// import { useToast } from "../../context/ToastContext.jsx";
import { Button, Spinner, Badge } from "../../components/common/index.jsx";

export default function ImageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuth } = useAuth();
  const { addToCart } = useCart();
  const { success, error: toastErr, info } = useToast();

  const [image,     setImage]     = useState(null);
  const [purchased, setPurchased] = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState(null);   // selected license type
  const [downloading, setDownloading] = useState(false);
  const [paying,    setPaying]    = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await imageAPI.getById(id);
        setImage(data.image);
        setPurchased(data.purchased);
        if (data.image.licenses?.length) setSelected(data.image.licenses[0].type);
      } catch { navigate("/gallery"); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const selectedLicense = image?.licenses?.find(l => l.type === selected);

  const handleAddToCart = () => {
    if (!isAuth) { info("Sign in to purchase images."); return; }
    if (!selectedLicense) return;
    addToCart({
      imageId:     image._id,
      title:       image.title,
      licenseType: selected,
      price:       selectedLicense.price,
      thumbnailUrl: image.cloudinary?.thumbnailUrl,
    });
    success("Added to cart.");
  };

  const handleBuyNow = async () => {
    if (!isAuth) { navigate("/login"); return; }
    if (!selectedLicense) return;
    setPaying(true);
    try {
      const { data } = await paymentAPI.createCheckout([
        { imageId: image._id, licenseType: selected }
      ]);
      window.location.href = data.url;
    } catch (err) { toastErr(err.response?.data?.message || "Could not start checkout."); }
    finally { setPaying(false); }
  };

  const handleDownload = async () => {
    if (!selectedLicense) return;
    setDownloading(true);
    try {
      const { data } = await imageAPI.download(image._id, selected);
      // Trigger browser download
      const a = document.createElement("a");
      a.href = data.downloadUrl;
      a.download = `${image.title}.jpg`;
      a.click();
      success("Download started.");
    } catch (err) { toastErr(err.response?.data?.message || "Download failed."); }
    finally { setDownloading(false); }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center"><Spinner size="lg" /></div>
  );
  if (!image) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="grid lg:grid-cols-[1fr_360px] gap-10">

        {/* Image preview */}
        <div>
          <div className="relative rounded-sm overflow-hidden bg-paper/5">
            <img
              src={purchased ? image.cloudinary?.originalUrl : image.cloudinary?.previewUrl}
              alt={image.title}
              className="w-full object-contain max-h-[70vh]"
            />
            {!purchased && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-xs text-white/20 tracking-[0.5em] uppercase rotate-[-20deg] text-2xl pointer-events-none select-none">
                  NichePix
                </span>
              </div>
            )}
          </div>

          {/* Metadata row */}
          <div className="flex items-center gap-3 flex-wrap mt-4">
            {image.tags?.map(tag => (
              <Link key={tag} to={`/gallery?q=${tag}`}
                className="font-mono text-xs text-paper/40 border border-border px-3 py-1 rounded-sm hover:text-paper hover:border-paper/25 transition-colors">
                {tag}
              </Link>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          {/* Title & contributor */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge color="blue">{image.niche}</Badge>
              {image.isFeatured && <Badge color="amber">Featured</Badge>}
              {image.isFree    && <Badge color="green">Free</Badge>}
            </div>
            <h1 className="font-serif text-3xl leading-tight mb-3">{image.title}</h1>
            <div className="flex items-center gap-3">
              {image.contributor?.avatar?.url && (
                <img src={image.contributor.avatar.url} alt=""
                  className="w-8 h-8 rounded-full object-cover" />
              )}
              <div>
                <p className="text-sm font-medium">{image.contributor?.name}</p>
                <p className="font-mono text-xs text-paper/40">Contributor</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 py-4 border-y border-border">
            {[
              { n: image.totalDownloads, l: "Downloads" },
              { n: image.viewCount,      l: "Views"     },
              { n: image.saveCount,      l: "Saved"     },
            ].map(s => (
              <div key={s.l} className="text-center">
                <p className="font-serif text-2xl">{s.n?.toLocaleString() || 0}</p>
                <p className="font-mono text-xs text-paper/40">{s.l}</p>
              </div>
            ))}
          </div>

          {/* License picker */}
          {!purchased && image.licenses?.length > 0 && (
            <div>
              <p className="font-mono text-xs text-paper/40 tracking-widest uppercase mb-3">Choose license</p>
              <div className="flex flex-col gap-2">
                {image.licenses.map(l => (
                  <button
                    key={l.type}
                    onClick={() => setSelected(l.type)}
                    className={`flex items-center justify-between px-4 py-3 border rounded-sm transition-all text-left
                      ${selected === l.type
                        ? "border-paper/50 bg-paper/5"
                        : "border-border hover:border-paper/25"}`}
                  >
                    <div>
                      <p className="text-sm capitalize">{l.type} license</p>
                      <p className="font-mono text-xs text-paper/40 mt-0.5">
                        {l.platforms?.join(", ") || "All platforms"}
                      </p>
                    </div>
                    <p className="font-serif text-xl">₹{(l.price / 100).toFixed(0)}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {purchased ? (
            <div className="flex flex-col gap-2">
              <Badge color="green">✓ Purchased</Badge>
              <Button onClick={handleDownload} loading={downloading} className="w-full">
                Download full resolution
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Button onClick={handleBuyNow} loading={paying} className="w-full">
                Buy now — ₹{selectedLicense ? (selectedLicense.price / 100).toFixed(0) : 0}
              </Button>
              <Button variant="secondary" onClick={handleAddToCart} className="w-full">
                Add to cart
              </Button>
            </div>
          )}

          {/* Image info */}
          <div className="border border-border rounded-sm px-4 py-4 flex flex-col gap-2">
            <p className="font-mono text-xs text-paper/35 tracking-widest uppercase mb-1">File info</p>
            {[
              { l: "Format",      v: image.cloudinary?.format?.toUpperCase() },
              { l: "Dimensions",  v: `${image.cloudinary?.width} × ${image.cloudinary?.height}px` },
              { l: "Size",        v: `${((image.cloudinary?.bytes || 0) / 1024 / 1024).toFixed(1)} MB` },
              { l: "Orientation", v: image.orientation },
            ].map(r => (
              <div key={r.l} className="flex justify-between">
                <span className="font-mono text-xs text-paper/40">{r.l}</span>
                <span className="font-mono text-xs text-paper/70">{r.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}