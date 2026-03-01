const express = require('express');
const router = express.Router();

// Professional In-Memory Database (Acts as a production mock)
let clients = [
    { id: "C-1001", name: "Alexander Wright", acc: "882044192", phone: "+254 712 345 678", email: "a.wright@global.com", balance: 1450000, status: "Active", risk: "Low", created: "2025-10-12", idNumber: "ID-992834", address: "Upper Hill, Nairobi", lastLogin: "2026-03-01 14:20", deposits: 5000000, withdrawals: 3550000, transfers: 50000, type: "Premium" },
    { id: "C-1002", name: "Sarah Jenkins", acc: "882055201", phone: "+1 415 902 1100", email: "s.jenkins@vault.io", balance: 85400, status: "Frozen", risk: "Medium", created: "2026-01-05", idNumber: "PASS-US-22", address: "Manhattan, NY", lastLogin: "2026-02-28 09:15", deposits: 100000, withdrawals: 14600, transfers: 0, type: "Savings" }
];

// DATA & SEARCH ENGINE
router.get('/data', (req, res) => {
    const { search } = req.query;
    if (search) {
        const q = search.toLowerCase();
        return res.json(clients.filter(c => 
            c.name.toLowerCase().includes(q) || c.acc.includes(q) || 
            c.email.toLowerCase().includes(q) || c.phone.includes(q)
        ));
    }
    res.json(clients);
});

// DASHBOARD COUNTERS
router.get('/stats', (req, res) => {
    const stats = {
        total: clients.length,
        active: clients.filter(c => c.status === 'Active').length,
        suspended: clients.filter(c => c.status === 'Suspended').length,
        frozen: clients.filter(c => c.status === 'Frozen').length,
        today: 1, // Mocked for display
        balance: clients.reduce((acc, c) => acc + c.balance, 0)
    };
    res.json(stats);
});

// ACTION CONTROLLER (FREEZE, SUSPEND, ACTIVATE, RESET, DELETE)
router.post('/action', (req, res) => {
    const { id, type, data } = req.body;
    let client = clients.find(c => c.id === id);

    if (type === 'Add') {
        const newClient = {
            id: "C-" + Math.floor(Math.random()*9000),
            name: data.name, acc: "8820" + Math.floor(Math.random()*99999),
            phone: data.phone, email: data.email, balance: parseFloat(data.balance),
            status: "Active", risk: "Low", created: new Date().toISOString().split('T')[0],
            idNumber: data.idNumber, address: "Global Registered", lastLogin: "Never",
            deposits: parseFloat(data.balance), withdrawals: 0, transfers: 0, type: "Standard"
        };
        clients.push(newClient);
        return res.json({ success: true, message: "Client Provisioned" });
    }

    if (!client) return res.status(404).json({ success: false });

    switch(type) {
        case 'Freeze': client.status = 'Frozen'; break;
        case 'Unfreeze': 
        case 'Activate': client.status = 'Active'; break;
        case 'Suspend': client.status = 'Suspended'; break;
        case 'Reset': /* Logic for password reset */ break;
        case 'Delete': clients = clients.filter(c => c.id !== id); break;
    }
    res.json({ success: true, status: client ? client.status : 'Deleted' });
});

module.exports = router;
