const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

/* ================================
   CLIENT SCHEMA (ENTERPRISE)
================================ */
const ClientSchema = new mongoose.Schema({
    fullName: String,
    phone: String,
    email: String,
    nationalId: String,
    balance: { type: Number, default: 0 },
    status: { type: String, default: "Active" }, // Active | Suspended | Frozen
    riskLevel: { type: String, default: "Low" },
    totalDeposits: { type: Number, default: 0 },
    totalWithdrawals: { type: Number, default: 0 },
    totalTransfers: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const Client = mongoose.model("Client", ClientSchema);

/* ================================
   ROUTES
================================ */

// Get all clients
router.get("/", async (req, res) => {
    const clients = await Client.find();
    res.json(clients);
});

// Create client
router.post("/create", async (req, res) => {
    const client = new Client(req.body);
    await client.save();
    res.json({ message: "Client Created", client });
});

// Freeze
router.put("/freeze/:id", async (req, res) => {
    await Client.findByIdAndUpdate(req.params.id, { status: "Frozen" });
    res.json({ message: "Account Frozen" });
});

// Suspend
router.put("/suspend/:id", async (req, res) => {
    await Client.findByIdAndUpdate(req.params.id, { status: "Suspended" });
    res.json({ message: "Account Suspended" });
});

// Activate
router.put("/activate/:id", async (req, res) => {
    await Client.findByIdAndUpdate(req.params.id, { status: "Active" });
    res.json({ message: "Account Activated" });
});

// Delete
router.delete("/:id", async (req, res) => {
    await Client.findByIdAndDelete(req.params.id);
    res.json({ message: "Client Deleted" });
});

module.exports = router;
