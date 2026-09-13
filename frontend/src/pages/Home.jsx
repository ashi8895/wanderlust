import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CategoryBar from "../components/CategoryBar.jsx";
import FiltersBar from "../components/FiltersBar.jsx";
import ListingCard from "../components/ListingCard.jsx";
import { api } from "../api.js";

export default function Home() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const [category, setCategory] = useState(null);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    guests: "",
    sort: "newest",
  });
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const handle = setTimeout(() => {
      setLoading(true);
      const params = { ...filters };
      if (category) params.category = category;
      if (q) params.q = q;
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);

      api
        .getListings(params)
        .then(setListings)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(handle);
  }, [category, q, filters]);

  return (
    <div className="page">
      <CategoryBar active={category} onSelect={setCategory} />
      <FiltersBar filters={filters} setFilters={setFilters} />

      {q && (
        <div className="search-note">
          Showing results for <strong>“{q}”</strong>
        </div>
      )}

      {error && <div className="error banner">{error}</div>}

      {loading ? (
        <div className="loading">Loading stays…</div>
      ) : listings.length === 0 ? (
        <div className="empty-state">
          No listings found. Try different filters or a search.
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
