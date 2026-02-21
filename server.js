const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: -apple-system, sans-serif; background: #f0f2f5; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .container { background: white; width: 90%; max-width: 500px; padding: 40px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); box-sizing: border-box; }
                h2 { color: #1a73e8; font-size: 28px; margin-bottom: 30px; text-align: center; }
                label { font-weight: bold; color: #555; display: block; margin-bottom: 8px; font-size: 18px; }
                input { width: 100%; padding: 18px; margin-bottom: 25px; border: 2px solid #ddd; border-radius: 12px; font-size: 20px; box-sizing: border-box; transition: border 0.3s; }
                input:focus { border-color: #28a745; outline: none; }
                button { width: 100%; padding: 20px; background: #28a745; color: white; border: none; border-radius: 12px; font-size: 22px; font-weight: bold; cursor: pointer; transition: transform 0.1s; }
                button:active { transform: scale(0.98); background: #218838; }
                .footer { margin-top: 20px; font-size: 14px; color: #888; text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Electronic Shop Pay</h2>
                <form action="/push" method="POST">
                    <label>Customer Phone</label>
                    <input type="number" name="phone" placeholder="2547XXXXXXXX" required>
                    <label>Amount to Pay (KES)</label>
                    <input type="number" name="amount" placeholder="0.00" required>
                    <button type="submit">SEND STK PUSH</button>
                </form>
                <div class="footer">Securely processed via Paynecta</div>
            </div>
        </body>
        </html>
    `);
});

app.post('/push', async (req, res) => {
    const { phone, amount } = req.body;
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
                <div style="display:inline-block; background:white; padding:50px; border-radius:20px; box-shadow:0 10px 25px rgba(0,0,0,0.1);">
                    <h1 style="color:#28a745; font-size:50px;">✔️</h1>
                    <h2 style="color:#333;">Push Sent!</h2>
                    <p style="font-size:20px; color:#666;">Ask the customer to enter their PIN on their phone.</p>
                    <br>
                    <a href="/" style="text-decoration:none; padding:15px 30px; background:#1a73e8; color:white; border-radius:10px; font-weight:bold;">NEXT CUSTOMER</a>
                </div>
            </body>
        `);
    } catch (err) {
        res.status(500).send("Error: " + (err.response ? JSON.stringify(err.response.data) : err.message));
    }
});

app.listen(process.env.PORT || 3000, () => console.log('Server running...'));
