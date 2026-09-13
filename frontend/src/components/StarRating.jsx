export default function StarRating({ value, onChange, readOnly = false }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className={`stars${readOnly ? " readonly" : ""}`}>
      {stars.map((n) => (
        <span
          key={n}
          className={n <= value ? "star filled" : "star"}
          onClick={() => !readOnly && onChange && onChange(n)}
        >
          ★
        </span>
      ))}
    </div>
  );
}
