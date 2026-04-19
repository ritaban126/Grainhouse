import { useState, useEffect } from "react";
import { paymentAPI, imageAPI } from "../../api/services.js";
import { useToast } from "../../context/ToastContext.jsx";
import { PageHeader, EmptyState, Spinner, Button, Badge } from "../../components/common";


export default function Purchases() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [dlMap,   setDlMap]   = useState({});   // { "imageId-licenseType": loading }
  const { error: toastErr, success } = useToast();

  useEffect(() => {
    paymentAPI.getMyOrders()
      .then(({ data }) => setOrders(data.orders))
      .catch(() => toastErr("Could not load orders."))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (imageId, licenseType, title) => {
    const key = `${imageId}-${licenseType}`;
    setDlMap(m => ({ ...m, [key]: true }));
    try {
      const { data } = await imageAPI.download(imageId, licenseType);
      const a = document.createElement("a");
      a.href = data.downloadUrl;
      a.download = `${title}.jpg`;
      a.click();
      success("Download started.");
    } catch (err) { toastErr(err.response?.data?.message || "Download failed."); }
    finally { setDlMap(m => ({ ...m, [key]: false })); }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <PageHeader title="My Purchases" subtitle={`${orders.length} orders`} />
      {!orders.length
        ? <EmptyState title="No purchases yet."
            description="Browse the gallery and buy your first image."
            action={<Button as="a" href="/gallery">Browse gallery</Button>} />
        : (
          <div className="flex flex-col gap-4">
            {orders.map(order => (
              <div key={order._id} className="border border-border rounded-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-mono text-xs text-paper/40">Invoice {order.invoiceNumber}</p>
                    <p className="font-mono text-xs text-paper/30">{new Date(order.paidAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-xl">₹{(order.totalAmount / 100).toFixed(2)}</p>
                    <Badge color={order.status === "paid" ? "green" : order.status === "refunded" ? "red" : "default"}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 border-t border-border pt-3">
                      {item.image?.thumbnailUrl && (
                        <img src={item.image.thumbnailUrl} alt={item.image.title}
                          className="w-14 h-14 object-cover rounded-sm bg-paper/5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.image?.title || "Image"}</p>
                        <p className="font-mono text-xs text-paper/40 capitalize">{item.licenseType} license</p>
                        <p className="font-mono text-xs text-paper/30">{item.downloadCount}/{item.maxDownloads} downloads used</p>
                      </div>
                      {order.status === "paid" && (
                        <Button
                          size="sm"
                          loading={dlMap[`${item.image?._id}-${item.licenseType}`]}
                          onClick={() => handleDownload(item.image?._id, item.licenseType, item.image?.title)}
                        >
                          Download
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}