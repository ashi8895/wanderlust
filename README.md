# Wanderlust — Airbnb-style Listings App

A full-stack property listing & booking-style app inspired by Airbnb: browse stays by category,
view a real map pin auto-generated from the address, leave star ratings and reviews, and host
your own listings. Backed by a real MongoDB database (Atlas).

## Stack
- **Frontend:** React 18 + Vite + React Router, Leaflet/react-leaflet for maps (OpenStreetMap — no API key required)
- **Backend:** Node.js + Express, JWT auth (bcryptjs + jsonwebtoken)
- **Database:** MongoDB (via Mongoose) — hosted for free on MongoDB Atlas
- **Geocoding:** OpenStreetMap's free Nominatim API — when you create a listing, the server automatically converts "City, Country" into map coordinates. No Google Maps key, no billing.

## MongoDB Atlas setup (one-time)

1. Create a free account/cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. In Atlas: **Database Access** → add a database user with a username/password (save these).
3. In Atlas: **Network Access** → add your current IP (or `0.0.0.0/0` to allow from anywhere, fine for a portfolio project).
4. In Atlas: **Database** → **Connect** → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with your actual database user credentials, and add a database name right after `.net/` (before the `?`) — e.g. `.../wanderlust?retryWrites=true...`.
6. Paste the finished string into `backend/.env` as `MONGODB_URI=...` (see below).

You don't need to create collections manually — Mongoose creates `users`, `listings`, `reviews`,
`wishlists`, and `bookings` automatically the first time each is written to.

## Run it locally

**Backend:**
```bash
cd backend
npm install
copy .env.example .env      (Windows)   /   cp .env.example .env   (Mac/Linux)
```
Now open `.env` and paste in your `MONGODB_URI` from Atlas, then:
```bash
npm start
```
If the connection string is missing or wrong, the server will print a clear error and exit
instead of failing silently. Runs on `http://localhost:4000`.

**Frontend** (separate terminal):
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173` and proxies `/api` calls to the backend.

Open `http://localhost:5173`, sign up, click **"+ Host a place"**, and add a listing —
try a real city name so the map geocoding has something to find (e.g. "Manali", "Himachal Pradesh").

## Features
- **Auth** — signup/login with hashed passwords and JWT sessions
- **Category browsing** — Trending, Rooms, Iconic Cities, Mountains, Castles, Camping, and more, Airbnb-style pill filters
- **Search** — search listings by title, city, or country
- **Auto-geocoded map** — enter a location, get a live OpenStreetMap pin on the listing page automatically (no manual lat/lng entry)
- **Multi-photo listings** — hosts can add up to 6 photos per listing; the detail page shows them in a swipeable carousel with dot indicators
- **Wishlist** — heart icon on every card and the detail page to save/unsave listings; a dedicated Wishlist page lists everything saved
- **Real date-range booking** — check-in/check-out date pickers, guest count (capped at the listing's max), live nightly price × nights breakdown, and server-side conflict checking so double-bookings on the same dates are rejected
- **My Trips** — logged-in users can see every booking they've made, with dates, guest count, and total price
- **Star ratings & reviews** — logged-in users can rate (1–5 stars) and review any listing; average rating shown on the detail page
- **Host tools** — create, edit, and delete your own listings; only the owner sees edit/delete controls
- **Ownership enforcement** — API rejects edits/deletes from anyone other than the listing's owner

## Project structure
```
wanderlust/
├── backend/
│   ├── server.js
│   ├── db.js                     # Mongoose-backed data access (users, listings, reviews, wishlist, bookings)
│   ├── config/db.js              # MongoDB Atlas connection
│   ├── models/                   # Mongoose schemas: User, Listing, Review, Wishlist, Booking
│   ├── middleware/auth.js        # JWT verification (required + optional variants)
│   ├── utils/geocode.js          # OpenStreetMap Nominatim geocoding
│   ├── utils/asyncHandler.js     # wraps async routes so errors reach the error middleware
│   ├── utils/schemaHelpers.js    # shared _id → id JSON transform for every model
│   └── routes/
│       ├── auth.js
│       ├── listings.js           # CRUD + nested review/booking creation
│       ├── reviews.js            # review deletion
│       ├── wishlist.js           # toggle + list saved listings
│       └── bookings.js           # "My Trips" — a user's own bookings
└── frontend/
    └── src/
        ├── api.js
        ├── AuthContext.jsx
        ├── App.jsx                       # routing
        ├── components/
        │   ├── Navbar.jsx
        │   ├── CategoryBar.jsx
        │   ├── ListingCard.jsx           # wishlist heart included
        │   ├── ImageCarousel.jsx
        │   └── StarRating.jsx
        └── pages/
            ├── Home.jsx                  # category filter + grid
            ├── ListingDetail.jsx         # carousel, map, booking form, reviews
            ├── CreateListing.jsx         # multi-photo fields, guest capacity
            ├── EditListing.jsx
            ├── Wishlist.jsx
            ├── Trips.jsx                 # booking history
            ├── Login.jsx
            └── Signup.jsx
```

## Notes on the MongoDB implementation
- Every model shares a `toJSON` transform (`utils/schemaHelpers.js`) that turns Mongo's `_id`
  into a plain `id` string and strips `__v`, so the frontend never deals with ObjectId quirks.
- `checkIn`/`checkOut` are stored as `"YYYY-MM-DD"` strings (straight from the date input),
  so simple string comparison is enough for overlap detection and sorting — no timezone edge cases.
- A global Express error handler in `server.js` catches invalid ObjectId lookups (`CastError`)
  and duplicate-key errors, returning clean 400/409 responses instead of a raw stack trace.
- Wishlist is a proper many-to-many join collection (`userId` + `listingId`, unique compound index) rather than an array field, so it scales cleanly.

## Resume talking points
- Built a full-stack marketplace-style app on MongoDB/Mongoose with JWT auth, ownership-scoped CRUD, and nested resources (reviews and bookings under listings)
- Modeled a many-to-many relationship (wishlist) with a join collection and a unique compound index
- Implemented a real booking system with date-range validation and server-side overlap detection to prevent double-booking
- Integrated a free third-party geocoding API server-side so users never manually enter coordinates
- Rendered live interactive maps with react-leaflet/OpenStreetMap — no paid API keys
- Added centralized Express error handling for clean API error responses
