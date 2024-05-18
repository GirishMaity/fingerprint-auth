const express = require("express");
const User = require("../models/UserSchema");
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

      return res.status(201).json({ message: "User created succressfully." });
    } catch (error) {
      console.log(error);
    }
  }

  res.json({
    error: "There was an internal error. Sorry for the inconvience.",
  });
});

module.exports = router;
