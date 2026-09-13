import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { FALLBACK_IMAGE } from "../components/ListingCard.jsx";

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function Trips() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getMyTrips()
      .then(setBookings)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="page narrow">
      <h1>My trips</h1>
      {error && <div className="error banner">{error}</div>}
      {loading ? (
        <div className="loading">Loading…</div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          No trips booked yet — go find somewhere to stay!
        </div>
      ) : (
        <div className="trip-list">
          {bookings.map((b) => (
            <Link
              key={b.id}
              to={b.listing ? `/listings/${b.listing.id}` : "#"}
              className="trip-card"
            >
              <div
                className="trip-image"
                style={{
                  backgroundImage: `url(${(b.listing?.imageUrls && b.listing.imageUrls[0]) || FALLBACK_IMAGE})`
                }}
              />
              <div className="trip-info">
                <strong>{b.listing ? b.listing.title : "Listing removed"}</strong>
                {b.listing && (
                  <div className="trip-location">
                    {b.listing.location}, {b.listing.country}
                  </div>
                )}
                <div className="trip-dates">
                  {formatDate(b.checkIn)} → {formatDate(b.checkOut)}
                  {b.checkOut < today && <span className="trip-past"> · Past trip</span>}
                </div>
                <div className="trip-meta">
                  {b.guests} guest{b.guests !== 1 ? "s" : ""} · ₹{b.totalPrice.toLocaleString("en-IN")} total
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
