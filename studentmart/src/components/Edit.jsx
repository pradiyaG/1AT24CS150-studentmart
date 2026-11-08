import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Edit() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ usn: "", email: "", phone: "", address: "" });
  const [pwd, setPwd] = useState({ currentPassword: "", newPassword: "" });
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    axios
      .get("/auth/me")
      .then(({ data }) =>
        setForm({ usn: data.usn, email: data.email, phone: data.phone || "", address: data.address || "" })
      )
      .catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put("/auth/me", form);
      localStorage.setItem("user", JSON.stringify(data));
      navigate("/profile");
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Update failed" });
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    try {
      await axios.put("/auth/password", pwd);
      setPwd({ currentPassword: "", newPassword: "" });
      setMsg({ type: "success", text: "Password updated successfully" });
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Could not update password" });
    }
  };

  return (
    <div className="panel">
      <span className="eyebrow">STUDENT WORKSPACE</span>
      <h1>Edit Profile</h1>

      {msg.text && (
        <div className={msg.type === "error" ? "error-text" : "success-text"}>{msg.text}</div>
      )}

      <form onSubmit={saveProfile}>
        <div className="field">
          <label>University Seat Number</label>
          <input name="usn" value={form.usn} onChange={handleChange} required />
        </div>
        <div className="field">
          <label>Email address</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="field">
          <label>Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} />
        </div>
        <div className="field">
          <label>Address</label>
          <input name="address" value={form.address} onChange={handleChange} />
        </div>
        <button className="btn-gradient" type="submit">
          Save Changes
        </button>
      </form>

      <hr />
      <h3>Security</h3>
      <form onSubmit={changePassword}>
        <div className="field">
          <label>Current password</label>
          <input
            type="password"
            value={pwd.currentPassword}
            onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label>New password</label>
          <input
            type="password"
            value={pwd.newPassword}
            onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })}
            required
            minLength={6}
          />
        </div>
        <button className="btn-gradient" type="submit">
          Update Password
        </button>
      </form>
    </div>
  );
}
