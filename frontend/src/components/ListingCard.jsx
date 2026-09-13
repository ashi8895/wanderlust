import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../AuthContext.jsx";
import { api } from "../api.js";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&h=450&fit=crop";

export default function ListingCard({ listing }) {
  const { user } = useAuth();
  const [wishlisted, setWishlisted] = useState(!!listing.wishlisted);
  const [busy, setBusy] = useState(false);
  const cover = (listing.imageUrls && listing.imageUrls[0]) || FALLBACK_IMAGE;

  async function toggleHeart(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!user || busy) return;
    setBusy(true);
    setWishlisted((w) => !w);
    try {
      const result = await api.toggleWishlist(listing.id);
      setWishlisted(result.wishlisted);
    } catch {
      setWishlisted((w) => !w);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Link to={`/listings/${listing.id}`} className="listing-card">
      <div
        className="listing-image"
        style={{ backgroundImage: `url(${cover})` }}
      >
        {user && (
          <button
            className={`heart-btn${wishlisted ? " active" : ""}`}
            onClick={toggleHeart}
            aria-label="Toggle wishlist"
          >
            {wishlisted ? "♥" : "♡"}
          </button>
        )}
      </div>
      <div className="listing-info">
        <div className="listing-title-row">
          <strong>{listing.title}</strong>
          {listing.avgRating && (
            <span className="card-rating">
              ★ {listing.avgRating.toFixed(1)}
            </span>
          )}
        </div>
        <div className="listing-location">
          {listing.location}, {listing.country}
        </div>
        <div className="listing-price">
          ₹{listing.price?.toLocaleString("en-IN")} / night
        </div>
      </div>
    </Link>
  );
}

export { FALLBACK_IMAGE };
