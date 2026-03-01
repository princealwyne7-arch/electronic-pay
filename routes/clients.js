const express = require('express');
const router = express.Router();

// Logic: Global Banking Database (Mock Persistence)
let clients = [
    { id: "C-101", name: "Alexander Wright", acc: "882044192", phone: "+254 712 345 678", email: "a.wright@global.com", balance: 1450000, status: "Active", risk: "Low", created: "2025-10-12", idNumber: "ID-992834", address: "Upper Hill, Nairobi", lastLogin: "2026-03-01 14:20", type: "Platinum", deposits: 5000000, withdrawals: 3500000, transfers: 50000 },
    { id: "C-102", name: "Sarah Jenkins", acc: "882055201", phone: "+1 415 902 1100", email: "s.jenkins@vault.io", balance: 85400, status: "Frozen", risk: "Medium", created: "2026-01-05", idNumber: "PASS-US-22", address: "Manhattan, NY", lastLogin: "2026-02-28 09:15", type: "Standard", deposits: 100000, withdrawals: 14600, transfers: 0 }
];

// SMART SEARCH ENGINE (By Name, Acc, Phone, Email)
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

// CLIENT CONTROL PANEL LOGIC (Freeze, Suspend, Activate, Reset, Delete)
router.post('/control', (req, res) => {
    const { id, action } = req.body;
    const c = clients.find(client => client.id === id);
    if (!c && action !== 'add') return res.status(404).json({ success: false });

    switch(action) {
        case 'Freeze': c.status = 'Frozen'; break;
        case 'Unfreeze': c.status = 'Active'; break;
        case 'Suspend': c.status = 'Suspended'; break;
        case 'Activate': c.status = 'Active'; break;
        case 'Delete': clients = clients.filter(client => client.id !== id); break;
        case 'Add': 
            const newClient = { ...req.body.data, id: "C-" + Math.floor(Math.random()*9000), status: "Active", risk: "Low", created: new Date().toISOString().split('T')[0] };
            clients.push(newClient);
            break;
    }
    res.json({ success: true, message: `System Action ${action} Completed` });
});

module.exports = router;
