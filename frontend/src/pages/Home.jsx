import { useState, useEffect } from "react";
import api from "../api";
import ProductCard from "../components/ProductCard";

const CATEGORIES = ["All", "Electronics", "Clothing", "Books", "Home & Garden", "Sports", "Toys", "Other"];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [search, category]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products", { params: { search, category: category === "All" ? "" : category } });
      setProducts(data);
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      <div className="container">
        {/* Hero */}
        <div style={{ textAlign: "center", padding: "40px 0 36px" }}>
          <h1 style={{ fontSize: "2.4rem", fontWeight: 800, color: "var(--primary)" }}>
            Buy & Sell Anything
          </h1>
          <p style={{ color: "var(--muted)", marginTop: 10, fontSize: "1.05rem" }}>
            Thousands of items listed by real people
          </p>
        </div>

        {/* Search */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <input
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 200 }}
          />
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: "auto", minWidth: 160 }}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Grid */}
        {loading
          ? <p style={{ textAlign: "center", color: "var(--muted)", padding: 60 }}>Loading...</p>
          : products.length === 0
            ? <p style={{ textAlign: "center", color: "var(--muted)", padding: 60 }}>No products found.</p>
            : <div className="grid">{products.map(p => <ProductCard key={p.id} product={p} />)}</div>
        }
      </div>
    </div>
  );
}