import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

  const API_URL = "http://localhost:5002/api/auth";

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user")) || {};
  } catch {
    return {};
  }
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(readStoredUser);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (res.status === 401) {
          logout();
          return;
        }
        if (!res.ok) return;
        const data = await res.json();
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      })
      .catch(() => {
        /* server offline: keep showing the saved user */
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initial = (user.name || user.usn || "S").charAt(0).toUpperCase();

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="logo">
            <div className="logo-badge">S</div>
            <div>
              <p className="logo-title">StudentMart</p>
              <p className="logo-sub">Student Portal</p>
            </div>
          </div>
          <div className="nav-links">
            <button className="nav-link active" onClick={() => navigate("/dashboard")}>Dashboard</button>
            <button className="nav-link" onClick={() => navigate("/profile")}>Profile</button>
            <button className="btn btn-outline" onClick={logout}>Logout</button>
          </div>
        </div>
      </nav>

      <main className="page">
        <div className="dash-header">
          <div>
            <p className="eyebrow">Student Dashboard</p>
            <h1>Welcome back{user.name ? `, ${user.name}` : ""}!</h1>
            <p>Manage your student account from one place.</p>
          </div>

          <div className="mini-card" onClick={() => navigate("/profile")}>
            <div className="mini-avatar">{initial}</div>
            <div className="mini-info">
              <strong>{user.usn || "—"}</strong>
              <span>Edit Profile</span>
            </div>
            <span className="mini-arrow">→</span>
          </div>
        </div>

        <div className="dash-grid">
          <section className="hero-card">
            <p className="eyebrow">StudentMart</p>
            <h2>Your student account</h2>
            <p>
              Your profile is successfully connected to StudentMart. You can manage your account
              information from the profile section.
            </p>
            <button className="btn" onClick={() => navigate("/profile")}>Edit Profile</button>
          </section>

          <section className="info-stack">
            <div className="info-card">
              <div className="label">USN</div>
              <div className="value">{user.usn || "—"}</div>
              <div className="hint">Student identification number</div>
            </div>
            <div className="info-card">
              <div className="label">Email</div>
              <div className="value">{user.email || "—"}</div>
              <div className="hint">Registered email address</div>
            </div>
            <div className="info-card">
              <div className="label">Account</div>
              <div className="value status-active">{user.status || "Active"}</div>
              <div className="hint">Your account is active</div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
