const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// YOUR SECRET PASSWORD
const SHOP_PASSWORD = "5566"; 

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: sans-serif; background: #f0f2f5; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .container { background: white; width: 90%; max-width: 450px; padding: 30px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); text-align: center; }
                input { width: 100%; padding: 15px; margin: 10px 0; border: 2px solid #ddd; border-radius: 10px; font-size: 18px; box-sizing: border-box; }
                button { width: 100%; padding: 18px; background: #28a745; color: white; border: none; border-radius: 10px; font-size: 20px; font-weight: bold; cursor: pointer; }
                .hidden { display: none; }
            </style>
        </head>
        <body>
            <div class="container">
                <div id="login-section">
                    <h2>Shop Login</h2>
                    <input type="password" id="passInput" placeholder="Enter Shop PIN">
                    <button onclick="checkPass()">Login</button>
                </div>

                <div id="pay-section" class="hidden">
                    <h2>Electronic Shop Pay</h2>
                    <form action="/push" method="POST">
                        <input type="number" name="phone" placeholder="2547XXXXXXXX" required>
                        <input type="number" name="amount" placeholder="Amount (KES)" required>
                        <button type="submit">SEND STK PUSH</button>
                    </form>
                </div>
            </div>

            <script>
                function checkPass() {
                    const pin = document.getElementById('passInput').value;
                    if(pin === "") {
                        document.getElementById('login-section').classList.add('hidden');
                        document.getElementById('pay-section').classList.remove('hidden');
                    } else {
                        alert("Wrong PIN! Only authorized staff can use this.");
                    }
                }
            </script>
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
                <h2 style="color:#28a745;">✔️ Push Sent!</h2>
                <a href="/" style="padding:15px; background:#1a73e8; color:white; border-radius:10px; text-decoration:none;">DONE</a>
            </body>
        `);
    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
});

app.listen(process.env.PORT || 3000, () => console.log('Server running...'));
