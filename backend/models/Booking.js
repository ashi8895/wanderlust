const mongoose = require("mongoose");
const { applyIdTransform } = require("../utils/schemaHelpers");

const bookingSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  // Stored as "YYYY-MM-DD" strings straight from the <input type="date">, so plain
  // string comparison (<, >) is enough for overlap checks and sorting.
  checkIn: { type: String, required: true },
  checkOut: { type: String, required: true },
  guests: { type: Number, default: 1 },
  totalPrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

applyIdTransform(bookingSchema);

module.exports = mongoose.model("Booking", bookingSchema);
