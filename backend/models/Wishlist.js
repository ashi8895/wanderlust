const mongoose = require("mongoose");
const { applyIdTransform } = require("../utils/schemaHelpers");

const wishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
  createdAt: { type: Date, default: Date.now }
});

wishlistSchema.index({ userId: 1, listingId: 1 }, { unique: true });
applyIdTransform(wishlistSchema);

module.exports = mongoose.model("Wishlist", wishlistSchema);
