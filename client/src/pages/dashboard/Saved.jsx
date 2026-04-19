import { userAPI } from "../../api/services.js";
import { ImageGrid } from "../../components/gallery/ImageGrid.jsx";

export default function Saved() {
  const [saved,   setSaved]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userAPI.getSaved()
      .then(({ data }) => setSaved(data.savedImages))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <PageHeader title="Saved images" subtitle={`${saved.length} images`} />
      <ImageGrid images={saved} loading={loading} emptyMessage="Nothing saved yet. Browse the gallery and bookmark images you love." />
    </div>
  );
}