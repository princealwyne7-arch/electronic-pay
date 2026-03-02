const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

/* ================================
   CLIENT SCHEMA (ENTERPRISE)
================================ */
const express = require("express");
const router = express.Router();
const Client = require("../models/Client");

// Get all clients
router.get("/", async (req, res) => {
    try {
        const clients = await Client.find();
        res.json(clients);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a single client by ID
router.get("/:id", getClient, (req, res) => {
    res.json(res.client);
});

// Create a new client
router.post("/", async (req, res) => {
    const client = new Client({
        accountNumber: req.body.accountNumber,
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone,
        balance: req.body.balance || 0,
        currency: req.body.currency || "USD",
        status: req.body.status || "ACTIVE"
    });

    try {
        const newClient = await client.save();
        res.status(201).json(newClient);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Middleware to get client by ID
async function getClient(req, res, next) {
    let client;
    try {
        client = await Client.findById(req.params.id);
        if (!client) return res.status(404).json({ message: "Client not found" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    res.client = client;
    next();
}

module.exports = router;

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
