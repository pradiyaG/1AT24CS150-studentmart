import { useEffect, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import axios from "axios";
import "../styles/ProductDetails.css";

export default function ProductDetails() {
  const { id } = useParams();
  const { refreshCart } = useOutletContext();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  const load = () =>
    axios
      .get(`/products/${id}`)
      .then(({ data }) => setProduct(data))
      .catch(() => setError("Product not found"));

  useEffect(() => {
    load();
  }, [id]);

  const addToCart = async () => {
    try {
      await axios.post("/cart/add", { productId: id });
      setAdded(true);
      await Promise.all([load(), refreshCart()]);
      setTimeout(() => setAdded(false), 1800);
    } catch (err) {
      alert(err.response?.data?.message || "Could not add to cart");
    }
  };

  if (error) return <p className="loading">{error}</p>;
  if (!product) return <p className="loading">Loading product...</p>;

  return (
    <div className="pd">
      <Link to="/products" className="pd-back">
        ← Back to Products
      </Link>

      <div className="pd-card">
        <div className="pd-img">
          {product.image ? <img src={product.image} alt={product.name} /> : <span>🛍️</span>}
        </div>
        <div className="pd-info">
          <span className="pill">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="pd-desc">{product.description}</p>
          <div className="pd-price">₹{product.price.toFixed(2)}</div>
          <span className={`stock-pill${product.stock === 0 ? " out" : ""}`}>
            {product.stock === 0 ? "Out of stock" : `${product.stock} available`}
          </span>
          <button className="btn-primary" disabled={product.stock === 0} onClick={addToCart}>
            {added ? "✓ Added to Cart" : "🛒 Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
