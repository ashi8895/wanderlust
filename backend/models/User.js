const mongoose = require("mongoose");
const { applyIdTransform } = require("../utils/schemaHelpers");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true }
});

applyIdTransform(userSchema);

module.exports = mongoose.model("User", userSchema);
