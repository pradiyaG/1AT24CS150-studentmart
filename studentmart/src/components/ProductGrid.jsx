import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import "../styles/ProductGrid.css";

export const CATEGORIES = ["Electronics", "Books", "Stationery", "Clothing", "Accessories", "Other"];

export default function ProductGrid() {
  const navigate = useNavigate();
  const { cartCount, refreshCart } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");
  const [error, setError] = useState("");

  const load = () =>
    axios
      .get("/products")
      .then(({ data }) => setProducts(data))
      .catch(() => setError("Could not load products"));

  useEffect(() => {
    load();
  }, []);

  const addToCart = async (id) => {
    try {
      await axios.post("/cart/add", { productId: id });
      await Promise.all([load(), refreshCart()]);
    } catch (err) {
      alert(err.response?.data?.message || "Could not add to cart");
    }
  };

  const visible = useMemo(() => {
    let list = products.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) && (!category || p.category === category)
    );
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, search, category, sort]);

  return (
    <div className="pg">
      <div className="pg-head">
        <div>
          <span className="eyebrow">STUDENTMART STORE</span>
          <h1>Discover Products</h1>
          <p>Find and explore products available in StudentMart.</p>
        </div>
        <div className="pg-head-actions">
          <Link to="/add-product" className="btn-solid">
            + Add Product
          </Link>
          <Link to="/cart" className="btn-outline">
            🛒 Shopping Cart ({cartCount})
          </Link>
        </div>
      </div>

      <div className="pg-filters">
        <input
          placeholder="Search products by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Sort by Price</option>
          <option value="low">Price: Low to High</option>
          <option value="high">Price: High to Low</option>
        </select>
      </div>

      {error && <div className="error-text">{error}</div>}

      <div className="pg-grid">
        {visible.map((p) => (
          <div className="pcard" key={p._id}>
            <div className="pcard-img">
              {p.image ? <img src={p.image} alt={p.name} /> : <span className="pcard-ph">🛍️</span>}
            </div>
            <div className="pcard-body">
              <span className="pill">{p.category}</span>
              <h3>{p.name}</h3>
              <p className="pcard-desc">{p.description}</p>
              <div className="pcard-price">₹{p.price.toFixed(2)}</div>
              <span className={`stock-pill${p.stock === 0 ? " out" : ""}`}>
                {p.stock === 0 ? "Out of stock" : `${p.stock} available`}
              </span>
              <button className="btn-soft" onClick={() => navigate(`/products/${p._id}`)}>
                View Details
              </button>
              <button className="btn-primary" disabled={p.stock === 0} onClick={() => addToCart(p._id)}>
                🛒 Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {!error && visible.length === 0 && <p className="loading">No products found.</p>}
    </div>
  );
}
