const CATEGORIES = [
  { name: "Trending" },
  { name: "Rooms" },
  { name: "Iconic Cities" },
  { name: "Mountains" },
  { name: "Castles" },
  { name: "Amazing Pools" },
  { name: "Camping" },
  { name: "Farms" },
  { name: "Arctic" },
  { name: "Boats" },
];

export default function CategoryBar({ active, onSelect }) {
  return (
    <div className="category-bar">
      {CATEGORIES.map((c) => (
        <button
          key={c.name}
          className={`category-pill${active === c.name ? " active" : ""}`}
          onClick={() => onSelect(active === c.name ? null : c.name)}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}

export { CATEGORIES };
