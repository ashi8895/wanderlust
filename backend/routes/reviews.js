const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await db.deleteReview(req.userId, req.params.id);
    if (result.error === "not_found") return res.status(404).json({ error: "Review not found" });
    if (result.error === "forbidden") return res.status(403).json({ error: "Not your review" });
    res.status(204).end();
  })
);

module.exports = router;
