const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connection success.");
  })
  .catch((error) => {
    console.log(error);
  });
