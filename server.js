const express = require("express");
const mongoose = require("mongoose");
const app = express();
app.use(express.json());

// Mock Data for Live Meters
let systemState = {
    usersOnline: 1284,
    tps: 38,
    activeTransfers: 142,
    alerts: 3,
    bankFunds: {
        total: 2438920440,
        available: 1900000000,
        reserved: 2000000000,
        frozen: 80000000,
        moving: 258920440
    }
};

app.get('/api/metrics', (req, res) => {
    // Simulate live updates
    systemState.tps = Math.floor(Math.random() * (45 - 30) + 30);
    systemState.usersOnline += Math.floor(Math.random() * 5);
    res.json(systemState);
});

app.listen(3000, () => console.log("Banking Core: Port 3000"));
