const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();

// Serve React build files
app.use(express.static(path.join(__dirname, "dist")));

// Always return index.html for React routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
