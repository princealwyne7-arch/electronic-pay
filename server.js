const express = require('express');
const axios = require('axios');
require('dotenv').config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let transactions = []; // Temporary storage for recent hits

app.get('/', (req, res) => {
    let historyHtml = transactions.map(t => `
        <div style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee; font-size:14px;">
            <span>${t.phone}</span>
            <span>KES ${t.amount}</span>
            <span style="color:${t.status === 'Sent' ? '#28a745' : 'red'}; font-weight:bold;">${t.status}</span>
        </div>
    `).join('');

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: -apple-system, sans-serif; background: #f0f2f5; display: flex; flex-direction: column; align-items: center; min-height: 100vh; margin: 0; padding: 20px; }
                .container { background: white; padding: 30px; border-radius: 30px; width: 100%; max-width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); text-align: center; box-sizing: border-box; }
                .profile-pic { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid #28a745; margin-bottom: 15px; }
                input { width: 100%; padding: 15px; margin-bottom: 10px; border: 2px solid #eee; border-radius: 12px; font-size: 16px; box-sizing: border-box; }
                button { width: 100%; padding: 18px; background: #28a745; color: white; border: none; border-radius: 12px; font-size: 18px; font-weight: bold; cursor: pointer; }
                .history { width: 100%; max-width: 400px; background: white; margin-top: 20px; border-radius: 20px; padding: 20px; box-sizing: border-box; box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
            </style>
        </head>
        <body>
            <div class="container">
                <img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" class="profile-pic">
                <h2 style="margin:0 0 20px 0;">Electronic Pay</h2>
                <form action="/push" method="POST">
                    <input type="password" name="password" placeholder="Manager PIN" required>
                    <input type="number" name="phone" placeholder="Customer Phone" required>
                    <input type="number" name="amount" placeholder="Amount (KES)" required>
                    <button type="submit">SEND STK PUSH</button>
                </form>
            </div>
            
            <div class="history">
                <h3 style="margin:0 0 15px 0; font-size:16px; color:#555;">Recent Requests</h3>
                ${historyHtml || '<p style="color:#aaa; font-size:14px;">No transactions yet</p>'}
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
            email: "princealwyne7@gmail.com"
        }, {
            headers: { 'X-API-Key': process.env.PAYNECTA_KEY, 'Content-Type': 'application/json' }
        });

        // Save to local history
        transactions.unshift({ phone, amount, status: 'Sent', time: new Date().toLocaleTimeString() });
        if (transactions.length > 5) transactions.pop();

        res.send(`
            <head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
            <body style="font-family:sans-serif; background:#f0f2f5; display:flex; justify-content:center; align-items:center; height:100vh; margin:0;">
                <div style="background:white; padding:40px; border-radius:25px; text-align:center; width:85%; box-shadow:0 10px 30px rgba(0,0,0,0.1);">
                    <div style="font-size:70px; color:#28a745;">✔️</div>
                    <h2>Push Successful!</h2>
                    <p>Sent <b>KES ${amount}</b> to <b>${phone}</b></p>
                    <a href="/" style="display:block; margin-top:20px; padding:15px; background:#1a73e8; color:white; text-decoration:none; border-radius:10px; font-weight:bold;">BACK TO HOME</a>
                </div>
            </body>
        `);
    } catch (err) {
        transactions.unshift({ phone, amount, status: 'Failed' });
        res.status(500).send("Error: " + err.message);
    }
});

app.listen(process.env.PORT || 3000);
