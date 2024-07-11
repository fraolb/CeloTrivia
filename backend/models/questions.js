const mongoose = require("mongoose");

const singleQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, "Please provide the question text!"],
  },
  options: {
    type: [String],
    required: [true, "Please provide the options for the question!"],
    validate: {
      validator: function (v) {
        return v.length > 0;
      },
      message: "There must be at least one option!",
    },
  },
  answer: {
    type: String,
    required: [true, "Please provide the answer for the question!"],
  },
});

const questionsSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: [true, "Please provide the wallet address!"],
      maxLength: 50,
      minLength: 3,
    },
    triviaName: {
      type: String,
      required: [true, "Please provide the trivia name!"],
    },
    questions: {
      type: [singleQuestionSchema],
      required: [true, "Please provide at least one question!"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Questions", questionsSchema);
