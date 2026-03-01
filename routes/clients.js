const express = require('express');
const router = express.Router();

// Enterprise Logic: Global Client Ledger
let clients = [
    { id: "C-9901", name: "Alexander Wright", acc: "882044192", phone: "+254 712 345 678", email: "a.wright@global.com", balance: 1450000, status: "Active", risk: "Low", created: "2025-10-12", idNumber: "ID-992834", address: "Upper Hill, Nairobi", lastLogin: "2026-03-01 14:20" },
    { id: "C-9902", name: "Sarah Jenkins", acc: "882055201", phone: "+1 415 902 1100", email: "s.jenkins@vault.io", balance: 85400, status: "Frozen", risk: "Medium", created: "2026-01-05", idNumber: "PASS-US-22", address: "Manhattan, NY", lastLogin: "2026-02-28 09:15" },
    { id: "C-9903", name: "Chen Wei", acc: "882011993", phone: "+86 21 6632 001", email: "wei.chen@asia-bank.cn", balance: 12000000, status: "Suspended", risk: "High", created: "2024-05-20", idNumber: "ID-CN-001", address: "Pudong, Shanghai", lastLogin: "2026-01-10 11:00" }
];

router.get('/data', (req, res) => {
    const { search } = req.query;
    if (search) {
        const query = search.toLowerCase();
        return res.json(clients.filter(c => c.name.toLowerCase().includes(query) || c.acc.includes(query) || c.email.toLowerCase().includes(query) || c.phone.includes(query)));
    }
    res.json(clients);
});

router.post('/action', (req, res) => {
    const { id, type } = req.body;
    const client = clients.find(c => c.id === id);
    if (!client) return res.status(404).json({ success: false });
    if (type === 'Freeze') client.status = 'Frozen';
    if (type === 'Suspend') client.status = 'Suspended';
    if (type === 'Activate') client.status = 'Active';
    if (type === 'Delete') clients = clients.filter(c => c.id !== id);
    res.json({ success: true, status: client ? client.status : 'Deleted' });
});

module.exports = router;
