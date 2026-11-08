import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import axios from "axios";
import "../styles/Cart.css";

export default function Cart() {
  const { refreshCart } = useOutletContext();
  const [cart, setCart] = useState({ items: [], totalItems: 0, subtotal: 0 });
  const [loading, setLoading] = useState(true);

  const apply = async (request) => {
    try {
      const { data } = await request;
      setCart(data);
      refreshCart();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    axios
      .get("/cart")
      .then(({ data }) => setCart(data))
      .finally(() => setLoading(false));
  }, []);

  const update = (id, action) => apply(axios.put("/cart/update", { productId: id, action }));
  const remove = (id) => apply(axios.delete(`/cart/remove/${id}`));
  const clear = () => apply(axios.delete("/cart/clear"));

  return (
    <div className="cart-page">
      <div className="cart-head">
        <div>
          <span className="eyebrow">STUDENTMART STORE</span>
          <h1>Shopping Cart 🛒</h1>
          <p>Review and manage your selected products.</p>
        </div>
        <Link to="/products" className="btn-outline">
          ← Continue Shopping
        </Link>
      </div>

      {loading ? (
        <p className="loading">Loading cart...</p>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {cart.items.length === 0 && <div className="cart-empty">Your cart is empty.</div>}

            {cart.items.map(({ product, quantity }) => (
              <div className="cart-item" key={product._id}>
                <div className="ci-left">
                  <div className="ci-img">
                    {product.image ? <img src={product.image} alt={product.name} /> : <span>🛍️</span>}
                  </div>
                  <div className="qty">
                    <button disabled={quantity <= 1} onClick={() => update(product._id, "dec")}>
                      −
                    </button>
                    <span>{quantity}</span>
                    <button className="plus" disabled={product.stock <= 0} onClick={() => update(product._id, "inc")}>
                      +
                    </button>
                  </div>
                </div>

                <div className="ci-mid">
                  <span className="pill">{product.category}</span>
                  <h3>{product.name}</h3>
                  <p className="each">₹{product.price.toFixed(2)} each</p>
                  <p className="avail">Available stock: {product.stock}</p>
                </div>

                <div className="ci-right">
                  <div className="ci-total">₹{(product.price * quantity).toFixed(2)}</div>
                  <button className="remove" onClick={() => remove(product._id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <aside className="summary">
            <h2>Order Summary</h2>
            <div className="sum-row">
              <span>Total Items</span>
              <span>{cart.totalItems}</span>
            </div>
            <div className="sum-row">
              <span>Subtotal</span>
              <span>₹{cart.subtotal.toFixed(2)}</span>
            </div>
            <div className="sum-total">
              <span>Total</span>
              <span>₹{cart.subtotal.toFixed(2)}</span>
            </div>
            <button className="clear-btn" onClick={clear} disabled={cart.items.length === 0}>
              Clear Cart
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
