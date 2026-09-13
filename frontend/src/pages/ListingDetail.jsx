import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import StarRating from "../components/StarRating.jsx";
import ImageCarousel from "../components/ImageCarousel.jsx";

function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const ms = new Date(checkOut) - new Date(checkIn);
  return ms > 0 ? Math.round(ms / (1000 * 60 * 60 * 24)) : 0;
}

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [error, setError] = useState("");
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);

  const [wishlisted, setWishlisted] = useState(false);
  const [booking, setBooking] = useState({ checkIn: "", checkOut: "", guests: 1 });
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  function load() {
    api
      .getListing(id)
      .then((data) => {
        setListing(data);
        setWishlisted(!!data.wishlisted);
      })
      .catch((e) => setError(e.message));
  }

  useEffect(load, [id]);

  async function toggleHeart() {
    if (!user) return navigate("/login");
    setWishlisted((w) => !w);
    try {
      const result = await api.toggleWishlist(listing.id);
      setWishlisted(result.wishlisted);
    } catch {
      setWishlisted((w) => !w);
    }
  }

  async function handleDeleteListing() {
    if (!confirm("Delete this listing? This can't be undone.")) return;
    try {
      await api.deleteListing(id);
      navigate("/");
    } catch (e) {
      setError(e.message);
    }
  }

  async function submitReview(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createReview(id, reviewForm);
      setReviewForm({ rating: 5, comment: "" });
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteReview(reviewId) {
    try {
      await api.deleteReview(reviewId);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function submitBooking(e) {
    e.preventDefault();
    setBookingError("");
    setBookingSuccess("");
    if (!user) return navigate("/login");
    setBookingLoading(true);
    try {
      await api.createBooking(id, booking);
      setBookingSuccess("Booked! Check My Trips to see your reservation.");
      setBooking({ checkIn: "", checkOut: "", guests: 1 });
      load();
    } catch (e) {
      setBookingError(e.message);
    } finally {
      setBookingLoading(false);
    }
  }

  if (error) return <div className="page error banner">{error}</div>;
  if (!listing) return <div className="page loading">Loading…</div>;

  const isOwner = user && user.id === listing.ownerId;
  const nights = nightsBetween(booking.checkIn, booking.checkOut);
  const total = nights * listing.price;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="page detail-page">
      <div className="detail-header">
        <h1>{listing.title}</h1>
        <div className="detail-header-right">
          {listing.avgRating && (
            <div className="avg-rating">
              ★ {listing.avgRating.toFixed(1)} · {listing.reviews.length} review
              {listing.reviews.length !== 1 ? "s" : ""}
            </div>
          )}
          <button className={`heart-btn large${wishlisted ? " active" : ""}`} onClick={toggleHeart}>
            {wishlisted ? "♥ Saved" : "♡ Save"}
          </button>
        </div>
      </div>

      <ImageCarousel images={listing.imageUrls} alt={listing.title} />

      <div className="detail-body">
        <div className="detail-main">
          <p className="detail-location">
            📍 {listing.location}, {listing.country} · Fits up to {listing.guestCapacity || 2} guests
          </p>
          <p className="detail-description">{listing.description}</p>

          {isOwner && (
            <div className="owner-actions">
              <Link to={`/listings/${listing.id}/edit`} className="btn-secondary">
                Edit listing
              </Link>
              <button className="btn-danger" onClick={handleDeleteListing}>
                Delete listing
              </button>
            </div>
          )}

          {listing.coordinates && (
            <div className="map-wrap">
              <MapContainer
                center={[listing.coordinates.lat, listing.coordinates.lng]}
                zoom={11}
                style={{ height: "280px", borderRadius: "10px" }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[listing.coordinates.lat, listing.coordinates.lng]}>
                  <Popup>{listing.title}</Popup>
                </Marker>
              </MapContainer>
            </div>
          )}

          <section className="reviews-section">
            <h2>Reviews</h2>

            {user && (
              <form className="review-form" onSubmit={submitReview}>
                <label>Your rating</label>
                <StarRating
                  value={reviewForm.rating}
                  onChange={(v) => setReviewForm({ ...reviewForm, rating: v })}
                />
                <textarea
                  placeholder="Share your experience…"
                  rows={3}
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                />
                <button className="btn-primary" disabled={submitting}>
                  {submitting ? "Posting…" : "Post review"}
                </button>
              </form>
            )}

            {listing.reviews.length === 0 ? (
              <p className="empty-state">No reviews yet — be the first!</p>
            ) : (
              <div className="review-list">
                {listing.reviews.map((r) => (
                  <div key={r.id} className="review-card">
                    <div className="review-top">
                      <strong>{r.userName}</strong>
                      <StarRating value={r.rating} readOnly />
                      {user && user.id === r.userId && (
                        <button
                          className="review-delete"
                          onClick={() => handleDeleteReview(r.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    {r.comment && <p>{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="detail-sidebar">
          <form className="price-card" onSubmit={submitBooking}>
            <div className="price-amount">
              ₹{listing.price.toLocaleString("en-IN")} <span>/ night</span>
            </div>

            <div className="booking-dates">
              <div>
                <label>Check-in</label>
                <input
                  type="date"
                  min={today}
                  value={booking.checkIn}
                  onChange={(e) => setBooking({ ...booking, checkIn: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Check-out</label>
                <input
                  type="date"
                  min={booking.checkIn || today}
                  value={booking.checkOut}
                  onChange={(e) => setBooking({ ...booking, checkOut: e.target.value })}
                  required
                />
              </div>
            </div>

            <label>Guests</label>
            <input
              type="number"
              min="1"
              max={listing.guestCapacity || 2}
              value={booking.guests}
              onChange={(e) => setBooking({ ...booking, guests: e.target.value })}
            />

            {nights > 0 && (
              <div className="price-breakdown">
                <div>
                  ₹{listing.price.toLocaleString("en-IN")} × {nights} night{nights !== 1 ? "s" : ""}
                </div>
                <div className="price-total">₹{total.toLocaleString("en-IN")}</div>
              </div>
            )}

            {bookingError && <div className="error">{bookingError}</div>}
            {bookingSuccess && <div className="success">{bookingSuccess}</div>}

            <button className="btn-primary full" disabled={bookingLoading}>
              {bookingLoading ? "Booking…" : "Reserve"}
            </button>
            <p className="price-note">You won't be charged yet — this is a portfolio demo.</p>
          </form>
        </div>
      </div>
    </div>
  );
}
