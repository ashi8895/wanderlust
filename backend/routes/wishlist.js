const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();
router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json(await db.getWishlistForUser(req.userId));
  })
);

router.post(
  "/:listingId",
  asyncHandler(async (req, res) => {
    const listingId = req.params.listingId;
    if (!(await db.getListingById(listingId))) {
      return res.status(404).json({ error: "Listing not found" });
    }
    const result = await db.toggleWishlist(req.userId, listingId);
    res.json(result);
  })
);

module.exports = router;
