const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();
router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json(await db.getBookingsForUser(req.userId));
  })
);

module.exports = router;
