require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const listingRoutes = require("./routes/listings");
const reviewRoutes = require("./routes/reviews");
const wishlistRoutes = require("./routes/wishlist");
const bookingRoutes = require("./routes/bookings");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/bookings", bookingRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

// Central error handler — catches bad Mongo ObjectIds, duplicate-key errors, etc.
app.use((err, req, res, next) => {
  if (err.name === "CastError") {
    return res.status(400).json({ error: "Invalid id" });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: "That already exists" });
  }
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server" });
});

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Wanderlust API running at http://localhost:${PORT}`);
  });
});
