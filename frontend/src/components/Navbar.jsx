import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout, isAuth } = useAuth();
  const navigate = useNavigate();

  return (
    <nav style={{
      background: "var(--primary)", color: "#fff", padding: "0 20px",
      position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
    }}>
      <div className="container" style={{ display: "flex", alignItems: "center", gap: 24, height: 60 }}>
        <Link to="/" style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--accent)", letterSpacing: "-0.5px" }}>
          🛒 Market
        </Link>

        <div style={{ flex: 1 }} />

        <Link to="/" style={{ color: "#ccc", fontSize: "0.9rem" }}>Browse</Link>

        {isAuth ? (
          <>
            <Link to="/cart"      style={{ color: "#ccc", fontSize: "0.9rem" }}>Cart</Link>
            <Link to="/dashboard" style={{ color: "#ccc", fontSize: "0.9rem" }}>Dashboard</Link>
            <span style={{ color: "#aaa", fontSize: "0.85rem" }}>
              Hi, {user?.name?.split(" ")[0] ?? ""}
            </span>
            <button
              onClick={() => { logout(); navigate("/"); }}
              className="btn-outline"
              style={{ color: "#ccc", borderColor: "#444", padding: "6px 14px", fontSize: "0.85rem" }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">
              <button className="btn-outline"
                style={{ color: "#ccc", borderColor: "#444", padding: "6px 14px", fontSize: "0.85rem" }}>
                Login
              </button>
            </Link>
            <Link to="/register">
              <button className="btn-primary" style={{ padding: "6px 14px", fontSize: "0.85rem" }}>
                Sign Up
              </button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}