import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { CATEGORIES } from "../components/CategoryBar.jsx";

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [imageUrls, setImageUrls] = useState([""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .getListing(id)
      .then((listing) => {
        setForm(listing);
        setImageUrls(listing.imageUrls && listing.imageUrls.length ? listing.imageUrls : [""]);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  function updateImage(i, value) {
    const next = [...imageUrls];
    next[i] = value;
    setImageUrls(next);
  }
  function addImageField() {
    if (imageUrls.length < 6) setImageUrls([...imageUrls, ""]);
  }
  function removeImageField(i) {
    setImageUrls(imageUrls.filter((_, idx) => idx !== i));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.updateListing(id, {
        title: form.title,
        description: form.description,
        price: form.price,
        location: form.location,
        country: form.country,
        category: form.category,
        guestCapacity: form.guestCapacity,
        imageUrls: imageUrls.filter((u) => u.trim())
      });
      navigate(`/listings/${id}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (!form) return <div className="page loading">Loading…</div>;

  return (
    <div className="page narrow">
      <h1>Edit listing</h1>

      <form className="listing-form" onSubmit={submit}>
        <label>Title *</label>
        <input value={form.title} onChange={update("title")} required />

        <label>Description *</label>
        <textarea rows={4} value={form.description} onChange={update("description")} required />

        <div className="row">
          <div>
            <label>Price per night (₹) *</label>
            <input type="number" min="1" value={form.price} onChange={update("price")} required />
          </div>
          <div>
            <label>Max guests</label>
            <input
              type="number"
              min="1"
              value={form.guestCapacity}
              onChange={update("guestCapacity")}
            />
          </div>
        </div>

        <label>Category</label>
        <select value={form.category} onChange={update("category")}>
          {CATEGORIES.map((c) => (
            <option key={c.name}>{c.name}</option>
          ))}
        </select>

        <div className="row">
          <div>
            <label>City / area *</label>
            <input value={form.location} onChange={update("location")} required />
          </div>
          <div>
            <label>Country *</label>
            <input value={form.country} onChange={update("country")} required />
          </div>
        </div>

        <label>Photos</label>
        {imageUrls.map((url, i) => (
          <div className="image-field-row" key={i}>
            <input
              value={url}
              onChange={(e) => updateImage(i, e.target.value)}
              placeholder="https://images.unsplash.com/…"
            />
            {imageUrls.length > 1 && (
              <button type="button" className="remove-image-btn" onClick={() => removeImageField(i)}>
                ×
              </button>
            )}
          </div>
        ))}
        {imageUrls.length < 6 && (
          <button type="button" className="btn-secondary small add-photo-btn" onClick={addImageField}>
            + Add another photo
          </button>
        )}

        {error && <div className="error">{error}</div>}

        <button className="btn-primary full" disabled={loading}>
          {loading ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
