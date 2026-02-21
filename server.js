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
        <head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="font-family:sans-serif; background:#f0f2f5; display:flex; justify-content:center; align-items:center; height:100vh; margin:0;">
            <form action="/push" method="POST" style="background:white; padding:30px; border-radius:20px; width:90%; max-width:400px;">
                <h2 style="text-align:center;">Shop Payment</h2>
                <input type="password" name="password" placeholder="PIN (Try 5566)" required style="width:100%; padding:15px; margin:10px 0; border:1px solid #ddd; border-radius:10px;">
                <input type="number" name="phone" placeholder="2547..." required style="width:100%; padding:15px; margin:10px 0; border:1px solid #ddd; border-radius:10px;">
                <input type="number" name="amount" placeholder="Amount" required style="width:100%; padding:15px; margin:10px 0; border:1px solid #ddd; border-radius:10px;">
                <button type="submit" style="width:100%; padding:15px; background:#28a745; color:white; border:none; border-radius:10px; font-weight:bold;">SEND PUSH</button>
            </form>
        </body>
        </html>
    `);
});

app.post('/push', async (req, res) => {
    const { phone, amount, password } = req.body;
    if (password != "5566") { 
        return res.send("<h2>❌ Wrong PIN! You entered: " + password + "</h2><a href='/'>Try again</a>");
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
        res.send("<h2>✔️ Success! Push Sent.</h2><a href='/'>Back</a>");
    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
});
app.listen(process.env.PORT || 3000);
