import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { imageAPI } from "../../api/services.js";
import { Badge } from "../../components/common";

// ── ImageCard ─────────────────────────────────────────────────────────────────
export const ImageCard = ({ image, showNiche = true }) => {
  const { isAuth, user } = useAuth();
  const { addToCart } = useCart();
  const { success, error: toastError, info } = useToast();
  const [saved, setSaved] = useState(user?.savedImages?.includes(image._id));
  const [savingToggle, setSavingToggle] = useState(false);
 
  const lowestPrice = image.licenses?.length
    ? Math.min(...image.licenses.map(l => l.price)) / 100
    : null;
 
  const handleSave = async (e) => {
    e.preventDefault();
    if (!isAuth) { info("Sign in to save images."); return; }
    setSavingToggle(true);
    try {
      const { data } = await imageAPI.toggleSave(image._id);
      setSaved(data.saved);
      success(data.saved ? "Saved to your collection." : "Removed from saved.");
    } catch { toastError("Could not save image."); }
    finally  { setSavingToggle(false); }
  };
 
  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!isAuth) { info("Sign in to purchase images."); return; }
    const license = image.licenses?.[0];
    if (!license) return;
    addToCart({ imageId: image._id, title: image.title, licenseType: license.type, price: license.price, thumbnailUrl: image.cloudinary?.thumbnailUrl });
    success(`Added to cart.`);
  };
 
  return (
    <Link to={`/images/${image._id}`} className="img-card block relative group overflow-hidden rounded-sm bg-paper/5">
      {/* Image */}
      <div className="relative overflow-hidden" style={{ paddingBottom: "66.67%" }}>
        <img
          src={image.cloudinary?.thumbnailUrl || image.cloudinary?.previewUrl}
          alt={image.title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
 
        {/* Overlay */}
        <div className="overlay absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
 
        {/* Top badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {showNiche && image.niche && (
            <span className="font-mono text-[10px] bg-ink/70 text-paper/70 px-2 py-0.5 rounded-sm backdrop-blur-sm">
              {image.niche}
            </span>
          )}
          {image.isFree && <Badge color="green">Free</Badge>}
        </div>
 
        {/* Price */}
        {lowestPrice !== null && (
          <div className="absolute top-3 right-3">
            <span className="font-mono text-[10px] bg-ink/70 text-paper px-2 py-0.5 rounded-sm backdrop-blur-sm">
              from ₹{lowestPrice}
            </span>
          </div>
        )}
 
        {/* Bottom — visible on hover */}
        <div className="overlay absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm text-paper font-medium truncate leading-tight">{image.title}</p>
            <p className="font-mono text-[10px] text-paper/60">
              by {image.contributor?.name || "Unknown"}
            </p>
          </div>
          <div className="flex gap-1.5 shrink-0">
            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={savingToggle}
              className={`w-7 h-7 rounded-sm border border-border/60 backdrop-blur-sm flex items-center justify-center transition-all
                ${saved ? "bg-accent text-ink border-accent" : "bg-ink/50 text-paper/60 hover:text-paper"}`}
              title={saved ? "Remove from saved" : "Save image"}
            >
              <svg width="12" height="12" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
              </svg>
            </button>
            {/* Quick add to cart */}
            <button
              onClick={handleQuickAdd}
              className="w-7 h-7 rounded-sm border border-border/60 bg-ink/50 backdrop-blur-sm flex items-center justify-center text-paper/60 hover:text-paper transition-colors"
              title="Add to cart"
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.95-1.57l1.65-8.42H6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};