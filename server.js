const express = require('express');
const axios = require('axios');
require('dotenv').config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const SHOP_PASSWORD = "5566";

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: -apple-system, sans-serif; background: #f0f2f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
                .container { background: white; padding: 40px; border-radius: 30px; width: 90%; max-width: 450px; box-shadow: 0 15px 35px rgba(0,0,0,0.1); text-align: center; margin: 20px; }
                .profile-pic { width: 180px; height: 180px; border-radius: 50%; object-fit: cover; border: 6px solid #28a745; margin-bottom: 20px; box-shadow: 0 6px 15px rgba(0,0,0,0.15); }
                h2 { color: #333; margin: 0 0 25px 0; font-size: 28px; font-weight: 800; }
                label { display: block; text-align: left; font-weight: bold; color: #555; margin: 15px 0 5px 5px; font-size: 16px; }
                input { width: 100%; padding: 20px; margin-bottom: 10px; border: 2px solid #eee; border-radius: 15px; font-size: 18px; box-sizing: border-box; }
                button { width: 100%; padding: 22px; background: #28a745; color: white; border: none; border-radius: 15px; font-size: 22px; font-weight: bold; cursor: pointer; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" class="profile-pic" alt="Business Logo">
                <h2>Electronic Shop Pay</h2>
                <form action="/push" method="POST">
                    <label>Manager PIN</label>
                    <input type="password" name="password" placeholder="••••" required>
                    <label>Customer Phone</label>
                    <input type="number" name="phone" placeholder="2547..." required>
                    <label>Amount (KES)</label>
                    <input type="number" name="amount" placeholder="0.00" required>
                    <button type="submit">CONFIRM & SEND STK</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

app.post('/push', async (req, res) => {
    const { phone, amount, password } = req.body;
    if (String(password).trim() !== SHOP_PASSWORD) { 
        return res.send("<body style='font-family:sans-serif;text-align:center;padding-top:100px;background:#f0f2f5;'><div style='background:white;padding:50px;display:inline-block;border-radius:20px;'><h1 style='color:red;font-size:60px;'>❌</h1><h2>Wrong PIN</h2><a href='/'>Try Again</a></div></body>");
    }
    try {
        await axios.post('https://paynecta.co.ke/api/v1/payment/initialize', {
            code: process.env.PAYMENT_CODE,
            mobile_number: phone,
            amount: amount,
            email: "princealwyne7@gmail.com"
        }, {
            headers: { 'X-API-Key': process.env.PAYNECTA_KEY, 'Content-Type': 'application/json' }
        });

        // UPDATED STYLISH SUCCESS PAGE
        res.send(`
            <head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
            <body style="font-family:-apple-system,sans-serif; background:#f0f2f5; display:flex; justify-content:center; align-items:center; height:100vh; margin:0;">
                <div style="background:white; padding:50px; border-radius:30px; width:90%; max-width:400px; text-align:center; box-shadow:0 15px 35px rgba(0,0,0,0.1);">
                    <div style="font-size:80px; color:#28a745; margin-bottom:20px;">✔️</div>
                    <h1 style="color:#333; margin-bottom:10px; font-size:32px;">Push Sent!</h1>
                    <p style="color:#666; font-size:20px; line-height:1.5;">The STK Push has been sent to <b>${phone}</b> for <b>KES ${amount}</b>.</p>
                    <p style="color:#888; margin-bottom:30px;">Ask the customer to enter their M-Pesa PIN.</p>
                    <a href="/" style="display:block; padding:20px; background:#1a73e8; color:white; text-decoration:none; border-radius:15px; font-weight:bold; font-size:20px;">NEXT CUSTOMER</a>
                </div>
            </body>
        `);
    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
});
app.listen(process.env.PORT || 3000);
