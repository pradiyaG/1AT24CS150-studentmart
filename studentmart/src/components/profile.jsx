import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get("/auth/me").then(({ data }) => setUser(data)).catch(() => {});
  }, []);

  if (!user) return <p className="loading">Loading profile...</p>;

  return (
    <div className="panel">
      <span className="eyebrow">STUDENT PROFILE</span>
      <h1>My Profile</h1>

      <div className="profile-row">
        <span>University Seat Number</span>
        <span>{user.usn}</span>
      </div>
      <div className="profile-row">
        <span>Email address</span>
        <span>{user.email}</span>
      </div>
      <div className="profile-row">
        <span>Phone</span>
        <span>{user.phone || "—"}</span>
      </div>
      <div className="profile-row">
        <span>Address</span>
        <span>{user.address || "—"}</span>
      </div>

      <Link to="/edit-profile">
        <button className="btn-gradient" type="button">
          Edit Profile
        </button>
      </Link>
    </div>
  );
}
