const express = require('express');
const router = express.Router();

// Logic for Account Status and Risk Levels
router.get('/data', (req, res) => {
    // In a production build, this pulls from your MongoDB 'Client' Model
    const clients = [
        { id: "101", name: "Alexander Wright", acc: "882044192", phone: "254712345678", email: "a.wright@bank.com", balance: 1450000, status: "Active", risk: "Low", created: "2026-01-10", nationalID: "ID-992834", address: "Upper Hill, Nairobi", lastLogin: "2026-03-01 14:20" },
        { id: "102", name: "Sarah Jenkins", acc: "882055201", phone: "14159021100", email: "s.jenkins@vault.io", balance: 85400, status: "Frozen", risk: "Medium", created: "2026-02-15", nationalID: "PASS-US-22", address: "Manhattan, NY", lastLogin: "2026-02-28 09:15" }
    ];
    
    const { search } = req.query;
    if (search) {
        const filtered = clients.filter(c => 
            c.name.toLowerCase().includes(search.toLowerCase()) || 
            c.acc.includes(search) || 
            c.email.toLowerCase().includes(search.toLowerCase()) ||
            c.phone.includes(search)
        );
        return res.json(filtered);
    }
    res.json(clients);
});

// Logic for Status Control (Activate/Suspend/Freeze)
router.post('/update-status', (req, res) => {
    const { id, action } = req.body;
    // Security logic: Update DB entry status based on 'action'
    res.json({ success: true, message: `System: Client ${id} status updated to ${action}` });
});

module.exports = router;
