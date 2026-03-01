const express = require('express');
const router = express.Router();

// Mock Database for Enterprise UI Testing (Connect your MongoDB Model here)
let clients = [
    { id: 1, name: "Alexander Wright", account: "882044192", phone: "+254 712 345 678", email: "a.wright@global.com", balance: 1450000, status: "Active", risk: "Low", registered: "2025-10-12", idNumber: "ID-992834" },
    { id: 2, name: "Sarah Jenkins", account: "882055201", phone: "+1 415 902 1100", email: "s.jenkins@vault.io", balance: 85400, status: "Frozen", risk: "Medium", registered: "2026-01-05", idNumber: "PASS-US-22" },
    { id: 3, name: "Chen Wei", account: "882011993", phone: "+86 21 6632 001", email: "wei.chen@asia-bank.cn", balance: 12000000, status: "Suspended", risk: "High", registered: "2024-05-20", idNumber: "ID-CN-001" }
];

// GET ALL CLIENTS / SEARCH
router.get('/data', (req, res) => {
    const { search } = req.query;
    if (search) {
        const filtered = clients.filter(c => 
            c.name.toLowerCase().includes(search.toLowerCase()) || 
            c.account.includes(search) || 
            c.email.toLowerCase().includes(search.toLowerCase())
        );
        return res.json(filtered);
    }
    res.json(clients);
});

// UPDATE STATUS LOGIC
router.post('/status', (req, res) => {
    const { id, status } = req.body;
    const client = clients.find(c => c.id == id);
    if (client) {
        client.status = status;
        res.json({ success: true, message: `Account ${status} successfully` });
    } else {
        res.status(404).json({ success: false });
    }
});

module.exports = router;
