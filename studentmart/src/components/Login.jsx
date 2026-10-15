import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

  const API_URL = "http://localhost:5002/api/auth";

// Calls the API and always returns { ok, status, data } with a readable message
async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    });
  } catch {
    return {
      ok: false,
      status: 0,
      data: { message: "Cannot reach the server. Start the backend: open the server folder and run npm run dev." },
    };
  }
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: `Unexpected server response (${res.status}). Is the backend running on port 5000?` };
  }
  return { ok: res.ok, status: res.status, data };
}

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { ok, data } = await request("/login", {
      method: "POST",
      body: JSON.stringify({ email: form.email.trim(), password: form.password }),
    });

    setLoading(false);
    if (!ok) {
      setError(data.message || "Login failed");
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    navigate("/dashboard");
  };

  return (
    <div className="auth-page">
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      <div className="auth-card">
        <div className="logo">
          <div className="logo-badge">S</div>
          <div>
            <p className="logo-title">StudentMart</p>
            <p className="logo-sub">Student Profile Management</p>
          </div>
        </div>

        <p className="eyebrow">Welcome back</p>
        <h1>Sign in to your account</h1>
        <p className="subtitle">Enter your credentials to continue.</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="Enter your email" value={form.email} onChange={handleChange} required />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="Enter your password" value={form.password} onChange={handleChange} required />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <button type="submit" className="btn btn-block" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account?
          <Link to="/register">Create Account</Link>
        </p>
      </div>
    </div>
  );
}
