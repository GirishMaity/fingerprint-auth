const express = require("express");
const dotenv = require("dotenv");
const routes = require("./router/routes");

const app = express();
dotenv.config();
require("./db/db");

//middleware config
app.use(express.static("./public"));
app.use(express.json());
app.use(routes);

app.listen(5000, () => console.log("Bro runnin on port 5000"));
