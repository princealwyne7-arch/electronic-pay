const express = require('express');
const axios = require('axios');
require('dotenv').config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let transactions = []; 

app.get('/', (req, res) => {
    let historyHtml = transactions.map(t => `
        <div style="display:flex; justify-content:space-between; padding:12px; border-bottom:1px solid #f0f0f0; font-size:14px;">
            <div style="text-align:left;">
                <div style="font-weight:bold; color:#333;">${t.phone}</div>
                <div style="font-size:11px; color:#999;">${t.time}</div>
            </div>
            <div style="text-align:right;">
                <div style="font-weight:bold; color:#28a745;">KES ${t.amount}</div>
                <div style="font-size:11px; font-weight:bold; color:${
                    t.status === 'Completed' ? '#28a745' : 
                    t.status === 'Cancelled' ? '#d9534f' : 
                    t.status === 'Processing' ? '#f0ad4e' : '#d9534f'
                };">${t.status}</div>
            </div>
        </div>
    `).join('');

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="refresh" content="10"> <style>
                body { font-family: -apple-system, sans-serif; background: #f0f2f5; display: flex; flex-direction: column; align-items: center; min-height: 100vh; margin: 0; padding: 15px; box-sizing: border-box; }
                .container { background: white; padding: 25px; border-radius: 25px; width: 100%; max-width: 400px; box-shadow: 0 8px 20px rgba(0,0,0,0.08); text-align: center; margin-bottom: 15px; }
                .profile-pic { width: 110px; height: 110px; border-radius: 50%; object-fit: cover; border: 4px solid #28a745; margin-bottom: 10px; }
                input { width: 100%; padding: 15px; margin-bottom: 10px; border: 2px solid #f0f0f0; border-radius: 12px; font-size: 16px; box-sizing: border-box; }
                .btn-send { width: 100%; padding: 18px; background: #28a745; color: white; border: none; border-radius: 12px; font-size: 18px; font-weight: bold; cursor: pointer; }
                .history-card { width: 100%; max-width: 400px; background: white; border-radius: 20px; padding: 20px; box-sizing: border-box; box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
                .history-list { max-height: 300px; overflow-y: auto; }
            </style>
        </head>
        <body>
            <div class="container">
                <img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" class="profile-pic">
                <h2 style="margin:0 0 15px 0;">Electronic Pay</h2>
                <form action="/push" method="POST">
                    <input type="password" name="password" placeholder="Manager PIN" required>
                    <input type="number" name="phone" placeholder="Customer Phone" required>
                    <input type="number" name="amount" placeholder="Amount" required>
                    <button type="submit" class="btn-send">SEND STK PUSH</button>
                </form>
            </div>
            <div class="history-card">
                <h3 style="margin:0 0 15px 0; font-size:16px; color:#555;">Live Status</h3>
                <div class="history-list">${historyHtml || 'No activity'}</div>
            </div>
        </body>
        </html>
    `);
});

app.post('/push', async (req, res) => {
    const { phone, amount, password } = req.body;
    if (password !== "5566") return res.send("Invalid PIN");

    try {
        const response = await axios.post('https://paynecta.co.ke/api/v1/payment/initialize', {
            code: process.env.PAYMENT_CODE,
            mobile_number: phone,
            amount: amount,
            email: "princealwyne7@gmail.com",
            callback_url: "https://electronic-pay.onrender.com/callback" // THIS IS KEY
        }, {
            headers: { 'X-API-Key': process.env.PAYNECTA_KEY, 'Content-Type': 'application/json' }
        });

        // Store as "Processing" initially
        transactions.unshift({ 
            id: response.data.transaction_id || Date.now(), 
            phone, amount, status: 'Processing', 
            time: new Date().toLocaleTimeString() 
        });
        res.redirect('/');
    } catch (err) { res.status(500).send(err.message); }
});

// THE WEBHOOK: Paynecta calls this when Safaricom responds
app.post('/callback', (req, res) => {
    const { transaction_id, status, request_id } = req.body;
    
    // Find the transaction in our list and update its status
    const tx = transactions.find(t => t.id == transaction_id || t.request_id == request_id);
    if (tx) {
        if (status === 'success') tx.status = 'Completed';
        else if (status === 'failed') tx.status = 'Cancelled/Error';
        else tx.status = status;
    }
    res.sendStatus(200); // Tell Paynecta we received the info
});

app.listen(process.env.PORT || 3000);
