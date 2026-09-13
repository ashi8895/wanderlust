const fetch = require("node-fetch");

// Turns "location, country" into { lat, lng } using OpenStreetMap's free Nominatim API.
// Returns null if the lookup fails so listing creation never hard-fails on a bad address.
async function geocode(location, country) {
  try {
    const query = encodeURIComponent(`${location}, ${country}`);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { "User-Agent": "wanderlust-portfolio-app/1.0" }
    });
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  } catch (err) {
    console.error("Geocoding failed:", err.message);
    return null;
  }
}

module.exports = { geocode };
