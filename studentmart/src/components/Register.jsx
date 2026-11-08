import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    usn: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) return setError("Passwords do not match");
    setLoading(true);
    try {
      const { confirm, ...payload } = form;
      const { data } = await axios.post("/auth/register", payload);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand">
          <div className="brand-logo">S</div>
          <div>
            <div className="brand-name">StudentMart</div>
            <div className="brand-sub">Your student space</div>
          </div>
        </div>

        <span className="eyebrow">GET STARTED</span>
        <h1>Create your account</h1>
        <p className="subtitle">Join StudentMart and start exploring.</p>

        {error && <div className="error-text">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>University Seat Number</label>
            <input name="usn" placeholder="e.g. 035" value={form.usn} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Email address</label>
            <input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Phone</label>
            <input name="phone" placeholder="Enter phone number" value={form.phone} onChange={handleChange} />
          </div>
          <div className="field">
            <label>Address</label>
            <input name="address" placeholder="Enter your address" value={form.address} onChange={handleChange} />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" name="password" placeholder="Create a password" value={form.password} onChange={handleChange} required minLength={6} />
          </div>
          <div className="field">
            <label>Confirm password</label>
            <input type="password" name="confirm" placeholder="Re-enter your password" value={form.confirm} onChange={handleChange} required />
          </div>
          <button className="btn-gradient" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Account →"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
