const express = require('express');
const router = express.Router();

let clients = [
    { id: "C-1001", name: "Alexander Wright", acc: "882044192", phone: "+254 712 345 678", email: "a.wright@global.com", balance: 1450000, status: "Active", risk: "Low", created: "2025-10-12", idNumber: "ID-992834", address: "Upper Hill, Nairobi", lastLogin: "2026-03-01 14:20", deposits: 5000000, withdrawals: 3550000, transfers: 50000, type: "Premium Platinum" },
    { id: "C-1002", name: "Sarah Jenkins", acc: "882055201", phone: "+1 415 902 1100", email: "s.jenkins@vault.io", balance: 85400, status: "Frozen", risk: "Medium", created: "2026-01-05", idNumber: "PASS-US-22", address: "Manhattan, NY", lastLogin: "2026-02-28 09:15", deposits: 100000, withdrawals: 14600, transfers: 0, type: "Standard Savings" }
];

router.get('/data', (req, res) => {
    const { search } = req.query;
    let filtered = clients;
    if (search) {
        const q = search.toLowerCase();
        filtered = clients.filter(c => c.name.toLowerCase().includes(q) || c.acc.includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q));
    }
    res.json(filtered);
});

router.get('/stats', (req, res) => {
    res.json({
        total: clients.length,
        active: clients.filter(c => c.status === 'Active').length,
        suspended: clients.filter(c => c.status === 'Suspended').length,
        frozen: clients.filter(c => c.status === 'Frozen').length,
        today: 1, 
        balance: clients.reduce((acc, c) => acc + c.balance, 0)
    });
});

router.post('/action', (req, res) => {
    const { id, type, data } = req.body;
    let client = clients.find(c => c.id === id);

    if (type === 'Add') {
        const newC = {
            id: "C-" + Math.floor(1000 + Math.random()*9000),
            name: data.name, acc: "8820" + Math.floor(10000 + Math.random()*89999),
            phone: data.phone, email: data.email, balance: parseFloat(data.balance || 0),
            status: "Active", risk: "Low", created: new Date().toISOString().split('T')[0],
            idNumber: data.idNumber, address: "Global Registered", lastLogin: "Never",
            deposits: parseFloat(data.balance || 0), withdrawals: 0, transfers: 0, type: "Standard"
        };
        clients.push(newC);
        return res.json({ success: true });
    }

    if (!client) return res.status(404).send();

    if (type === 'Freeze') client.status = 'Frozen';
    if (type === 'Unfreeze' || type === 'Activate') client.status = 'Active';
    if (type === 'Suspend') client.status = 'Suspended';
    if (type === 'Delete') clients = clients.filter(c => c.id !== id);
    
    res.json({ success: true });
});

module.exports = router;
