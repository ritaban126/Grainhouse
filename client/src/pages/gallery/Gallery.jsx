// import { useEffect, useCallback } from "react";
// import { useSearchParams } from "react-router-dom";
// import { useImages } from "../../context/ImageContext.jsx";
// import { useDebounce } from "../../hooks/useDebounce.js";
// import {useIntersection} from "../../hooks/useIntersection.js";
// import { Spinner } from "../../components/common";
// import { useState } from "react";
// import { NicheFilter } from "../../components/gallery/NicheFilter.jsx";
// import { ImageGrid } from "../../components/gallery/ImageGrid.jsx";

// const SORTS = [
//   { label: "Newest",      value: "-createdAt" },
//   { label: "Popular",     value: "-totalDownloads" },
//   { label: "Trending",    value: "-viewCount"      },
//   { label: "Price: Low",  value: "licenses.price"  },
// ];

// const ORIENTATIONS = ["","landscape","portrait","square"];

// export default function Gallery() {
//   const { images, loading, hasMore, filters, fetchImages, setFilters, loadMore } = useImages();
//   const [searchInput, setSearchInput] = useState(filters.q || "");
//   const [sp] = useSearchParams();
//   const debouncedSearch = useDebounce(searchInput, 400);

//   // Sync niche from URL query (?niche=YouTube)
//   useEffect(() => {
//     const niche = sp.get("niche") || "";
//     if (niche !== filters.niche) setFilters({ niche });
//   }, [sp]);

//   // Trigger fetch whenever filters change
//   useEffect(() => { fetchImages(); }, [filters]);

//   // Debounced search
//   useEffect(() => {
//     if (debouncedSearch !== filters.q) setFilters({ q: debouncedSearch });
//   }, [debouncedSearch]);

//   // Infinite scroll sentinel
//   const sentinelRef = useIntersection(useCallback(() => {
//     if (hasMore && !loading) loadMore();
//   }, [hasMore, loading, loadMore]));

//   // Load more when page increments
//   useEffect(() => {
//     if (filters.page > 1) fetchImages({}, true);
//   }, [filters.page]);

//   return (
//     <div className="max-w-7xl mx-auto px-6 py-10">
//       {/* Header */}
//       <div className="mb-8">
//         <p className="font-mono text-xs text-paper/35 tracking-widest uppercase mb-2">Browse</p>
//         <h1 className="font-serif text-4xl md:text-5xl tracking-tight">
//           {filters.niche ? `${filters.niche} images` : "All images"}
//         </h1>
//       </div>

//       {/* Search bar */}
//       <div className="flex gap-2 mb-6">
//         <div className="relative flex-1 max-w-lg">
//           <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-paper/30 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
//             <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
//           </svg>
//           <input
//             value={searchInput}
//             onChange={e => setSearchInput(e.target.value)}
//             placeholder="Search by keyword, mood, use case..."
//             className="w-full bg-paper/5 border border-border text-paper text-sm pl-10 pr-4 py-2.5 rounded-sm placeholder:text-paper/25 focus:outline-none focus:border-paper/40 font-mono transition-colors"
//           />
//         </div>

//         {/* Sort */}
//         <select
//           value={filters.sort}
//           onChange={e => setFilters({ sort: e.target.value })}
//           className="bg-paper/5 border border-border text-paper text-xs font-mono px-3 py-2.5 rounded-sm focus:outline-none focus:border-paper/40 cursor-pointer"
//         >
//           {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
//         </select>

//         {/* Orientation */}
//         <select
//           value={filters.orientation}
//           onChange={e => setFilters({ orientation: e.target.value })}
//           className="bg-paper/5 border border-border text-paper text-xs font-mono px-3 py-2.5 rounded-sm focus:outline-none focus:border-paper/40 cursor-pointer"
//         >
//           <option value="">All orientations</option>
//           <option value="landscape">Landscape</option>
//           <option value="portrait">Portrait</option>
//           <option value="square">Square</option>
//         </select>
//       </div>

//       {/* Niche filter pills */}
//       <div className="mb-8">
//         <NicheFilter  active={filters.niche}
//           onChange={niche => setFilters({ niche })}/>
//       </div>

//       {/* Image grid */}
//       <ImageGrid images={images} loading={loading} emptyMessage="No images match your search."/>

//       {/* Infinite scroll sentinel */}
//       <div ref={sentinelRef} className="h-10 flex items-center justify-center mt-8">
//         {loading && images.length > 0 && <Spinner />}
//         {!hasMore && images.length > 0 && (
//           <p className="font-mono text-xs text-paper/25">All images loaded.</p>
//         )}
//       </div>
//     </div>
//   );
// }


import { useEffect, useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useImages } from "../../context/ImageContext.jsx";
import { useDebounce } from "../../hooks/useDebounce.js";
import { useIntersection } from "../../hooks/useIntersection.js";
import { Spinner } from "../../components/common";
import { NicheFilter } from "../../components/gallery/NicheFilter.jsx";
import { ImageGrid } from "../../components/gallery/ImageGrid.jsx";

const SORTS = [
  { label: "Newest", value: "-createdAt" },
  { label: "Popular", value: "-totalDownloads" },
  { label: "Trending", value: "-viewCount" },
  { label: "Price: Low", value: "licenses.price" },
];

export default function Gallery() {
  const {
    images,
    loading,
    hasMore,
    filters,
    fetchImages,
    setFilters,
    loadMore,
  } = useImages();

  const [searchInput, setSearchInput] = useState(filters.q || "");
  const [sp] = useSearchParams();
  const debouncedSearch = useDebounce(searchInput, 400);

  // Sync niche from URL
  useEffect(() => {
    const niche = sp.get("niche") || "";
    if (niche !== filters.niche) setFilters({ niche });
  }, [sp]);

  // Fetch when filters change
  useEffect(() => {
    fetchImages();
  }, [filters]);

  // Debounced search
  useEffect(() => {
    if (debouncedSearch !== filters.q) {
      setFilters({ q: debouncedSearch });
    }
  }, [debouncedSearch]);

  // Infinite scroll
  const sentinelRef = useIntersection(
    useCallback(() => {
      if (hasMore && !loading) loadMore();
    }, [hasMore, loading, loadMore])
  );

  // Page change fetch
  useEffect(() => {
    if (filters.page > 1) fetchImages({}, true);
  }, [filters.page]);

  const safeImages = images || []; // ✅ IMPORTANT SAFETY FIX

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="font-mono text-xs text-paper/35 tracking-widest uppercase mb-2">
          Browse
        </p>
        <h1 className="font-serif text-4xl md:text-5xl tracking-tight">
          {filters.niche ? `${filters.niche} images` : "All images"}
        </h1>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1 max-w-lg">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by keyword..."
            className="w-full bg-paper/5 border border-border text-paper text-sm px-4 py-2.5 rounded-sm font-mono"
          />
        </div>

        <select
          value={filters.sort}
          onChange={(e) => setFilters({ sort: e.target.value })}
          className="bg-paper/5 border border-border text-xs font-mono px-3 py-2.5 rounded-sm"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <select
          value={filters.orientation}
          onChange={(e) => setFilters({ orientation: e.target.value })}
          className="bg-paper/5 border border-border text-xs font-mono px-3 py-2.5 rounded-sm"
        >
          <option value="">All</option>
          <option value="landscape">Landscape</option>
          <option value="portrait">Portrait</option>
          <option value="square">Square</option>
        </select>
      </div>

      {/* Niche filter */}
      <div className="mb-8">
        <NicheFilter
          active={filters.niche}
          onChange={(niche) => setFilters({ niche })}
        />
      </div>

      {/* Grid */}
      <ImageGrid
        images={safeImages}
        loading={loading}
        emptyMessage="No images match your search."
      />

      {/* Sentinel */}
      <div
        ref={sentinelRef}
        className="h-10 flex items-center justify-center mt-8"
      >
        {loading && safeImages.length > 0 && <Spinner />}

        {!hasMore && safeImages.length > 0 && (
          <p className="font-mono text-xs text-paper/25">
            All images loaded.
          </p>
        )}
      </div>
    </div>
  );
}