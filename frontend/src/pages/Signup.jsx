import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await api.register(form);
      login(result);
      navigate("/");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={submit}>
        <h1>🌍 Wanderlust</h1>
        <p className="auth-sub">Create your account</p>

        <label>Name</label>
        <input value={form.name} onChange={update("name")} required />

        <label>Email</label>
        <input type="email" value={form.email} onChange={update("email")} required />

        <label>Password</label>
        <input type="password" value={form.password} onChange={update("password")} required />

        {error && <div className="error">{error}</div>}

        <button className="btn-primary full" disabled={loading}>
          {loading ? "Creating…" : "Sign up"}
        </button>

        <div className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </form>
    </div>
  );
}
