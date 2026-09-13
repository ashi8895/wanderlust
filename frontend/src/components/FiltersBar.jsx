export default function FiltersBar({ filters, setFilters }) {
  const update = (key) => (e) =>
    setFilters({ ...filters, [key]: e.target.value });

  function clearFilters() {
    setFilters({ minPrice: "", maxPrice: "", guests: "", sort: "newest" });
  }

  const hasActiveFilters =
    filters.minPrice ||
    filters.maxPrice ||
    filters.guests ||
    filters.sort !== "newest";

  return (
    <div className="filters-bar">
      <input
        className="filter-input"
        type="number"
        min="0"
        placeholder="Min ₹"
        value={filters.minPrice}
        onChange={update("minPrice")}
      />
      <span className="filter-sep">–</span>
      <input
        className="filter-input"
        type="number"
        min="0"
        placeholder="Max ₹"
        value={filters.maxPrice}
        onChange={update("maxPrice")}
      />
      <input
        className="filter-input"
        type="number"
        min="1"
        placeholder="Guests"
        value={filters.guests}
        onChange={update("guests")}
      />
      <select
        className="filter-select"
        value={filters.sort}
        onChange={update("sort")}
      >
        <option value="newest">Newest</option>
        <option value="priceAsc">Price: Low to High</option>
        <option value="priceDesc">Price: High to Low</option>
        <option value="rating">Top Rated</option>
      </select>
      {hasActiveFilters && (
        <button
          type="button"
          className="clear-filters-btn"
          onClick={clearFilters}
        >
          Clear
        </button>
      )}
    </div>
  );
}
