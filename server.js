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
                body { font-family: sans-serif; background: #f0f2f5; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .container { background: white; width: 95%; max-width: 450px; padding: 30px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); box-sizing: border-box; }
                input { width: 100%; padding: 18px; margin: 10px 0; border: 2px solid #ddd; border-radius: 12px; font-size: 18px; box-sizing: border-box; }
                button { width: 100%; padding: 18px; background: #28a745; color: white; border: none; border-radius: 12px; font-size: 20px; font-weight: bold; cursor: pointer; }
                label { font-weight: bold; color: #555; display: block; margin-top: 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2 style="text-align:center; color:#1a73e8;">Electronic Shop Pay</h2>
                <form action="/push" method="POST">
                    <label>Shop PIN</label>
                    <input type="password" name="password" placeholder="Enter PIN to unlock" required>
                    <hr style="margin:20px 0; border:0; border-top:1px solid #eee;">
                    <label>Customer Phone</label>
                    <input type="number" name="phone" placeholder="2547XXXXXXXX" required>
                    <label>Amount (KES)</label>
                    <input type="number" name="amount" placeholder="0.00" required>
                    <button type="submit">SEND STK PUSH</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

app.post('/push', async (req, res) => {
    const { phone, amount, password } = req.body;
    
    if (password !== SHOP_PASSWORD) {
        return res.send("<h2>❌ Incorrect PIN!</h2><p>Access Denied.</p><a href='/'>Try Again</a>");
    }

    try {
        await axios.post('https://paynecta.co.ke/api/v1/payment/initialize', {
            code: process.env.PAYMENT_CODE,
            mobile_number: phone,
            amount: amount,
            email: "princealwyne7@gmail.com"
        }, {
            headers: {
                'X-API-Key': process.env.PAYNECTA_KEY,
                'Content-Type': 'application/json'
            }
        });

        res.send(`
            <body style="font-family:sans-serif; text-align:center; padding-top:100px; background:#f0f2f5;">
                <div style="display:inline-block; background:white; padding:40px; border-radius:20px;">
                    <h1 style="color:#28a745; font-size:50px;">✔️</h1>
                    <h2>Push Sent Successfully!</h2>
                    <p>Ask customer for PIN.</p>
                    <br><br>
                    <a href="/" style="padding:15px 30px; background:#1a73e8; color:white; border-radius:10px; text-decoration:none; font-weight:bold;">NEXT CUSTOMER</a>
                </div>
            </body>
        `);
    } catch (err) {
        res.status(500).send("Error: " + (err.response ? JSON.stringify(err.response.data) : err.message));
    }
});

app.listen(process.env.PORT || 3000, () => console.log('Server running...'));
