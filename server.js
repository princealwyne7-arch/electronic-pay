const express = require('express');
const axios = require('axios');
require('dotenv').config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let history = [];

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>
    body { font-family: sans-serif; background: #f0f2f5; padding: 20px; text-align: center; }
    .card { background: white; padding: 20px; border-radius: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); max-width: 400px; margin: auto; }
    input { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box; }
    button { width: 100%; padding: 15px; background: #28a745; color: white; border: none; border-radius: 8px; font-weight: bold; }
    .tx { border-bottom: 1px solid #eee; padding: 10px; text-align: left; }
    </style></head><body>
    <div class="card">
        <h2>Electronic Pay</h2>
        <form action="/push" method="POST">
            <input type="password" name="password" placeholder="PIN" required>
            <input type="number" name="phone" placeholder="2547..." required>
            <input type="number" name="amount" placeholder="Amount" required>
            <button type="submit">SEND STK PUSH</button>
        </form>
        <hr>
        <h4>Recent Activity</h4>
        <div id="logs"></div>
    </div>
    <script>
        setInterval(async () => {
            const r = await fetch('/history');
            const d = await r.json();
            document.getElementById('logs').innerHTML = d.map(t => \`
                <div class="tx"><b>\${t.phone}</b>: KES \${t.amount}<br><small>\${t.status}</small></div>
            \`).join('');
        }, 3000);
    </script></body></html>`);
});

app.get('/history', (req, res) => { res.json(history.slice(-5)); });

app.post('/push', async (req, res) => {
    const { phone, amount, password } = req.body;
    if (password !== "5566") return res.send("Wrong PIN");
    try {
        await axios.post('https://paynecta.co.ke/api/v1/payment/initialize', {
            code: process.env.PAYMENT_CODE, mobile_number: phone, amount: amount,
            email: "admin@test.com", callback_url: "https://electronic-pay.onrender.com/callback"
        }, { headers: { 'X-API-Key': process.env.PAYNECTA_KEY } });
        history.push({ phone, amount, status: 'Processing... 🔄' });
        res.redirect('/');
    } catch (err) { res.status(500).send(err.message); }
});

app.post('/callback', (req, res) => {
    const phone = req.body.mobile_number;
    const tx = history.find(t => t.phone == phone && t.status.includes('Processing'));
    if (tx) tx.status = "Completed ✅";
    res.sendStatus(200);
});

app.listen(process.env.PORT || 3000);
