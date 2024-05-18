const mongoose = require("mongoose");

const challengeSchema = new mongoose.Schema(
  {
    uid: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    challenge: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Challenge = mongoose.model("Challenge", challengeSchema);

module.exports = Challenge;
