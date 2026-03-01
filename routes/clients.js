const express = require("express");
const router = express.Router();

// Mock Database (Integrate MongoDB here in production)
let clients = [
    { id: 1, name: "Alex T", acc: "88001122", phone: "2547000000", email: "alex@global.bank", balance: 250000, status: "Active" },
    { id: 2, name: "Susan M", acc: "88004455", phone: "2547111111", email: "susan@global.bank", balance: 8500, status: "Active" }
];

// GET: All Clients & Stats
router.get("/", (req, res) => {
    const stats = {
        total: clients.length,
        active: clients.filter(c => c.status === "Active").length,
        suspended: clients.filter(c => c.status === "Suspended").length
    };
    res.json({ clients, stats });
});

// POST: Create New Client
router.post("/", (req, res) => {
    const newClient = { 
        id: Date.now(), 
        ...req.body, 
        acc: "8800" + Math.floor(1000 + Math.random() * 9000), 
        status: "Active" 
    };
    clients.push(newClient);
    res.status(201).json(newClient);
});

// PATCH: Toggle Status
router.patch("/:id/status", (req, res) => {
    const client = clients.find(c => c.id == req.params.id);
    if (client) {
        client.status = client.status === "Active" ? "Suspended" : "Active";
        res.json(client);
    } else { res.status(404).send(); }
});

// DELETE: Remove Client
router.delete("/:id", (req, res) => {
    clients = clients.filter(c => c.id != req.params.id);
    res.status(204).send();
});

module.exports = router;
