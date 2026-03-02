import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;
const distPath = path.resolve(__dirname, 'dist');

// MUZZLE: Static files MUST be served before the catch-all
app.use(express.static(distPath));

// ROOT MUZZLE: Explicitly serve index for the base path
app.get('/', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// FIXED WILDCARD: Use (.*) instead of * to satisfy new Express requirements
app.get('(.*)', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('System Error: Build assets not found. Check Render logs.');
  }
});

app.listen(PORT, () => {
  console.log('--- AI COMMAND CENTER DEPLOYED ---');
  console.log('Status: Online');
});
