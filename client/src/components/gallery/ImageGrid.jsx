import { ImageCard } from "./ImageCard";

export const ImageGrid = ({ images, loading, emptyMessage = "No images found." }) => {
  if (loading && !images.length) {
    return (
      <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="break-inside-avoid mb-3 rounded-sm bg-paper/5 animate-pulse"
            style={{ height: `${180 + (i % 3) * 60}px` }}
          />
        ))}
      </div>
    );
  }
 
  if (!images.length) {
    return (
      <div className="text-center py-20">
        <p className="font-mono text-xs text-paper/30">{emptyMessage}</p>
      </div>
    );
  }
 
  return (
    <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
      {images.map(img => (
        <div key={img._id} className="break-inside-avoid mb-3">
          <ImageCard image={img} />
        </div>
      ))}
    </div>
  );
};