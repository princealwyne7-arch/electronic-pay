const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let transactions = [];
const PAYNECTA_KEY = "hmp_AegEZDHxA8uOAel2wp3ttkpK4FeBPwVa6bNiJcfE";
const PAYMENT_CODE = "PNT_957342";

app.get('/api/status', (req, res) => {
    const todayTotal = transactions.filter(t => t.status.includes('Successful')).reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
    res.json({ transactions, todayTotal });
});

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <style>
        :root { --primary: #28a745; --bg: #f8fafc; --dark: #1e293b; }
        body { font-family: sans-serif; background: var(--bg); margin: 0; padding-bottom: 80px; }
        .top-banner { width: 100%; background: linear-gradient(135deg, #28a745, #1e7e34); padding: 40px 0; border-radius: 0 0 30px 30px; display: flex; justify-content: center; position: relative; }
        .profile-pic { width: 80px; height: 80px; border-radius: 50%; border: 3px solid white; background: white; }
        .page { display: none; padding: 20px; }
        .page.active { display: block; }
        .card { background: white; padding: 20px; border-radius: 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); margin-bottom: 15px; }
        .btn-send { width: 100%; padding: 15px; background: var(--primary); color: white; border: none; border-radius: 12px; font-weight: bold; font-size: 16px; }
        input, select { width: 100%; padding: 12px; margin-bottom: 10px; border: 1px solid #e2e8f0; border-radius: 10px; box-sizing: border-box; }
        .nav-bar { position: fixed; bottom: 0; width: 100%; background: white; display: flex; border-top: 1px solid #eee; padding: 10px 0; }
        .nav-item { flex: 1; text-align: center; color: #94a3b8; font-size: 11px; text-decoration: none; }
        .nav-item.active { color: var(--primary); }
        /* Tech Tools Styling */
        .tech-box { background: #0f172a; color: #10b981; padding: 12px; border-radius: 10px; font-family: monospace; font-size: 12px; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="top-banner">
        <img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" class="profile-pic">
    </div>

    <div id="home" class="page active">
        <h2>Electronic Pay</h2>
        <div class="card">
            <div id="dailyTotal" style="color:var(--primary); font-weight:bold; margin-bottom:10px;">Today: KES 0</div>
            <form action="/push" method="POST">
                <input type="password" name="password" placeholder="Manager PIN" required>
                <input type="number" name="phone" placeholder="2547..." required>
                <input type="number" name="amount" placeholder="Amount" required>
                <button type="submit" class="btn-send">SEND STK PUSH</button>
            </form>
        </div>
    </div>

    <div id="activity" class="page">
        <h2>Activity</h2>
        <div id="history-list" class="card">No transactions yet.</div>
    </div>

    <div id="calc" class="page">
        <h2>Calculator</h2>
        <div class="card" style="background:#1e293b; color:white;">
            <div id="disp" style="text-align:right; font-size:24px; margin-bottom:10px;">0</div>
            <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:8px;">
                <button onclick="c('C')" style="padding:15px; background:#64748b; border:none; border-radius:8px; color:white;">C</button>
                <button onclick="c('/')" style="padding:15px; background:var(--primary); border:none; border-radius:8px; color:white;">÷</button>
                </div>
        </div>
    </div>

    <div id="more" class="page">
        <h2>Advanced Tools</h2>
        <div class="card">
            <p style="font-weight:bold; color:var(--primary);">🔔 Sound Notifications</p>
            <select id="successSnd">
                <option value="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3">Classic Chime ✅</option>
            </select>
            <select id="errorSnd">
                <option value="https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3">Titititi Alert ⚠️</option>
            </select>
        </div>
        
        <div class="card" style="border-left: 4px solid #3b82f6;">
            <p style="color:#3b82f6; font-weight:bold;">🚀 System Health</p>
            <div class="tech-box">
                <div>API Status: <span style="color:#22c55e;">ONLINE</span></div>
                <div>Encrypted: <span style="color:#3b82f6;">AES-256</span></div>
                <div>Uptime: <span id="uptime">00:00:00</span></div>
            </div>
        </div>
    </div>

    <nav class="nav-bar">
        <div class="nav-item active" onclick="sP('home', this)">🏠<br>Home</div>
        <div class="nav-item" onclick="sP('activity', this)">📊<br>Activity</div>
        <div class="nav-item" onclick="sP('calc', this)">🧮<br>Calc</div>
        <div class="nav-item" onclick="sP('more', this)">⚙️<br>More</div>
    </nav>

    <script>
        function sP(id, el) {
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            document.getElementById(id).classList.add('active');
            el.classList.add('active');
        }
        function c(v) { /* Calculator Logic */ }
        async function update() {
            const res = await fetch('/api/status');
            const data = await res.json();
            document.getElementById('dailyTotal').innerText = 'Today: KES ' + data.todayTotal;
        }
        setInterval(update, 3000);
    </script>
</body>
</html>
    `);
});

app.post('/push', async (req, res) => {
    const { phone, amount, password } = req.body;
    if (password !== "5566") return res.send("Invalid PIN");
    try {
        await axios.post('https://paynecta.co.ke/api/v1/payment/initialize', {
            code: PAYMENT_CODE, mobile_number: phone, amount: amount, email: "admin@pay.com"
        }, { headers: { 'X-API-Key': PAYNECTA_KEY } });
        transactions.unshift({ id: Date.now(), phone, amount, status: 'Processing... 🔄' });
        res.redirect('/');
    } catch (e) { res.send(e.message); }
});

app.listen(process.env.PORT || 3000);
