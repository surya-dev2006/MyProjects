import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  return (
    <Link to={`/product/${product.id}`} style={{ display: "block" }}>
      <div className="card" style={{ cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s", overflow: "hidden", padding: 0 }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
        <div style={{ height: 200, background: "#eee", overflow: "hidden" }}>
          {product.image_url
            ? <img src={product.image_url} alt={product.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>📦</div>
          }
        </div>
        <div style={{ padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 8 }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, lineHeight: 1.3 }}>{product.title}</h3>
            <span style={{ fontWeight: 700, color: "var(--accent)", whiteSpace: "nowrap", fontSize: "1.05rem" }}>
              ₹{product.price.toLocaleString()}
            </span>
          </div>
          <p style={{ color: "var(--muted)", fontSize: "0.82rem", marginTop: 6 }}>by {product.seller_name}</p>
          {product.category && (
            <span className="badge" style={{ background: "#f0f4ff", color: "var(--accent2)", marginTop: 8 }}>
              {product.category}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}