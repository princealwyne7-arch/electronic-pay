import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;
const distPath = path.resolve(__dirname, 'dist');

// Serve static files
app.use(express.static(distPath));

// SIMPLE MUZZLE: Manual routing for the SPA
// This avoids the "*" and "(.*)" characters entirely to prevent PathErrors
app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`--- AI COMMAND CENTER ONLINE ON PORT ${PORT} ---`);
});
