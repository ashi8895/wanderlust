const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error(
      "\n❌ MONGODB_URI is not set. Add your MongoDB Atlas connection string to backend/.env\n" +
        "   Example: MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/wanderlust\n"
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
