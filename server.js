const express = require("express");
const axios = require("axios");
require("dotenv").config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let transactions = [];
const getKenyaTime = () => new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' });

app.get('/api/status', (req, res) => {
    const todayTotal = transactions.filter(t => t.status.includes('Successful')).reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
    res.json({ transactions, todayTotal });
});

app.post('/push', async (req, res) => {
    const { phone, amount, password } = req.body;
    if (password !== "5566") return res.status(403).send("Unauthorized");
    try {
        await axios.post('https://paynecta.co.ke/api/v1/payment/initialize', {
            code: process.env.PAYMENT_CODE,
            mobile_number: phone,
            amount: amount,
            email: "princealwyne7@gmail.com",
            callback_url: "https://electronic-pay.onrender.com/callback"
        }, { headers: { 'X-API-Key': process.env.PAYNECTA_KEY, 'Content-Type': 'application/json' } });
        transactions.unshift({ id: Date.now(), phone, amount, status: 'Processing...', time: getKenyaTime() });
        res.redirect('/');
    } catch (err) { res.status(500).send(err.message); }
});

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Electronic Pay</title>
    <style>
        :root { --primary: #0f172a; --accent: #28a745; --bg: #f8fafc; }
        body { margin:0; font-family: sans-serif; background: var(--bg); padding-bottom: 80px; }
        .topbar { background: white; padding: 15px; display: flex; align-items: center; gap: 10px; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .tab-content { display: none; padding: 20px; }
        .active-tab { display: block; }
        .card { background: white; border-radius: 15px; padding: 20px; margin-bottom: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.03); }
        input { width: 100%; padding: 12px; margin: 8px 0; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box; }
        button { width: 100%; padding: 15px; background: var(--accent); color: white; border: none; border-radius: 8px; font-weight: bold; }
        .nav { position: fixed; bottom: 0; width: 100%; background: white; display: flex; height: 65px; border-top: 1px solid #eee; }
        .nav-item { flex: 1; text-align: center; padding-top: 12px; color: #94a3b8; font-size: 12px; cursor: pointer; }
        .nav-item.active { color: var(--primary); font-weight: bold; }
        .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f9f9f9; }
    </style>
</head>
<body>
    <div class="topbar"><span>☰</span> Electronic <span style="color:var(--accent)">Pay</span></div>

    <div id="dash" class="tab-content active-tab">
        <div class="card" style="background:var(--primary); color:white;">
            <small>REVENUE</small>
            <h1 id="totalRev">KES 0</h1>
        </div>
        <div class="card">
            <form action="/push" method="POST">
                <input type="password" name="password" placeholder="PIN">
                <input type="number" name="phone" placeholder="254...">
                <input type="number" name="amount" placeholder="Amount">
                <button type="submit">AUTHORIZE</button>
            </form>
        </div>
        <div id="feed"></div>
    </div>

    <div id="vault" class="tab-content">
        <div class="card">
            <h3>Vault Settings</h3>
            <div class="row"><span>Multi-Currency</span><b>Active</b></div>
            <div class="row"><span>Language</span><b>EN</b></div>
            <div class="row"><span>Exchange Rate Lock</span><b>AI</b></div>
            <div class="row"><span>Compliance Audit</span><b>Secure</b></div>
        </div>
    </div>

    <div id="insights" class="tab-content"><div class="card"><h3>Insights Dashboard</h3></div></div>
    <div id="security" class="tab-content"><div class="card"><h3>Security Core</h3></div></div>

    <div class="nav">
        <div class="nav-item active" onclick="go('dash', this)">Dash</div>
        <div class="nav-item" onclick="go('vault', this)">Vault</div>
        <div class="nav-item" onclick="go('insights', this)">Insights</div>
        <div class="nav-item" onclick="go('security', this)">Security</div>
    </div>

    <script>
        function go(id, el) {
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active-tab'));
            document.getElementById(id).classList.add('active-tab');
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            el.classList.add('active');
        }
        async function sync() {
            const r = await fetch('/api/status');
            const d = await r.json();
            document.getElementById('totalRev').innerText = 'KES ' + d.todayTotal;
        }
        setInterval(sync, 4000);
    </script>
</body>
</html>
    `);
});
app.listen(process.env.PORT || 3000);
