import { useEffect, useState } from "react";
import ListingCard from "../components/ListingCard.jsx";
import { api } from "../api.js";

export default function Wishlist() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getWishlist()
      .then((data) => setListings(data.map((l) => ({ ...l, wishlisted: true }))))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <h1>Your wishlist</h1>
      {error && <div className="error banner">{error}</div>}
      {loading ? (
        <div className="loading">Loading…</div>
      ) : listings.length === 0 ? (
        <div className="empty-state">
          Nothing saved yet — tap the heart on any listing to add it here.
        </div>
      ) : (
        <div className="listing-grid">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
