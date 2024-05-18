const express = require("express");

const app = express();

//middleware config
app.use(express.static("./public"));
app.use(express.json());

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  return res.json({ email, password });
});

app.listen(5000, () => console.log("Bro runnin on port 5000"));
