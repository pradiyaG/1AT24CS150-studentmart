import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import axios from "axios";

export default function Dashboard() {
  const { cartCount } = useOutletContext();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));

  useEffect(() => {
    axios
      .get("/auth/me")
      .then(({ data }) => {
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <div className="dash-top">
        <div>
          <span className="eyebrow">STUDENT WORKSPACE</span>
          <h1>Dashboard</h1>
        </div>
        <div className="dash-badge">{cartCount}</div>
      </div>

      <section className="hero">
        <span className="eyebrow">YOUR SPACE. YOUR JOURNEY.</span>
        <h2>Hello, {user?.usn || "Student"}! 👋</h2>
        <p>
          Everything you need to manage your student profile and explore StudentMart, all in one
          place.
        </p>
        <Link to="/profile" className="hero-btn">
          View my profile →
        </Link>
      </section>

      <h3 className="section-title">Your account overview</h3>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="icon-box">👤</div>
          <div className="label">University Seat Number</div>
          <div className="value">{user?.usn}</div>
          <div className="hint">Student identification</div>
        </div>
        <div className="stat-card">
          <div className="icon-box">✉</div>
          <div className="label">Email address</div>
          <div className="value">{user?.email}</div>
          <div className="hint">Account contact</div>
        </div>
      </div>

      <h3 className="section-title">Quick actions</h3>
      <div className="action-grid">
        <Link to="/profile" className="action-card">
          <div className="icon-box">👤</div>
          <h3>View Profile</h3>
          <p>See your saved student information.</p>
        </Link>
        <Link to="/edit-profile" className="action-card">
          <div className="icon-box">✎</div>
          <h3>Edit Details</h3>
          <p>Update your USN, email, phone or address.</p>
        </Link>
        <Link to="/edit-profile" className="action-card">
          <div className="icon-box">◇</div>
          <h3>Security</h3>
          <p>Change your account password.</p>
        </Link>
      </div>
    </>
  );
}
