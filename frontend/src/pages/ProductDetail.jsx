import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function ProductDetail() {
  const { id } = useParams();
  const { isAuth, user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [qty, setQty]         = useState(1);
  const [msg, setMsg]         = useState("");

  useEffect(() => {
    api.get(`/products/${id}`).then(r => setProduct(r.data)).catch(() => navigate("/"));
  }, [id]);

  const addToCart = () => {
    if (!isAuth) return navigate("/login");
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find(i => i.product_id === product.id);
    if (existing) existing.quantity += qty;
    else cart.push({ product_id: product.id, quantity: qty, title: product.title, price: product.price, image_url: product.image_url });
    localStorage.setItem("cart", JSON.stringify(cart));
    setMsg("Added to cart!");
    setTimeout(() => setMsg(""), 2000);
  };

  if (!product) return <div className="page container">Loading...</div>;

  const isOwner = user?.id === product.seller_id;

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }}>
          {/* Image */}
          <div style={{ background: "#eee", borderRadius: 12, overflow: "hidden", aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {product.image_url
              ? <img src={product.image_url} alt={product.title} style={{ width: "100%", objectFit: "cover" }} />
              : <span style={{ fontSize: "5rem" }}>📦</span>
            }
          </div>

          {/* Info */}
          <div>
            {product.category && (
              <span className="badge" style={{ background: "#f0f4ff", color: "var(--accent2)", marginBottom: 12 }}>
                {product.category}
              </span>
            )}
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, lineHeight: 1.2 }}>{product.title}</h1>
            <p style={{ fontSize: "2rem", fontWeight: 700, color: "var(--accent)", margin: "12px 0" }}>
              ₹{product.price.toLocaleString()}
            </p>
            <p style={{ color: "var(--muted)", marginBottom: 16 }}>Sold by <strong>{product.seller_name}</strong></p>
            {product.description && (
              <p style={{ lineHeight: 1.7, color: "#374151", marginBottom: 20 }}>{product.description}</p>
            )}
            <p style={{ color: product.stock > 0 ? "#16a34a" : "#dc2626", fontWeight: 600, marginBottom: 20 }}>
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </p>

            {!isOwner && product.stock > 0 && (
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <input type="number" min={1} max={product.stock} value={qty}
                  onChange={e => setQty(Number(e.target.value))}
                  style={{ width: 80 }} />
                <button className="btn-primary" onClick={addToCart} style={{ flex: 1, minWidth: 160 }}>
                  Add to Cart
                </button>
              </div>
            )}
            {msg && <p className="success" style={{ marginTop: 12 }}>{msg}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}