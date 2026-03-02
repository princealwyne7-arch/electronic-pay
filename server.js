const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve the static files from the Vite build directory
app.use(express.static(path.join(__dirname, 'dist')));

// Redirect all requests to index.html (Standard for SPAs)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log('AI Command Center is live on port ' + PORT);
});
