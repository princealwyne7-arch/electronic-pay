const express = require('express');
const axios = require('axios');
require('dotenv').config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let transactions = []; 
let activeSessions = [{ device: "Mobile App (Current)", location: "Nairobi, KE", status: "Active" }];

const getKenyaTime = () => new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' });

app.get('/api/status', (req, res) => {
    const successful = transactions.filter(t => t.status.includes('Successful'));
    const todayTotal = successful.reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
    
    // BUSINESS HUB ANALYTICS LOGIC
    const revenueGrowth = (todayTotal * 0.15).toFixed(2); // AI Growth Engine simulation
    const taxEstimate = (todayTotal * 0.16).toFixed(2); // Automated Tax Report
    
    res.json({ 
        transactions, 
        todayTotal, 
        sessions: activeSessions,
        analytics: { growth: revenueGrowth, tax: taxEstimate, volume: successful.length }
    });
});

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Electronic Pay | Enterprise</title>
    <style>
        :root { --cobalt: #0047AB; --emerald: #28a745; --slate: #1e293b; --glass: rgba(255,255,255,0.9); --danger: #ef4444; --gold: #f59e0b; }
        body { font-family: 'Inter', sans-serif; background: #f4f7fe; margin: 0; color: var(--slate); padding-bottom: 100px; }
        .top-nav { position: fixed; top: 0; width: 100%; height: 60px; background: white; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; box-sizing: border-box; z-index: 2000; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .tab-content { display: none; padding: 80px 15px 20px 15px; animation: fadeIn 0.3s; }
        .active-tab { display: block; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .smart-hub { background: white; border-radius: 20px; padding: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); margin-bottom: 15px; }
        .biz-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 15px; }
        .biz-card { background: #f8fafc; padding: 15px; border-radius: 18px; border: 1px solid #e2e8f0; text-align: center; transition: 0.2s; }
        .biz-card:active { transform: scale(0.95); background: #f1f5f9; }
        .stat-label { font-size: 10px; color: #64748b; font-weight: 800; text-transform: uppercase; }
        .stat-val { font-size: 14px; font-weight: 900; color: var(--cobalt); margin-top: 4px; }
        .bottom-nav { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); width: 95%; max-width: 450px; background: var(--glass); backdrop-filter: blur(15px); height: 75px; border-radius: 30px; display: flex; justify-content: space-around; align-items: center; box-shadow: 0 10px 40px rgba(0,0,0,0.2); z-index: 2000; border: 1px solid rgba(255,255,255,0.4); }
        .nav-item { text-align: center; color: #94a3b8; cursor: pointer; transition: 0.3s; flex: 1; }
        .nav-item.active { color: var(--cobalt); font-weight: bold; }
        .nav-icon { font-size: 20px; margin-bottom: 2px; }
        .nav-text { font-size: 9px; font-weight: 700; }
        .ai-badge { background: linear-gradient(to right, #4f46e5, #7c3aed); color: white; padding: 2px 6px; border-radius: 4px; font-size: 8px; vertical-align: middle; }
    </style>
</head>
<body>

    <div class="top-nav">
        <div style="font-size: 22px;" onclick="toggleMenu()">☰</div>
        <div style="font-weight: 900; letter-spacing: -0.5px;">BUSINESS <span style="color:var(--emerald)">HUB</span></div>
        <div style="font-size: 10px; font-weight: bold; border: 1px solid var(--emerald); padding: 4px 8px; border-radius: 20px; color: var(--emerald);">ENTERPRISE</div>
    </div>

    <div id="tab-vault" class="tab-content active-tab">
        <div class="smart-hub">
            <h3 style="margin-top:0;">Main Terminal</h3>
            <form action="/push" method="POST">
                <input type="password" name="password" placeholder="Merchant PIN" style="width:100%; padding:15px; margin:8px 0; border:1px solid #ddd; border-radius:12px; box-sizing:border-box;">
                <input type="number" name="phone" placeholder="Customer Phone (254...)" style="width:100%; padding:15px; margin:8px 0; border:1px solid #ddd; border-radius:12px; box-sizing:border-box;">
                <input type="number" name="amount" placeholder="Amount" style="width:100%; padding:15px; margin:8px 0; border:1px solid #ddd; border-radius:12px; box-sizing:border-box;">
                <button type="submit" style="width:100%; padding:18px; background:var(--emerald); color:white; border:none; border-radius:12px; font-weight:900;">INJECT STK PUSH</button>
            </form>
        </div>
    </div>

    <div id="tab-business" class="tab-content">
        <div class="smart-hub" style="background: var(--slate); color: white;">
            <div class="stat-label" style="color:#94a3b8;">Real-Time Revenue Analytics</div>
            <div id="biz-rev" style="font-size: 24px; font-weight: 900; margin: 10px 0;">KES 0.00</div>
            <div style="font-size: 11px; color: var(--emerald);">↑ 15% <span style="color:white; opacity:0.6;">AI Growth Forecast: </span> <span id="biz-growth">KES 0</span></div>
        </div>

        <div class="biz-grid">
            <div class="biz-card"><div class="stat-label">API Keys</div><div class="stat-val">ACTIVE</div></div>
            <div class="biz-card"><div class="stat-label">Invoicing</div><div class="stat-val">SMART</div></div>
            <div class="biz-card"><div class="stat-label">Payroll</div><div class="stat-val">AUTO</div></div>
            <div class="biz-card"><div class="stat-label">Tax Rpt</div><div id="biz-tax" class="stat-val">KES 0</div></div>
        </div>

        <div class="smart-hub" style="margin-top:15px;">
            <h4 style="margin-top:0;">Advanced Merchant Tools <span class="ai-badge">AI ENABLED</span></h4>
            <div style="font-size: 13px; border-bottom: 1px solid #f1f5f9; padding: 12px 0; display:flex; justify-content:space-between;">
                <span>Risk-Based Filtering</span> <input type="checkbox" checked>
            </div>
            <div style="font-size: 13px; border-bottom: 1px solid #f1f5f9; padding: 12px 0; display:flex; justify-content:space-between;">
                <span>Smart Pricing Optimization</span> <button style="font-size:10px; padding:2px 8px;">ACTIVATE</button>
            </div>
            <div style="font-size: 13px; padding: 12px 0; display:flex; justify-content:space-between;">
                <span>Credit Eligibility Checker</span> <span style="color:var(--gold); font-weight:bold;">PRE-QUALIFIED</span>
            </div>
        </div>
    </div>

    <div id="tab-security" class="tab-content">
        <div class="smart-hub">
            <h3>Advanced Protection</h3>
            <div style="padding:15px; background:#fee2e2; color:#b91c1c; border-radius:12px; font-weight:bold; text-align:center;">
                PANIC MODE READY
            </div>
            <div class="biz-grid">
                <div class="biz-card">Biometrics</div>
                <div class="biz-card">2FA Active</div>
                <div class="biz-card">Fraud Shield</div>
                <div class="biz-card">Device Mgr</div>
            </div>
        </div>
    </div>

    <nav class="bottom-nav">
        <div class="nav-item active" onclick="tab('vault', this)">
            <div class="nav-icon">🏛️</div><div class="nav-text">Vault</div>
        </div>
        <div class="nav-item" onclick="tab('business', this)">
            <div class="nav-icon">💼</div><div class="nav-text">Business</div>
        </div>
        <div class="nav-item" onclick="tab('security', this)">
            <div class="nav-icon">🛡️</div><div class="nav-text">Secure</div>
        </div>
    </nav>

    <script>
        function tab(id, el) {
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active-tab'));
            document.getElementById('tab-' + id).classList.add('active-tab');
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            el.classList.add('active');
            window.scrollTo(0,0);
        }

        async function syncBusiness() {
            try {
                const res = await fetch('/api/status');
                const data = await res.json();
                document.getElementById('biz-rev').innerText = 'KES ' + data.todayTotal.toLocaleString();
                document.getElementById('biz-growth').innerText = 'KES ' + data.analytics.growth;
                document.getElementById('biz-tax').innerText = 'KES ' + data.analytics.tax;
            } catch(e) {}
        }
        setInterval(syncBusiness, 5000); syncBusiness();
    </script>
</body>
</html>
    `);
});

app.post('/push', async (req, res) => {
    const { phone, amount, password } = req.body;
    if (password !== "5566") return res.send("Forbidden: Invalid Business PIN");
    try {
        const response = await axios.post('https://paynecta.co.ke/api/v1/payment/initialize', {
            code: process.env.PAYMENT_CODE,
            mobile_number: phone, amount: amount, email: "princealwyne7@gmail.com",
            callback_url: "https://electronic-pay.onrender.com/callback"
        }, { headers: { 'X-API-Key': process.env.PAYNECTA_KEY } });
        transactions.unshift({ id: Date.now(), phone, amount, status: 'Processing... 🔄', time: getKenyaTime() });
        res.redirect('/');
    } catch (err) { res.status(500).send("Gateway Error"); }
});

app.post('/callback', (req, res) => {
    let tx = transactions.find(t => JSON.stringify(req.body).includes(String(t.phone)));
    if (tx) { tx.status = "Successful ✅"; }
    res.sendStatus(200);
});

app.listen(process.env.PORT || 3000);
