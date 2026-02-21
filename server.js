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
                <div style="font-size:11px; font-weight:bold; color:${t.status === 'Sent' ? '#28a745' : '#d9534f'};">${t.status}</div>
            </div>
        </div>
    `).join('');

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: -apple-system, sans-serif; background: #f0f2f5; display: flex; flex-direction: column; align-items: center; min-height: 100vh; margin: 0; padding: 15px; box-sizing: border-box; }
                .container { background: white; padding: 25px; border-radius: 25px; width: 100%; max-width: 400px; box-shadow: 0 8px 20px rgba(0,0,0,0.08); text-align: center; margin-bottom: 15px; }
                .profile-pic { width: 110px; height: 110px; border-radius: 50%; object-fit: cover; border: 4px solid #28a745; margin-bottom: 10px; }
                input { width: 100%; padding: 15px; margin-bottom: 10px; border: 2px solid #f0f0f0; border-radius: 12px; font-size: 16px; box-sizing: border-box; }
                .btn-send { width: 100%; padding: 18px; background: #28a745; color: white; border: none; border-radius: 12px; font-size: 18px; font-weight: bold; cursor: pointer; }
                
                .history-card { width: 100%; max-width: 400px; background: white; border-radius: 20px; padding: 20px; box-sizing: border-box; box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
                .history-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 2px solid #f9f9f9; padding-bottom: 10px; }
                /* SCROLLABLE SECTION */
                .history-list { max-height: 250px; overflow-y: auto; scroll-behavior: smooth; }
                .btn-clear { background: #fee; color: #d9534f; border: none; padding: 8px 12px; border-radius: 8px; font-size: 12px; font-weight: bold; cursor: pointer; }
            </style>
        </head>
        <body>
            <div class="container">
                <img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" class="profile-pic">
                <h2 style="margin:0 0 15px 0; font-size: 22px;">Electronic Pay</h2>
                <form action="/push" method="POST">
                    <input type="password" name="password" placeholder="Manager PIN" required>
                    <input type="number" name="phone" placeholder="Customer Phone" required>
                    <input type="number" name="amount" placeholder="Amount (KES)" required>
                    <button type="submit" class="btn-send">SEND STK PUSH</button>
                </form>
            </div>
            
            <div class="history-card">
                <div class="history-header">
                    <h3 style="margin:0; font-size:16px; color:#555;">Recent Requests</h3>
                    <form action="/clear" method="POST" style="margin:0;">
                        <button type="submit" class="btn-clear">Clear All</button>
                    </form>
                </div>
                <div class="history-list">
                    ${historyHtml || '<p style="color:#aaa; font-size:14px; text-align:center;">No history yet</p>'}
                </div>
            </div>
        </body>
        </html>
    `);
});

app.post('/push', async (req, res) => {
    const { phone, amount, password } = req.body;
    if (password !== "5566") return res.send("Invalid PIN");

    try {
        await axios.post('https://paynecta.co.ke/api/v1/payment/initialize', {
            code: process.env.PAYMENT_CODE,
            mobile_number: phone,
            amount: amount,
            email: "princealwyne7@gmail.com"
        }, {
            headers: { 'X-API-Key': process.env.PAYNECTA_KEY, 'Content-Type': 'application/json' }
        });

        transactions.unshift({ 
            phone, 
            amount, 
            status: 'Sent', 
            time: new Date().toLocaleString('en-KE', { hour: '2-digit', minute: '2-digit', hour12: true }) 
        });
        
        res.redirect('/');
    } catch (err) {
        transactions.unshift({ phone, amount, status: 'Failed', time: 'Just now' });
        res.redirect('/');
    }
});

app.post('/clear', (req, res) => {
    transactions = [];
    res.redirect('/');
});

app.listen(process.env.PORT || 3000);
