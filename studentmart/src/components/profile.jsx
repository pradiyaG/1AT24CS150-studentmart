import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

  const API_URL = "http://localhost:5002/api/auth";
const SEMESTERS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

// Calls the API with the saved token; always returns { ok, status, data }
async function request(path, options = {}) {
  const token = localStorage.getItem("token");
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
  } catch {
    return { ok: false, status: 0, data: { message: "Cannot reach the server. Is the backend running?" } };
  }
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: `Unexpected server response (${res.status})` };
  }
  return { ok: res.ok, status: res.status, data };
}

export default function Profile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    usn: "", name: "", email: "", phone: "", college: "", course: "", semester: "1st Year",
  });
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [pwMsg, setPwMsg] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  useEffect(() => {
    request("/profile").then(({ ok, status, data }) => {
      if (status === 401) return logout();
      if (!ok) return setMsg({ type: "error", text: data.message || "Could not load profile" });
      setForm({
        usn: data.usn || "",
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        college: data.college || "",
        course: data.course || "",
        semester: data.semester || "1st Year",
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handlePwChange = (e) => setPw({ ...pw, [e.target.name]: e.target.value });

  const saveProfile = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    setSaving(true);
    const { ok, status, data } = await request("/profile", { method: "PUT", body: JSON.stringify(form) });
    setSaving(false);
    if (status === 401) return logout();
    if (!ok) return setMsg({ type: "error", text: data.message || "Update failed" });
    localStorage.setItem("user", JSON.stringify(data.user));
    setMsg({ type: "success", text: data.message });
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwMsg({ type: "", text: "" });
    if (pw.newPassword.length < 6) {
      setPwMsg({ type: "error", text: "New password must be at least 6 characters" });
      return;
    }
    const { ok, status, data } = await request("/change-password", { method: "PUT", body: JSON.stringify(pw) });
    if (status === 401) return logout();
    if (!ok) return setPwMsg({ type: "error", text: data.message || "Password change failed" });
    setPw({ currentPassword: "", newPassword: "" });
    setPwMsg({ type: "success", text: data.message });
  };

  return (
    <>
      <nav className="navbar profile-nav">
        <div className="navbar-inner">
          <div className="logo">
            <p className="logo-title">StudentMart</p>
          </div>
          <div className="nav-links">
            <button className="nav-link" onClick={() => navigate("/dashboard")}>Dashboard</button>
            <button className="btn btn-outline" onClick={logout}>Logout</button>
          </div>
        </div>
      </nav>

      <main className="page">
        <div className="profile-header">
          <p className="eyebrow">Account</p>
          <h1>Your Profile</h1>
          <p>View and manage your StudentMart account information.</p>
        </div>

        <div className="profile-grid">
          <form className="panel" onSubmit={saveProfile}>
            <h3>Personal information</h3>

            <div className="field">
              <label>USN</label>
              <input name="usn" value={form.usn} disabled />
            </div>
            <div className="field">
              <label>Name</label>
              <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Email</label>
              <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="field">
              <label>Phone</label>
              <input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} />
            </div>
            <div className="field">
              <label>College</label>
              <input name="college" placeholder="College Name" value={form.college} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Course</label>
              <input name="course" placeholder="e.g. Computer Science" value={form.course} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Semester / Year</label>
              <select name="semester" value={form.semester} onChange={handleChange}>
                {SEMESTERS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
            <button type="submit" className="btn btn-block" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>

          <form className="panel" onSubmit={changePassword}>
            <h3>Change password</h3>

            <div className="field">
              <label>Current password</label>
              <input name="currentPassword" type="password" value={pw.currentPassword} onChange={handlePwChange} required />
            </div>
            <div className="field">
              <label>New password</label>
              <input name="newPassword" type="password" placeholder="Minimum 6 characters" value={pw.newPassword} onChange={handlePwChange} required />
            </div>

            {pwMsg.text && <div className={`alert alert-${pwMsg.type}`}>{pwMsg.text}</div>}
            <button type="submit" className="btn btn-block">Change password</button>
          </form>
        </div>
      </main>
    </>
  );
}
