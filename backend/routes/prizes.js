const express = require("express");
const router = express.Router();
const {
  createPrize,
  getUserPrizes,
  deletePrize,
} = require("../controllers/prizes");

// Route to create a new prize
router.post("/", createPrize);

// Route to get all prize entries for a specific user
router.get("/:walletAddress", getUserPrizes);

// Route to delete a specific prize entry by its ID
router.delete("/:id", deletePrize);

module.exports = router;
