import { useCallback, useEffect, useState } from "react";
import { Navigate, NavLink, Outlet, Route, Routes, useLocation } from "react-router-dom";
import axios from "axios";

import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import Logout from "./components/Logout.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Profile from "./components/Profile.jsx";
import Edit from "./components/Edit.jsx";
import ProductGrid from "./components/ProductGrid.jsx";
import ProductForm from "./components/ProductForm.jsx";
import ProductDetails from "./components/ProductDetails.jsx";
import Cart from "./components/Cart.jsx";

const isLoggedIn = () => !!localStorage.getItem("token");

function Protected() {
  return isLoggedIn() ? <Layout /> : <Navigate to="/login" replace />;
}

function PublicOnly({ children }) {
  return isLoggedIn() ? <Navigate to="/dashboard" replace /> : children;
}

function Layout() {
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();

  const refreshCart = useCallback(async () => {
    try {
      const { data } = await axios.get("/cart");
      setCartCount(data.totalItems);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
      }
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart, location.pathname]);

  const links = [
    { to: "/dashboard", icon: "▦", label: "Dashboard" },
    { to: "/profile", icon: "👤", label: "My Profile" },
    { to: "/edit-profile", icon: "✎", label: "Edit Profile" },
    { to: "/products", icon: "🛍", label: "Products" },
    { to: "/add-product", icon: "+", label: "Add Product" },
    { to: "/cart", icon: "🛒", label: `Shopping Cart (${cartCount})` },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">S</div>
          <div>
            <div className="brand-name">StudentMart</div>
            <div className="brand-sub">Your student space</div>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>
        <nav>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/products"}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              <span className="icon">{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <NavLink to="/logout" className="logout-link">
          <span>↪</span> Logout
        </NavLink>
      </aside>

      <main className="main">
        <div className="page-wrap">
          <Outlet context={{ cartCount, refreshCart }} />
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
      <Route path="/logout" element={<Logout />} />

      <Route element={<Protected />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/edit-profile" element={<Edit />} />
        <Route path="/products" element={<ProductGrid />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/add-product" element={<ProductForm />} />
        <Route path="/cart" element={<Cart />} />
      </Route>

      <Route path="*" element={<Navigate to={isLoggedIn() ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}
