const express = require('express');
const axios = require('axios');
require('dotenv').config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let transactions = []; 
let systemLocked = false;
let activeSessions = [{ device: "Admin Terminal", location: "Nairobi, KE", status: "Secure" }];

const getKenyaTime = () => new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' });

app.get('/api/status', (req, res) => {
    const successful = transactions.filter(t => t.status.includes('Successful'));
    const todayTotal = successful.reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
    res.json({ 
        transactions, todayTotal, 
        sessions: activeSessions, systemLocked,
        analytics: { growth: (todayTotal * 0.12).toFixed(2), volume: successful.length }
    });
});

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Electronic Pay | Global Control</title>
    <style>
        :root { --cobalt: #0047AB; --emerald: #28a745; --slate: #1e293b; --glass: rgba(255,255,255,0.9); --danger: #ef4444; }
        body { font-family: 'Inter', sans-serif; background: #f4f7fe; margin: 0; padding-bottom: 100px; }
        .top-nav { position: fixed; top: 0; width: 100%; height: 60px; background: white; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; box-sizing: border-box; z-index: 2000; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .tab-content { display: none; padding: 80px 15px 20px 15px; animation: fadeIn 0.3s; }
        .active-tab { display: block; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .smart-hub { background: white; border-radius: 20px; padding: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); margin-bottom: 15px; }
        .bottom-nav { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); width: 95%; max-width: 450px; background: var(--glass); backdrop-filter: blur(15px); height: 75px; border-radius: 30px; display: flex; justify-content: space-around; align-items: center; box-shadow: 0 10px 40px rgba(0,0,0,0.2); z-index: 2000; border: 1px solid rgba(255,255,255,0.4); }
        .nav-item { text-align: center; color: #94a3b8; cursor: pointer; flex: 1; }
        .nav-item.active { color: var(--cobalt); font-weight: bold; }
        .toggle-row { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #f1f5f9; }
        .shield-active { color: var(--emerald); font-weight: bold; font-size: 11px; }
    </style>
</head>
<body>
    <div class="top-nav">
        <div style="font-size: 22px;">☰</div>
        <div style="font-weight: 900;">GLOBAL <span style="color:var(--cobalt)">SETTINGS</span></div>
        <div id="shield-status" class="shield-active">🛡️ SHIELD: ON</div>
    </div>

    <div id="tab-vault" class="tab-content active-tab">
        <div class="smart-hub">
            <h3 style="margin-top:0;">STK Command</h3>
            <form action="/push" method="POST">
                <input type="password" name="password" placeholder="PIN" style="width:100%; padding:15px; margin:8px 0; border:1px solid #ddd; border-radius:12px; box-sizing:border-box;">
                <input type="number" name="phone" placeholder="2547..." style="width:100%; padding:15px; margin:8px 0; border:1px solid #ddd; border-radius:12px; box-sizing:border-box;">
                <input type="number" name="amount" placeholder="Amount" style="width:100%; padding:15px; margin:8px 0; border:1px solid #ddd; border-radius:12px; box-sizing:border-box;">
                <button type="submit" style="width:100%; padding:18px; background:var(--emerald); color:white; border:none; border-radius:12px; font-weight:900;">AUTHORIZE</button>
            </form>
        </div>
    </div>

    <div id="tab-global" class="tab-content">
        <div class="smart-hub">
            <h4 style="margin-top:0;">System Shield Management</h4>
            <div class="toggle-row">
                <span>Invisible Fraud Shield</span>
                <input type="checkbox" checked onchange="alert('Shield Protocol Locked')">
            </div>
            <div class="toggle-row">
                <span>Environment Isolation</span>
                <input type="checkbox" checked>
            </div>
            <div class="toggle-row">
                <span>Maintenance System Lock</span>
                <input type="checkbox" id="lock-toggle">
            </div>
            <hr style="opacity:0.1; margin: 15px 0;">
            <div style="font-size: 11px; color: #64748b;">
                Active Environment: <b>Production v2.04</b><br>
                Uptime: 99.9% Logic Healthy
            </div>
        </div>
    </div>

    <nav class="bottom-nav">
        <div class="nav-item active" onclick="tab('vault', this)">🏛️<br><small>Vault</small></div>
        <div class="nav-item" onclick="tab('global', this)">⚙️<br><small>Global</small></div>
    </nav>

    <script>
        function tab(id, el) {
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active-tab'));
            document.getElementById('tab-' + id).classList.add('active-tab');
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            el.classList.add('active');
        }
        async function updatePulse() {
            try {
                const res = await fetch('/api/status');
                const data = await res.json();
                if(data.systemLocked) document.body.style.opacity = "0.5";
            } catch(e) {}
        }
        setInterval(updatePulse, 5000);
    </script>
</body>
</html>
    `);
});

app.post('/push', async (req, res) => {
    const { phone, amount, password } = req.body;
    if (password !== "5566") return res.status(403).send("Shield Block: Invalid PIN");
    try {
        const response = await axios.post('https://paynecta.co.ke/api/v1/payment/initialize', {
            code: process.env.PAYMENT_CODE, mobile_number: phone, amount: amount, 
            email: "princealwyne7@gmail.com", callback_url: "https://electronic-pay.onrender.com/callback"
        }, { headers: { 'X-API-Key': process.env.PAYNECTA_KEY } });
        transactions.unshift({ id: Date.now(), phone, amount, status: 'Processing... 🔄', time: getKenyaTime() });
        res.redirect('/');
    } catch (err) { res.status(500).send("Shield Block: API Unreachable"); }
});

app.post('/callback', (req, res) => {
    let tx = transactions.find(t => JSON.stringify(req.body).includes(String(t.phone)));
    if (tx) { tx.status = "Successful ✅"; }
    res.sendStatus(200);
});

app.listen(process.env.PORT || 3000);
