import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/ProductForm.css";

const CATEGORIES = ["Electronics", "Books", "Stationery", "Clothing", "Accessories", "Other"];

export default function ProductForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    category: "Electronics",
    price: "",
    stock: "",
    description: "",
    image: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post("/products", form);
      navigate("/products");
    } catch (err) {
      setError(err.response?.data?.message || "Could not add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pf-card">
      <span className="eyebrow">STUDENTMART STORE</span>
      <h1>Add New Product</h1>
      <p className="pf-sub">Enter product information, pricing and available stock.</p>

      {error && <div className="error-text">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Product Name *</label>
          <input name="name" placeholder="Enter product name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="field">
          <label>Category *</label>
          <select name="category" value={form.category} onChange={handleChange}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Price (₹) *</label>
          <input type="number" min="0" step="0.01" name="price" placeholder="Enter product price" value={form.price} onChange={handleChange} required />
        </div>
        <div className="field">
          <label>Available Stock *</label>
          <input type="number" min="0" name="stock" placeholder="Enter available quantity" value={form.stock} onChange={handleChange} required />
        </div>
        <div className="field">
          <label>Description *</label>
          <textarea name="description" rows="4" placeholder="Describe your product" value={form.description} onChange={handleChange} required />
        </div>
        <div className="field">
          <label>Product Image URL</label>
          <input name="image" placeholder="Paste an image URL (optional)" value={form.image} onChange={handleChange} />
        </div>
        <button className="btn-gradient" type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}
