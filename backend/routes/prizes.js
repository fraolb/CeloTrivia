const express = require("express");
const router = express.Router();
const {
  createPrize,
  getUserPrizes,
  deletePrize,
} = require("../controllers/prizes");

// Route to create a new trivia
router.post("/", createPrize);

// Route to get all trivia entries for a specific user
router.get("/:walletAddress", getUserPrizes);

// Route to delete a specific trivia entry by its ID
router.delete("/:id", deletePrize);

module.exports = router;
