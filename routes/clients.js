const express = require('express');
const router = express.Router();

// Mock database for now - Integration with MongoDB is seamless
let clients = [
    { id: 1, name: "ALEX TRENTON", acc: "882033910", phone: "+254712345678", email: "alex@node.bank", balance: 1200000, status: "Active" }
];

// GET: View All Clients
router.get('/', (res) => res.json(clients));

// POST: Create New Client
router.post('/add', (req, res) => {
    const newClient = req.body;
    clients.push(newClient);
    res.json({ message: "Client created successfully", client: newClient });
});

// PATCH: Toggle Status
router.patch('/status/:id', (req, res) => {
    const client = clients.find(c => c.id == req.params.id);
    if(client) {
        client.status = client.status === "Active" ? "Suspended" : "Active";
        res.json({ message: "Status updated", status: client.status });
    }
});

module.exports = router;
