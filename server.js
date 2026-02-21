const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send(`
        <body style="font-family:sans-serif; text-align:center; padding-top:50px; background:#f0f2f5;">
            <div style="display:inline-block; background:white; padding:30px; border-radius:15px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <h2 style="color:#1a73e8;">Electronic Shop Payment</h2>
                <form action="/push" method="POST">
                    <input type="text" name="phone" placeholder="Phone (e.g. 254712345678)" required 
                           style="width:100%; padding:12px; margin:10px 0; border:1px solid #ddd; border-radius:8px;"><br>
                    <input type="number" name="amount" placeholder="Amount (KES)" required 
                           style="width:100%; padding:12px; margin:10px 0; border:1px solid #ddd; border-radius:8px;"><br>
                    <button type="submit" style="width:100%; padding:12px; background:#28a745; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">
                        SEND STK PUSH
                    </button>
                </form>
            </div>
        </body>
    `);
});

app.post('/push', async (req, res) => {
    const { phone, amount } = req.body;
    try {
        const response = await axios.post('https://paynecta.co.ke/api/v1/payment/initialize', {
            code: process.env.PAYMENT_CODE,
            mobile_number: phone,
            amount: amount,
            email: "princealwyne7@gmail.com" // Added your email here to satisfy the API
        }, {
            headers: {
                'X-API-Key': process.env.PAYNECTA_KEY,
                'Content-Type': 'application/json'
            }
        });

        res.send("<h2>Push Sent!</h2><p>Ask customer to check their phone for the M-Pesa popup.</p><a href='/'>Go Back</a>");
    } catch (err) {
        res.status(500).send("Error: " + (err.response ? JSON.stringify(err.response.data) : err.message));
    }
});

app.listen(process.env.PORT || 3000, () => console.log('Server running...'));
