const express = require("express");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static("public"));

// Root route
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/dashboard.html");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Global Digital Bank Running on " + PORT));
