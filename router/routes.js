const express = require("express");
const User = require("../models/UserSchema");
const { generateRegistrationOptions } = require("@simplewebauthn/server");
const Challenge = require("../models/ChallengeSchema");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("WASSUP!!");
});

router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "lol incomplete" });
  } else {
    try {
      const result = await User.findOne({ email: email });

      if (result) {
        return res.status(400).json({ error: "Email already exists." });
      }

      const newUser = new User({ email, password });

      await newUser.save();

      return res.status(200).json({ id: newUser._id });
    } catch (error) {
      console.log(error);
    }
  }

  res.json({
    error: "There was an internal error. Sorry for the inconvience.",
  });
});

router.post("/challenge", async (req, res) => {
  const { uid } = req.body;

  try {
    const userData = await User.findOne({ _id: uid });

    console.log(userData);

    if (!userData) {
      return res.status(400).json({ error: "No user found" });
    }

    const challengePayload = await generateRegistrationOptions({
      rpID: "localhost",
      rpName: "fingerprint-auth",
      userName: userData.email,
    });

    const newChallenge = new Challenge({
      uid: uid,
      challenge: challengePayload.challenge,
    });

    await newChallenge.save();

    return res.json({ options: challengePayload });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

module.exports = router;
