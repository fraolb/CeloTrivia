const Questions = require("../models/questions");

// Create a new trivia entry
exports.createTrivia = async (req, res) => {
  const { walletAddress, triviaName, questions } = req.body;

  try {
    const newTrivia = await Questions.create({
      walletAddress,
      triviaName,
      questions,
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

// Get all trivia entries for a specific user
exports.getUserTrivia = async (req, res) => {
  const { walletAddress } = req.params;

  try {
    const userTrivia = await Questions.find({ walletAddress });

    res.status(200).json({
      success: true,
      data: userTrivia,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete a specific trivia entry by its ID
exports.deleteTrivia = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTrivia = await Questions.findByIdAndDelete(id);

    if (!deletedTrivia) {
      return res.status(404).json({
        success: false,
        error: "No trivia found with this ID",
      });
    }

    res.status(200).json({
      success: true,
      data: deletedTrivia,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
