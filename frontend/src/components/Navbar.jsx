import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  function submitSearch(e) {
    e.preventDefault();
    navigate(q ? `/?q=${encodeURIComponent(q)}` : "/");
  }

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        Wanderlust
      </Link>

      <form className="search-bar" onSubmit={submitSearch}>
        <input
          placeholder="Search destinations…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button type="submit"></button>
      </form>

      <div className="nav-right">
        {user ? (
          <>
            <Link to="/wishlist" className="nav-icon-link" title="Wishlist">
              ♡
            </Link>
            <Link to="/trips" className="nav-icon-link" title="My trips">
            Trips
            </Link>
            <Link to="/new" className="btn-primary small">
              + Host a place
            </Link>
            <span className="nav-user">Hi, {user.name}</span>
            <button className="btn-secondary small" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-secondary small">
              Log in
            </Link>
            <Link to="/signup" className="btn-primary small">
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
