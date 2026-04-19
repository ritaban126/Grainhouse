import { Badge } from "../../components/common";

const STATUS_COLOR = { approved:"green", pending:"amber", rejected:"red", flagged:"red" };

export default function MyImage() {
  const [images,  setImages]  = useState([]);
  const [status,  setStatus]  = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    contributorAPI.myImages({ status })
      .then(({ data }) => setImages(data.images))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <PageHeader
        title="My images"
        action={
          <Link to="/contributor/upload"
            className="font-mono text-xs bg-paper text-ink px-5 py-2.5 rounded-sm hover:bg-paper/90 transition-colors">
            Upload new
          </Link>
        }
      />

      {/* Status filter */}
      <div className="flex gap-2 mb-6">
        {["","pending","approved","rejected"].map(s => (
          <button key={s} onClick={() => setStatus(s)}
            className={`font-mono text-xs px-3 py-1.5 rounded-sm border transition-all capitalize
              ${status === s ? "bg-paper text-ink border-paper" : "border-border text-paper/45 hover:text-paper/80"}`}>
            {s || "All"}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : (
        !images.length
          ? <EmptyState title="No images yet." description="Upload your first image to get started." />
          : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {images.map(img => (
                <div key={img._id} className="border border-border rounded-sm overflow-hidden">
                  <div className="relative">
                    <img src={img.cloudinary?.thumbnailUrl} alt={img.title}
                      className="w-full h-36 object-cover bg-paper/5" />
                    <div className="absolute top-2 right-2">
                      <Badge color={STATUS_COLOR[img.status] || "default"}>{img.status}</Badge>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-medium truncate mb-1">{img.title}</p>
                    <p className="font-mono text-[10px] text-paper/35">{img.totalDownloads || 0} downloads</p>
                    {img.status === "rejected" && img.rejectionNote && (
                      <p className="font-mono text-[10px] text-red-400/70 mt-1 leading-relaxed">{img.rejectionNote}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
      )}
    </div>
  );
}