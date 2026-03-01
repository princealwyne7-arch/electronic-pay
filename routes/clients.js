const express = require("express");
const router = express.Router();

// Enterprise Mock Data with Deep Stats
let clients = [
    { 
        id: 1, name: "Alex T", acc: "88001122", phone: "2547000000", email: "alex@global.bank", 
        balance: 250000, status: "Active", idNo: "ID-992233", riskLevel: "Low",
        totalDeposits: 450000, totalWithdrawals: 200000, totalTransfers: 12,
        createdAt: "2026-01-10", logs: ["[02/03/2026] System Login: Success"]
    },
    { 
        id: 2, name: "Susan M", acc: "88004455", phone: "2547111111", email: "susan@global.bank", 
        balance: 8500, status: "Active", idNo: "ID-445566", riskLevel: "Medium",
        totalDeposits: 15000, totalWithdrawals: 6500, totalTransfers: 4,
        createdAt: "2026-02-15", logs: ["[01/03/2026] Profile Updated"]
    }
];

// GET: Advanced Dashboard Stats & List
router.get("/", (req, res) => {
    const stats = {
        total: clients.length,
        active: clients.filter(c => c.status === "Active").length,
        frozen: clients.filter(c => c.status === "Frozen").length,
        newToday: clients.filter(c => c.createdAt === new Date().toISOString().split('T')[0]).length
    };
    res.json({ clients, stats });
});

// GET: Deep Intelligence Profile
router.get("/:id/details", (req, res) => {
    const client = clients.find(c => c.id == req.params.id);
    res.json(client || {});
});

// PATCH: Admin Control Protocol
router.patch("/:id/control", (req, res) => {
    const client = clients.find(c => c.id == req.params.id);
    if (!client) return res.status(404).send();
    
    const { action } = req.body;
    const timestamp = new Date().toLocaleString();

    if (action === 'freeze') { client.status = "Frozen"; client.logs.unshift(`[${timestamp}] Account Frozen by Admin`); }
    if (action === 'unfreeze') { client.status = "Active"; client.logs.unshift(`[${timestamp}] Account Unfrozen by Admin`); }
    if (action === 'logout') { client.logs.unshift(`[${timestamp}] Forced Session Termination`); }
    if (action === 'reset_pw') { client.logs.unshift(`[${timestamp}] Security Credential Reset`); }

    res.json(client);
});

module.exports = router;
