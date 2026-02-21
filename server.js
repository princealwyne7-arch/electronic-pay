const express = require('express');
const axios = require('axios');
require('dotenv').config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let transactions = []; 

const translateStatus = (status, message) => {
    const s = String(status || message).toLowerCase();
    if (s.includes('success') || s === 'completed' || s === '0') return 'Successful ✅';
    if (s.includes('cancel') || s === '1032') return 'Cancelled ❌';
    if (s.includes('timeout') || s === '1037') return 'Timeout ⏳';
    if (s.includes('wrong') || s.includes('pin') || s === '2001') return 'Wrong PIN 🔑';
    if (s.includes('insufficient') || s === '1') return 'Low Balance 💸';
    return 'Failed/Other';
};

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
                    t.status.includes('Successful') ? '#28a745' : 
                    t.status.includes('Processing') ? '#f0ad4e' : '#d9534f'
                };">${t.status}</div>
            </div>
        </div>
    `).join('');

    res.send(`
        <!DOCTYPE html>
        <html>
        <head><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: sans-serif; background: #f0f2f5; display: flex; flex-direction: column; align-items: center; min-height: 100vh; margin: 0; padding: 15px; }
            .container { background: white; padding: 25px; border-radius: 25px; width: 100%; max-width: 400px; box-shadow: 0 8px 20px rgba(0,0,0,0.08); text-align: center; margin-bottom: 15px; }
            .profile-pic { width: 110px; height: 110px; border-radius: 50%; object-fit: cover; border: 4px solid #28a745; margin-bottom: 10px; }
            input { width: 100%; padding: 15px; margin-bottom: 10px; border: 2px solid #f0f0f0; border-radius: 12px; font-size: 16px; box-sizing: border-box; }
            .btn-send { width: 100%; padding: 18px; background: #28a745; color: white; border: none; border-radius: 12px; font-size: 18px; font-weight: bold; cursor: pointer; }
            .history-card { width: 100%; max-width: 400px; background: white; border-radius: 20px; padding: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
        </style></head>
        <body>
            <div class="container">
                <img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" class="profile-pic">
                <h2>Electronic Pay</h2>
                <form action="/push" method="POST">
                    <input type="password" name="password" placeholder="Manager PIN" required>
                    <input type="number" name="phone" placeholder="2547..." required>
                    <input type="number" name="amount" placeholder="Amount" required>
                    <button type="submit" class="btn-send">SEND STK PUSH</button>
                </form>
            </div>
            <div class="history-card">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <h3 style="margin:0; font-size:16px;">Live Status</h3>
                    <a href="/" style="font-size:12px; font-weight:bold; color:#1a73e8; text-decoration:none;">REFRESH</a>
                </div>
                <div class="history-list">${historyHtml || 'No activity'}</div>
            </div>
        </body></html>
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
            callback_url: "https://electronic-pay.onrender.com/callback"
        }, {
            headers: { 'X-API-Key': process.env.PAYNECTA_KEY, 'Content-Type': 'application/json' }
        });

        // Save tracking data
        transactions.unshift({ 
            id: response.data.transaction_id || response.data.request_id,
            phone: phone, 
            amount: amount, 
            status: 'Processing... 🔄', 
            time: new Date().toLocaleTimeString() 
        });
        res.redirect('/');
    } catch (err) { res.status(500).send(err.message); }
});

// IMPROVED CALLBACK LOGIC
app.post('/callback', (req, res) => {
    console.log("Incoming Callback:", req.body);
    const { transaction_id, status, request_id, message, mobile_number, amount } = req.body;
    
    // Try to find by ID first, then by phone and amount as backup
    let tx = transactions.find(t => t.id == transaction_id || t.id == request_id);
    
    if (!tx && mobile_number) {
        tx = transactions.find(t => t.phone == mobile_number && t.status.includes('Processing'));
    }

    if (tx) {
        tx.status = translateStatus(status, message);
    }
    res.sendStatus(200);
});

app.listen(process.env.PORT || 3000);
