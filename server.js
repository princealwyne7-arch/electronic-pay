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
                body { font-family: sans-serif; background: #f0f2f5; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .container { background: white; padding: 30px; border-radius: 20px; width: 90%; max-width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
                input { width: 100%; padding: 15px; margin: 10px 0; border: 1px solid #ddd; border-radius: 10px; font-size: 18px; box-sizing: border-box; }
                button { width: 100%; padding: 18px; background: #28a745; color: white; border: none; border-radius: 10px; font-size: 20px; font-weight: bold; cursor: pointer; }
                label { font-size: 14px; color: #666; font-weight: bold; margin-left: 5px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2 style="text-align:center; color: #333;">Authorize Payment</h2>
                <form action="/push" method="POST">
                    <label>Manager PIN</label>
                    <input type="password" name="password" placeholder="••••" required>
                    
                    <label>Customer Phone</label>
                    <input type="number" name="phone" placeholder="2547XXXXXXXX" required>
                    
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
    
    if (String(password).trim() !== "5566") { 
        return res.send("<body style='text-align:center;font-family:sans-serif;padding-top:50px;'><h2 style='color:red;'>❌ Access Denied</h2><p>Incorrect Authorization PIN.</p><br><a href='/'>Try again</a></body>");
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
        res.send("<body style='text-align:center;font-family:sans-serif;padding-top:100px;'><h1>✔️</h1><h2>Request Sent!</h2><p>Tell the customer to check their phone.</p><br><a href='/' style='padding:10px 20px; background:#007bff; color:white; border-radius:5px; text-decoration:none;'>Next Customer</a></body>");
    } catch (err) {
        res.status(500).send("Error: " + (err.response ? JSON.stringify(err.response.data) : err.message));
    }
});
app.listen(process.env.PORT || 3000);
