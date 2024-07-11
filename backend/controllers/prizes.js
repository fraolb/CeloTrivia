const Prizes = require("../models/prizes");

// Create a new prize
exports.createPrize = async (req, res) => {
  const { walletAddress, owner, amount, code } = req.body;

  try {
    const newTrivia = await Prizes.create({
      walletAddress,
      owner,
      amount,
      code,
    });

    res.status(201).json({
      success: true,
      data: newTrivia,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get all prizes for a specific user
exports.getUserPrizes = async (req, res) => {
  const { walletAddress } = req.params;

  try {
    const userPrize = await Prizes.find({ walletAddress });

    res.status(200).json({
      success: true,
      data: userPrize,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete a specific prize by its ID
exports.deletePrize = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedPrize = await Prizes.findByIdAndDelete(id);

    if (!deletedPrize) {
      return res.status(404).json({
        success: false,
        error: "No Prize found with this ID",
      });
    }

    res.status(200).json({
      success: true,
      data: deletedPrize,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
