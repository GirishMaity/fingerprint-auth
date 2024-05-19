const express = require("express");
const User = require("../models/UserSchema");
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require("@simplewebauthn/server");
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

router.post("/verify", async (req, res) => {
  const { uid, cred } = req.body;

  try {
    const challengeData = await Challenge.findOne({ uid: uid });

    if (!challengeData) {
      return res.status(400).json({ error: "No user found" });
    }

    const verification = await verifyRegistrationResponse({
      expectedChallenge: challengeData.challenge,
      expectedOrigin: "http://localhost:5000",
      expectedRPID: "localhost",
      response: cred,
    });

    if (!verification.verified) {
      return res.json({ error: "Can't verify" });
    }

    const updatedChallenge = await Challenge.findOneAndUpdate(
      { uid: uid },
      {
        registrationInfo: verification.registrationInfo,
      }
    );
    //save verification data

    res.json({ verified: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

router.post("/login", async (req, res) => {
  const { email } = req.body;

  try {
    const userData = await User.findOne({ email: email });

    if (!userData) {
      return res.status(400).json({ error: "No user found" });
    }

    const options = await generateAuthenticationOptions({
      rpID: "localhost",
    });

    //save options

    return res.json({ options });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

router.post("/loginverify", async (req, res) => {
  const { email, cred } = req.body;

  try {
    const userData = await User.findOne({ email: email });

    if (!userData) {
      return res.status(400).json({ error: "No user found" });
    }
    const challengeData = await Challenge.findOne({ uid: userData._id });

    if (!challengeData) {
      return res.status(400).json({ error: "No user found" });
    }

    const result = await verifyAuthenticationResponse({
      expectedChallenge: challengeData.challenge,
      expectedOrigin: "http://localhost:5000",
      expectedRPID: "localhost",
      response: cred,
      authenticator: challengeData.registrationInfo,
    });
    console.log(result);

    if (!result.verified) {
      return res.json({ error: "Can't verify" });
    }

    return res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

module.exports = router;
