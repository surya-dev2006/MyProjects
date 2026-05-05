import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function Register() {
  const [form, setForm]   = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/register", form);
      login(data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="page" style={{ display: "flex", justifyContent: "center" }}>
      <div className="card" style={{ width: "100%", maxWidth: 420 }}>
        <h2 style={{ marginBottom: 24, fontSize: "1.4rem", fontWeight: 700 }}>Create account</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input placeholder="Full name" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })} required />
          <input type="email" placeholder="Email" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })} required />
          <input type="password" placeholder="Password (min 6 chars)" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn-primary" style={{ marginTop: 6 }}>Create Account</button>
        </form>
        <p style={{ marginTop: 20, textAlign: "center", color: "var(--muted)", fontSize: "0.9rem" }}>
          Already have an account? <Link to="/login" style={{ color: "var(--accent)" }}>Login</Link>
        </p>
      </div>
    </div>
  );
}