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
                body { font-family: -apple-system, sans-serif; background: #f0f2f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
                .container { background: white; padding: 40px; border-radius: 30px; width: 90%; max-width: 450px; box-shadow: 0 15px 35px rgba(0,0,0,0.1); text-align: center; margin: 20px; }
                
                .profile-pic { 
                    width: 180px; 
                    height: 180px; 
                    border-radius: 50%; 
                    object-fit: cover; 
                    border: 6px solid #28a745; 
                    margin-bottom: 20px;
                    box-shadow: 0 6px 15px rgba(0,0,0,0.15);
                }

                h2 { color: #333; margin: 0 0 25px 0; font-size: 28px; font-weight: 800; }
                label { display: block; text-align: left; font-weight: bold; color: #555; margin: 15px 0 5px 5px; font-size: 16px; }
                input { width: 100%; padding: 20px; margin-bottom: 10px; border: 2px solid #eee; border-radius: 15px; font-size: 18px; box-sizing: border-box; transition: 0.3s; }
                input:focus { border-color: #28a745; outline: none; background: #f9fff9; }
                button { width: 100%; padding: 22px; background: #28a745; color: white; border: none; border-radius: 15px; font-size: 22px; font-weight: bold; cursor: pointer; margin-top: 20px; box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3); }
                button:active { transform: scale(0.97); }
                .footer { margin-top: 25px; font-size: 12px; color: #aaa; text-transform: uppercase; letter-spacing: 1px; }
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
                <div class="footer">Secure Payment Portal</div>
            </div>
        </body>
        </html>
    `);
});

app.post('/push', async (req, res) => {
    const { phone, amount, password } = req.body;
    if (String(password).trim() !== "5566") { 
        return res.send("<body style='text-align:center;font-family:sans-serif;padding-top:100px;'><h2>❌ Access Denied</h2><a href='/'>Try again</a></body>");
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
        res.send("<body style='text-align:center;font-family:sans-serif;padding-top:100px;'><h1>✔️</h1><h2>Request Sent!</h2><p>Customer should enter PIN.</p><br><a href='/'>Next Sale</a></body>");
    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
});
app.listen(process.env.PORT || 3000);
