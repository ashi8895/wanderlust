const BASE = "/api";

function getToken() {
  return localStorage.getItem("wl-token");
}

async function request(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),

  getListings: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/listings${qs ? `?${qs}` : ""}`);
  },
  getListing: (id) => request(`/listings/${id}`),
  createListing: (payload) => request("/listings", { method: "POST", body: payload }),
  updateListing: (id, payload) => request(`/listings/${id}`, { method: "PUT", body: payload }),
  deleteListing: (id) => request(`/listings/${id}`, { method: "DELETE" }),

  createReview: (listingId, payload) =>
    request(`/listings/${listingId}/reviews`, { method: "POST", body: payload }),
  deleteReview: (id) => request(`/reviews/${id}`, { method: "DELETE" }),

  getWishlist: () => request("/wishlist"),
  toggleWishlist: (listingId) => request(`/wishlist/${listingId}`, { method: "POST" }),

  createBooking: (listingId, payload) =>
    request(`/listings/${listingId}/bookings`, { method: "POST", body: payload }),
  getMyTrips: () => request("/bookings")
};

export { getToken };
