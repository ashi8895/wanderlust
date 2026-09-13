const express = require("express");
const db = require("../db");
const { requireAuth, optionalAuth } = require("../middleware/auth");
const { geocode } = require("../utils/geocode");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get(
  "/",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { category, q, minPrice, maxPrice, guests, sort } = req.query;
    const listings = await db.getListings({
      category,
      q,
      minPrice,
      maxPrice,
      guests,
      sort,
    });
    if (!req.userId) return res.json(listings);
    const wishlist = new Set(
      (await db.getWishlistForUser(req.userId)).map((l) => l.id),
    );
    res.json(listings.map((l) => ({ ...l, wishlisted: wishlist.has(l.id) })));
  }),
);

router.get(
  "/:id",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const listing = await db.getListingById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    const reviews = await db.getReviewsForListing(listing.id);
    const avgRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;
    const bookedRanges = (await db.getBookingsForListing(listing.id)).map(
      (b) => ({
        checkIn: b.checkIn,
        checkOut: b.checkOut,
      }),
    );
    const wishlisted = req.userId
      ? await db.isWishlisted(req.userId, listing.id)
      : false;
    res.json({ ...listing, reviews, avgRating, bookedRanges, wishlisted });
  }),
);

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const {
      title,
      description,
      price,
      location,
      country,
      category,
      imageUrls,
      guestCapacity,
    } = req.body;
    if (!title || !description || !price || !location || !country) {
      return res.status(400).json({
        error: "title, description, price, location, and country are required",
      });
    }

    const coordinates = await geocode(location, country);

    const listing = await db.createListing(req.userId, {
      title,
      description,
      price,
      location,
      country,
      category,
      imageUrls,
      guestCapacity,
      coordinates,
    });
    res.status(201).json(listing);
  }),
);

router.put(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const fields = {};
    const allowed = [
      "title",
      "description",
      "price",
      "location",
      "country",
      "category",
      "imageUrls",
      "guestCapacity",
    ];
    for (const key of allowed) {
      if (req.body[key] !== undefined) fields[key] = req.body[key];
    }
    if (fields.price !== undefined) fields.price = Number(fields.price);

    if (fields.location || fields.country) {
      const existing = await db.getListingById(id);
      if (existing) {
        const coords = await geocode(
          fields.location || existing.location,
          fields.country || existing.country,
        );
        if (coords) fields.coordinates = coords;
      }
    }

    const result = await db.updateListing(req.userId, id, fields);
    if (result.error === "not_found")
      return res.status(404).json({ error: "Listing not found" });
    if (result.error === "forbidden")
      return res.status(403).json({ error: "Not your listing" });
    res.json(result.listing);
  }),
);

router.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await db.deleteListing(req.userId, req.params.id);
    if (result.error === "not_found")
      return res.status(404).json({ error: "Listing not found" });
    if (result.error === "forbidden")
      return res.status(403).json({ error: "Not your listing" });
    res.status(204).end();
  }),
);

router.post(
  "/:id/reviews",
  requireAuth,
  asyncHandler(async (req, res) => {
    const listingId = req.params.id;
    const listing = await db.getListingById(listingId);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "rating must be between 1 and 5" });
    }
    const user = await db.findUserById(req.userId);
    const review = await db.createReview(listingId, user, {
      rating,
      comment: comment || "",
    });
    res.status(201).json(review);
  }),
);

router.post(
  "/:id/bookings",
  requireAuth,
  asyncHandler(async (req, res) => {
    const listingId = req.params.id;
    const listing = await db.getListingById(listingId);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    const { checkIn, checkOut, guests } = req.body;
    if (!checkIn || !checkOut) {
      return res
        .status(400)
        .json({ error: "checkIn and checkOut are required" });
    }
    if (checkOut <= checkIn) {
      return res.status(400).json({ error: "checkOut must be after checkIn" });
    }
    const guestCount = Number(guests) || 1;
    if (guestCount > (listing.guestCapacity || 2)) {
      return res.status(400).json({
        error: `This place fits up to ${listing.guestCapacity || 2} guests`,
      });
    }
    if (await db.hasBookingConflict(listingId, checkIn, checkOut)) {
      return res.status(409).json({ error: "Those dates are already booked" });
    }

    const nights = Math.round(
      (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24),
    );
    const totalPrice = nights * listing.price;

    const booking = await db.createBooking(req.userId, {
      listingId,
      checkIn,
      checkOut,
      guests: guestCount,
      totalPrice,
    });
    res.status(201).json(booking);
  }),
);

module.exports = router;
