import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api";

const CATEGORIES = ["Electronics", "Clothing", "Books", "Home & Garden", "Sports", "Toys", "Other"];

export default function Dashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders]     = useState([]);
  const [tab, setTab]           = useState("listings");
  const [form, setForm] = useState({ title: "", description: "", price: "", category: "", stock: 1 });
  const [image, setImage] = useState(null);
  const [msg, setMsg]     = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, o] = await Promise.all([
          api.get("/products/seller/mine"),
          api.get("/orders/mine")
        ]);
        setProducts(p.data || []);
        setOrders(o.data || []);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const submitProduct = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (image) fd.append("image", image);
    try {
      await api.post("/products", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setMsg("Product listed!");
      setForm({ title: "", description: "", price: "", category: "", stock: 1 });
      setImage(null);
      const { data } = await api.get("/products/seller/mine");
      setProducts(data || []);
    } catch (err) {
      setMsg(err.response?.data?.error || "Error listing product");
    }
    setTimeout(() => setMsg(""), 3000);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const TabBtn = ({ id, label }) => (
    <button onClick={() => setTab(id)} style={{
      background: tab === id ? "var(--accent)" : "transparent",
      color: tab === id ? "#fff" : "var(--muted)",
      border: "1.5px solid",
      borderColor: tab === id ? "var(--accent)" : "var(--border)",
      borderRadius: 8, padding: "8px 18px", fontWeight: 600
    }}>{label}</button>
  );

  if (loading) return (
    <div className="page" style={{ textAlign: "center", color: "var(--muted)" }}>
      Loading dashboard...
    </div>
  );

  return (
    <div className="page">
      <div className="container">
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 6 }}>Dashboard</h1>
        <p style={{ color: "var(--muted)", marginBottom: 28 }}>Welcome, {user?.name}</p>

        <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
          <TabBtn id="listings" label={`My Listings (${products.length})`} />
          <TabBtn id="orders"   label={`My Orders (${orders.length})`} />
          <TabBtn id="sell"     label="+ New Listing" />
        </div>

        {/* LISTINGS */}
        {tab === "listings" && (
          products.length === 0
            ? <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>
                No listings yet. Click "+ New Listing" to add one.
              </div>
            : <div className="grid">
                {products.map(p => (
                  <div key={p.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
                    <div style={{ height: 140, background: "#eee", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {p.image_url
                        ? <img src={p.image_url} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <span style={{ fontSize: "2.5rem" }}>📦</span>}
                    </div>
                    <div style={{ padding: 16 }}>
                      <p style={{ fontWeight: 600, marginBottom: 4 }}>{p.title}</p>
                      <p style={{ color: "var(--accent)", fontWeight: 700 }}>₹{Number(p.price).toLocaleString()}</p>
                      <p style={{ color: "var(--muted)", fontSize: "0.82rem" }}>Stock: {p.stock}</p>
                      <button onClick={() => deleteProduct(p.id)} style={{
                        marginTop: 12, width: "100%", background: "#fee2e2", color: "#dc2626",
                        border: "none", borderRadius: 8, padding: 8, fontWeight: 600, cursor: "pointer"
                      }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
        )}

        {/* ORDERS */}
        {tab === "orders" && (
          orders.length === 0
            ? <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>
                No orders yet. Browse products to make your first order!
              </div>
            : orders.map(order => (
                <div key={order.id} className="card" style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <div>
                      <p style={{ fontWeight: 700 }}>Order #{order.id}</p>
                      <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontWeight: 700, color: "var(--accent)" }}>
                        ₹{Number(order.total).toLocaleString()}
                      </p>
                      <span className="badge" style={{ background: "#dcfce7", color: "#166534" }}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  {Array.isArray(order.items) && order.items.map(item => (
                    <div key={item.id} style={{
                      display: "flex", gap: 10, padding: "8px 0",
                      borderTop: "1px solid var(--border)", alignItems: "center"
                    }}>
                      <div style={{ width: 40, height: 40, background: "#eee", borderRadius: 6, overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {item.image_url
                          ? <img src={item.image_url} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <span style={{ fontSize: "1.2rem" }}>📦</span>}
                      </div>
                      <p style={{ flex: 1, fontSize: "0.9rem" }}>{item.title}</p>
                      <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>×{item.quantity}</p>
                      <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ))
        )}

        {/* SELL */}
        {tab === "sell" && (
          <div className="card" style={{ maxWidth: 520 }}>
            <h2 style={{ marginBottom: 20, fontWeight: 700 }}>List a Product</h2>
            <form onSubmit={submitProduct} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input placeholder="Title *" value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })} required />
              <textarea placeholder="Description" rows={3} value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                style={{ resize: "vertical" }} />
              <input type="number" placeholder="Price (₹) *" value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })} required min={0} />
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <input type="number" placeholder="Stock quantity" value={form.stock}
                onChange={e => setForm({ ...form, stock: e.target.value })} min={1} />
              <div>
                <label style={{ display: "block", marginBottom: 6, color: "var(--muted)", fontSize: "0.9rem" }}>
                  Product Image (optional)
                </label>
                <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])}
                  style={{ border: "1.5px dashed var(--border)", padding: 12, cursor: "pointer" }} />
              </div>
              {msg && (
                <p className={msg.includes("Error") || msg.includes("failed") ? "error" : "success"}>
                  {msg}
                </p>
              )}
              <button type="submit" className="btn-primary">List Product</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}