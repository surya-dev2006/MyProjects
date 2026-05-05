import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Cart() {
  const [cart, setCart]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]       = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem("cart") || "[]"));
  }, []);

  const remove = (product_id) => {
    const updated = cart.filter(i => i.product_id !== product_id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const checkout = async () => {
    if (!cart.length) return;
    setLoading(true);
    try {
      await api.post("/orders", { items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity })) });
      localStorage.removeItem("cart");
      setCart([]);
      setMsg("Order placed! Thank you.");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      setMsg(err.response?.data?.error || "Order failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 760 }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 24 }}>Your Cart</h1>

        {cart.length === 0
          ? <div className="card" style={{ textAlign: "center", padding: 60, color: "var(--muted)" }}>
              Your cart is empty. <a href="/" style={{ color: "var(--accent)" }}>Browse products</a>
            </div>
          : <>
              {cart.map(item => (
                <div key={item.product_id} className="card" style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16 }}>
                  <div style={{ width: 72, height: 72, background: "#eee", borderRadius: 8, flexShrink: 0, overflow: "hidden" }}>
                    {item.image_url
                      ? <img src={item.image_url} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem" }}>📦</div>
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600 }}>{item.title}</p>
                    <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>Qty: {item.quantity}</p>
                  </div>
                  <p style={{ fontWeight: 700, color: "var(--accent)" }}>₹{(item.price * item.quantity).toLocaleString()}</p>
                  <button className="btn-outline" onClick={() => remove(item.product_id)}
                    style={{ padding: "6px 12px", fontSize: "0.8rem", color: "#dc2626", borderColor: "#dc2626" }}>
                    Remove
                  </button>
                </div>
              ))}

              <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Total</p>
                  <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--accent)" }}>₹{total.toLocaleString()}</p>
                </div>
                <button className="btn-primary" onClick={checkout} disabled={loading}
                  style={{ padding: "12px 32px", fontSize: "1rem" }}>
                  {loading ? "Placing..." : "Place Order"}
                </button>
              </div>
              {msg && <p style={{ marginTop: 12, textAlign: "center", color: msg.includes("failed") ? "#dc2626" : "#16a34a", fontWeight: 600 }}>{msg}</p>}
            </>
        }
      </div>
    </div>
  );
}