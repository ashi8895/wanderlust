import { useState } from "react";
import { FALLBACK_IMAGE } from "./ListingCard.jsx";

export default function ImageCarousel({ images, alt }) {
  const list = images && images.length > 0 ? images : [FALLBACK_IMAGE];
  const [index, setIndex] = useState(0);

  function prev(e) {
    e.stopPropagation();
    setIndex((i) => (i === 0 ? list.length - 1 : i - 1));
  }
  function next(e) {
    e.stopPropagation();
    setIndex((i) => (i === list.length - 1 ? 0 : i + 1));
  }

  return (
    <div className="carousel">
      <img className="carousel-image" src={list[index]} alt={alt} />
      {list.length > 1 && (
        <>
          <button className="carousel-arrow left" onClick={prev} aria-label="Previous photo">
            ‹
          </button>
          <button className="carousel-arrow right" onClick={next} aria-label="Next photo">
            ›
          </button>
          <div className="carousel-dots">
            {list.map((_, i) => (
              <span key={i} className={`dot${i === index ? " active" : ""}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
