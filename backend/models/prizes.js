const mongoose = require("mongoose");

const prizesSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: [true, "Please provide the wallet address!"],
      maxLength: 50,
      minLength: 3,
    },
    owner: {
      type: Boolean,
      required: [true, "Please provide the owner!"],
    },
    amount: {
      type: Number,
      required: [true, "Please provide the amount!"],
    },
    code: {
      type: String,
      required: [true, "Please provide the code!"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prizes", prizesSchema);
