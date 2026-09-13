const User = require("./models/User");
const Listing = require("./models/Listing");
const Review = require("./models/Review");
const Wishlist = require("./models/Wishlist");
const Booking = require("./models/Booking");

// --- Users ---
async function findUserByEmail(email) {
  return User.findOne({ email: email.toLowerCase() });
}
async function findUserById(id) {
  return User.findById(id);
}
async function createUser({ name, email, passwordHash }) {
  const user = await User.create({ name, email, passwordHash });
  return user.toJSON();
}

// --- Listings ---
async function getListings({
  category,
  q,
  minPrice,
  maxPrice,
  guests,
  sort,
} = {}) {
  const match = {};
  if (category) match.category = category;
  if (q) {
    const regex = new RegExp(q, "i");
    match.$or = [{ title: regex }, { location: regex }, { country: regex }];
  }
  if (minPrice)
    match.price = { ...(match.price || {}), $gte: Number(minPrice) };
  if (maxPrice)
    match.price = { ...(match.price || {}), $lte: Number(maxPrice) };
  if (guests) match.guestCapacity = { $gte: Number(guests) };

  let sortStage = { createdAt: -1 };
  if (sort === "priceAsc") sortStage = { price: 1 };
  else if (sort === "priceDesc") sortStage = { price: -1 };
  else if (sort === "rating") sortStage = { avgRating: -1, createdAt: -1 };

  // Uses an aggregation pipeline (not a plain find) because sorting by rating needs the
  // average pulled in from the reviews collection — a plain Listing.find() can't do that join.
  const listings = await Listing.aggregate([
    { $match: match },
    {
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "listingId",
        as: "reviews",
      },
    },
    {
      $addFields: {
        avgRating: {
          $cond: [
            { $gt: [{ $size: "$reviews" }, 0] },
            { $avg: "$reviews.rating" },
            null,
          ],
        },
      },
    },
    { $project: { reviews: 0 } },
    { $sort: sortStage },
  ]);

  return listings.map((l) => ({
    id: l._id.toString(),
    ownerId: l.ownerId.toString(),
    title: l.title,
    description: l.description,
    price: l.price,
    location: l.location,
    country: l.country,
    category: l.category,
    imageUrls: l.imageUrls,
    guestCapacity: l.guestCapacity,
    coordinates: l.coordinates,
    createdAt: l.createdAt,
    avgRating: l.avgRating || null,
  }));
}

async function getListingById(id) {
  const listing = await Listing.findById(id);
  return listing ? listing.toJSON() : null;
}

async function createListing(ownerId, fields) {
  const listing = await Listing.create({
    ownerId,
    title: fields.title,
    description: fields.description,
    price: Number(fields.price),
    location: fields.location,
    country: fields.country,
    category: fields.category || "Trending",
    imageUrls: Array.isArray(fields.imageUrls)
      ? fields.imageUrls.filter(Boolean)
      : [],
    guestCapacity: Number(fields.guestCapacity) || 2,
    coordinates: fields.coordinates || null,
  });
  return listing.toJSON();
}

async function updateListing(ownerId, id, fields) {
  const listing = await Listing.findById(id);
  if (!listing) return { error: "not_found" };
  if (listing.ownerId.toString() !== ownerId.toString())
    return { error: "forbidden" };
  if (fields.imageUrls) fields.imageUrls = fields.imageUrls.filter(Boolean);
  Object.assign(listing, fields);
  await listing.save();
  return { listing: listing.toJSON() };
}

async function deleteListing(ownerId, id) {
  const listing = await Listing.findById(id);
  if (!listing) return { error: "not_found" };
  if (listing.ownerId.toString() !== ownerId.toString())
    return { error: "forbidden" };
  await listing.deleteOne();
  await Review.deleteMany({ listingId: id });
  await Wishlist.deleteMany({ listingId: id });
  await Booking.deleteMany({ listingId: id });
  return { ok: true };
}

// --- Reviews ---
async function getReviewsForListing(listingId) {
  const reviews = await Review.find({ listingId }).sort({ createdAt: -1 });
  return reviews.map((r) => r.toJSON());
}

async function createReview(listingId, user, { rating, comment }) {
  const review = await Review.create({
    listingId,
    userId: user.id || user._id,
    userName: user.name,
    rating: Number(rating),
    comment: comment || "",
  });
  return review.toJSON();
}

async function deleteReview(userId, reviewId) {
  const review = await Review.findById(reviewId);
  if (!review) return { error: "not_found" };
  if (review.userId.toString() !== userId.toString())
    return { error: "forbidden" };
  await review.deleteOne();
  return { ok: true };
}

// --- Wishlist ---
async function getWishlistForUser(userId) {
  const entries = await Wishlist.find({ userId }).populate("listingId");
  return entries.filter((e) => e.listingId).map((e) => e.listingId.toJSON());
}

async function isWishlisted(userId, listingId) {
  const entry = await Wishlist.findOne({ userId, listingId });
  return !!entry;
}

async function toggleWishlist(userId, listingId) {
  const existing = await Wishlist.findOne({ userId, listingId });
  if (existing) {
    await existing.deleteOne();
    return { wishlisted: false };
  }
  await Wishlist.create({ userId, listingId });
  return { wishlisted: true };
}

// --- Bookings ---
async function getBookingsForListing(listingId) {
  const bookings = await Booking.find({ listingId });
  return bookings.map((b) => b.toJSON());
}

async function getBookingsForUser(userId) {
  const bookings = await Booking.find({ userId })
    .populate("listingId")
    .sort({ checkIn: 1 });
  return bookings.map((b) => ({
    id: b.id,
    checkIn: b.checkIn,
    checkOut: b.checkOut,
    guests: b.guests,
    totalPrice: b.totalPrice,
    createdAt: b.createdAt,
    listing: b.listingId ? b.listingId.toJSON() : null,
  }));
}

function datesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

async function hasBookingConflict(listingId, checkIn, checkOut) {
  const existing = await getBookingsForListing(listingId);
  return existing.some((b) =>
    datesOverlap(checkIn, checkOut, b.checkIn, b.checkOut),
  );
}

async function createBooking(
  userId,
  { listingId, checkIn, checkOut, guests, totalPrice },
) {
  const booking = await Booking.create({
    listingId,
    userId,
    checkIn,
    checkOut,
    guests: Number(guests),
    totalPrice,
  });
  return booking.toJSON();
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getReviewsForListing,
  createReview,
  deleteReview,
  getWishlistForUser,
  isWishlisted,
  toggleWishlist,
  getBookingsForListing,
  getBookingsForUser,
  hasBookingConflict,
  createBooking,
};
