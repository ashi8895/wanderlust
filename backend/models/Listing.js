const mongoose = require("mongoose");
const { applyIdTransform } = require("../utils/schemaHelpers");

const listingSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  country: { type: String, required: true },
  category: { type: String, default: "Trending" },
  imageUrls: { type: [String], default: [] },
  guestCapacity: { type: Number, default: 2 },
  // { lat, lng } or null when geocoding didn't find a match — Mixed keeps both cases simple
  coordinates: { type: mongoose.Schema.Types.Mixed, default: null },
  createdAt: { type: Date, default: Date.now }
});

applyIdTransform(listingSchema);

module.exports = mongoose.model("Listing", listingSchema);
