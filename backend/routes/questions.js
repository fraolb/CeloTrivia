const express = require("express");
const router = express.Router();
const {
  createTrivia,
  getUserTrivia,
  deleteTrivia,
} = require("../controllers/questions");

// Route to create a new trivia
router.post("/", createTrivia);

// Route to get all trivia entries for a specific user
router.get("/:walletAddress", getUserTrivia);

// Route to delete a specific trivia entry by its ID
router.delete("/:id", deleteTrivia);

module.exports = router;
